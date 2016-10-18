sGis.module('geotools', ['math', 'utils', 'CRS'], function(math, utils, /** sGis.CRS */ CRS) {
    'use strict';

    /**
     * @namespace sGis.geotools
     */
    var geotools = {};

    /**
     * Finds distance between two geographical points. If the coordinate system of the points can be projected to the
     * wgs84 crs, the distance will be calculated on a sphere with radius 6,371,009 meters (mean radius of the Earth).
     * @param {sGis.IPoint} a
     * @param {sGis.IPoint} b
     * @returns {Number}
     */
    geotools.distance = function (a, b) {
        if (a.crs.canProjectTo(CRS.wgs84)) {
            let p1 = a.projectTo(CRS.wgs84);
            let p2 = b.projectTo(CRS.wgs84);
            let lat1 = math.degToRad(p1.y);
            let lat2 = math.degToRad(p2.y);
            let dLat = lat2 - lat1;
            let dLon = math.degToRad(p2.x - p1.x);

            let d = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
            let c = 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1-d));
            let R = 6371009;

            var l = R * c;
        } else {
            l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }

        return l;
    };

    /**
     * 
     * @param geometry
     * @param crs
     * @returns {number}
     */
    geotools.length = function(geometry, crs) {
        let coord = geometry.rings ? geometry.rings : geometry;
        let length = 0;
        let ringTemp;

        crs = geometry instanceof sGis.feature.Poly ? geometry.crs : crs ? crs : sGis.CRS.geo;

        for (var ring = 0, l = coord.length; ring < l; ring++) {
            ringTemp = [].concat(coord[ring]);
            if (geometry instanceof sGis.feature.Polygon) ringTemp.push(ringTemp[0]);

            for (var i = 0, m = ringTemp.length - 1; i < m; i++) {
                length += geotools.distance(new sGis.Point(ringTemp[i], crs), new sGis.Point(ringTemp[i + 1], crs));
            }
        }

        return length;
    };

    geotools.area = function (geometry, crs) {
        var coord = geometry instanceof sGis.feature.Poly ? geometry.rings : geometry;
        crs = geometry instanceof sGis.feature.Poly ? geometry.crs : crs ? crs : sGis.CRS.geo;

        var tempFeature = new sGis.feature.Polyline(coord, {crs: crs}),
            area = 0;


        if (crs.canProjectTo(CRS.cylindricalEqualArea)) {
            var projected = tempFeature.projectTo(sGis.CRS.cylindricalEqualArea).rings;
        } else {
            projected = tempFeature.rings;
        }

        for (var ring = 0, l = projected.length; ring < l; ring++) {
            area += polygonArea(projected[ring]);
        }
        return area;
    };

    function polygonArea(coord) {
        coord = coord.concat([coord[0]]);

        var area = 0;
        for (var i = 0, l = coord.length - 1; i < l; i++) {
            area += (coord[i][0] + coord[i + 1][0]) * (coord[i][1] - coord[i + 1][1]);
        }
        return Math.abs(area / 2);
    }

    geotools.pointToLineProjection = function (point, line) {
        if (line[0][0] === line[1][0]) {
            return [line[0][0], point[1]];
        } else if (line[0][1] === line[1][1]) {
            return [point[0], line[0][1]];
        } else {
            var lx = line[1][0] - line[0][0],
                ly = line[1][1] - line[0][1],
                dx = line[0][0] - point[0],
                dy = line[0][1] - point[1],
                t = -(dx * lx + dy * ly) / (lx * lx + ly * ly),
                x = line[0][0] + t * lx,
                y = line[0][1] + t * ly;
            return [x, y];
        }
    };

    /**
     * Checks if a point is located inside a polygon.
     * @param {Number[]} polygon - coordinates of polygon in format [[[x11, y11], [x12, y12], ...], [x21, y21], [x22, y22], ...], ...]. If there is only one counter outer array can be omitted.
     * @param {number[]} point - coordinates of the point [x, y]
     * @param {Number} [tolerance=0] - the tolerance of check. If the point is out of the polygon, but is closer then tolerance, the returned result will be true.
     * @returns {boolean|Array} - true, if the point is inside of polygon, [ring, index] - index of vertex if the point is closer then 'tolerance' to one of the sides of polygon, false otherwise
     */
    geotools.contains = function (polygon, point, tolerance) {
        sGis.utils.validate(polygon[0], 'array');
        sGis.utils.validate(point, 'array');
        tolerance = tolerance || 0;
        var intersectionCount = 0;

        var polygonCoord = polygon[0][0][0] === undefined ? [polygon] : polygon;
        for (var ring = 0, l = polygonCoord.length; ring < l; ring++) {
            var points = polygonCoord[ring].concat([polygonCoord[ring][0]]),
                prevD = points[0][0] > point[0],
                prevH = points[0][1] > point[1];

            for (var i = 1; i < points.length; i++) {
                if (geotools.pointToLineDistance(point, [points[i - 1], points[i]]) <= tolerance) {
                    return [ring, i - 1];
                }

                var D = points[i][0] > point[0],
                    H = points[i][1] > point[1];

                if (H !== prevH //otherwise line does not intersect horizontal line
                    && (D > 0 || prevD > 0) //line is to the left from the point, but we look to the right
                ) {
                    if (!(point[1] === points[i][1] && point[1] === points[i - 1][1])) { //checks if line is horizontal and has same Y with point
                        if (geotools.intersects([[points[i][0], points[i][1]], [points[i - 1][0], points[i - 1][1]]], [point, [Math.max(points[i][0], points[i - 1][0]), point[1]]])) {
                            intersectionCount++;
                        }
                    }
                }
                prevD = D;
                prevH = H;
            }
            if (intersectionCount % 2 === 1) return true;
        }

        return false;
    };

    geotools.pointToLineDistance = function (point, line) {
        var lx = line[1][0] - line[0][0],
            ly = line[1][1] - line[0][1],
            dx = line[0][0] - point[0],
            dy = line[0][1] - point[1],
            t = 0 - (dx * lx + dy * ly) / (lx * lx + ly * ly);

        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return Math.sqrt(Math.pow(lx * t + dx, 2) + Math.pow(ly * t + dy, 2));
    };

    geotools.intersects = function (line1, line2) {
        if (line1[0][0] === line1[1][0]) {
            return line1[0][0] > line2[0][0];
        } else {
            var k = (line1[0][1] - line1[1][1]) / (line1[0][0] - line1[1][0]),
                b = line1[0][1] - k * line1[0][0],
                x = (line2[0][1] - b) / k;

            return x > line2[0][0];
        }
    };

    /**
     * Returns the angle of line relative to horizon in radians. The value can be from -PI to PI, first point is considered base point for rotation.
     * @param {number[][]} line - the line as two points: [[x1,y1], [x2,y2]]
     * @return {number}
     */
    geotools.getLineAngle = function (line) {
        if (line[0][0] === line[1][0] && line[0][1] === line[1][1]) return NaN;
        var x = line[1][0] - line[0][0];
        var y = line[1][1] - line[0][1];
        var cos = x / Math.sqrt(x * x + y * y);
        return y >= 0 ? Math.acos(cos) : -Math.acos(cos);
    };

    /**
     * Returns a point at the specified distance and angle relative to horizon from origin point
     * @param {number[]} point - origin point
     * @param {number} angle - angle in radians
     * @param {number} distance - distance
     * @returns {number[]}
     */
    geotools.getPointFromAngleAndDistance = function (point, angle, distance) {
        return [point[0] + Math.cos(angle) * distance, point[1] + Math.sin(angle) * distance];
    };

    /**
     * Returns false if polygon has self-intersection, segments of zero length or contours with less then 3 points
     * @param {sGis.feature.Polygon|number[][][]} polygon  - polygon feature or coordinates
     * @returns {boolean}
     */
    geotools.isPolygonValid = function (polygon) {
        var coordinates = (polygon instanceof sGis.feature.Polygon) ? polygon.rings : polygon;
        if (coordinates.length === 0) return false;

        for (var ring = 0; ring < coordinates.length; ring++) {
            if (coordinates[ring].length <= 2) return false;

            for (var i = 0; i < coordinates[ring].length; i++) {
                var p1 = coordinates[ring][i];
                var p2 = coordinates[ring][i + 1] || coordinates[ring][0];

                if (p1[0] == p2[0] && p1[1] === p2[1]) return false;

                if (hasIntersection(coordinates, [p1, p2], [ring, i])) return false;
            }
        }

        return true;
    };

    function hasIntersection(coordinates, line, exc) {
        for (var ring = 0; ring < coordinates.length; ring++) {
            for (var i = 0; i < coordinates[ring].length; i++) {
                if (ring === exc[0] && (Math.abs(i - exc[1]) < 2 || exc[1] === 0 && i === coordinates[ring].length - 1 || i === 0 && exc[1] === coordinates[ring].length - 1)) continue;

                if (intersects([coordinates[ring][i], coordinates[ring][i + 1] || coordinates[ring][0]], line)) return true;
            }
        }
        return false;
    }

    function intersects(l1, l2) {
        var o1 = orient(l1[0], l1[1], l2[0]);
        var o2 = orient(l1[0], l1[1], l2[1]);
        var o3 = orient(l2[0], l2[1], l1[0]);
        var o4 = orient(l2[0], l2[1], l1[1]);

        if (o1 !== o2 && o3 !== o4) return true;

        if (o1 === 0 && onSegment(l1[0], l2[0], l1[1])) return true;
        if (o2 === 0 && onSegment(l1[0], l2[1], l1[1])) return true;
        if (o3 === 0 && onSegment(l2[1], l1[0], l2[1])) return true;
        if (o4 === 0 && onSegment(l2[1], l1[1], l2[1])) return true;

        return false;
    }

    function orient(p, q, r) {
        var val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
        if (Math.abs(val) < 0.000001) return 0;
        return val > 0 ? 1 : 2;
    }

    function onSegment(p, q, r) {
        return (q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0])) &&
            (q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]));
    }
    
    geotools.transform = function(features, matrix, center) {
        if (Array.isArray(features)) {
            features.forEach(feature => transformFeature(feature, matrix, center));
        } else {
            transformFeature(features, matrix, center);
        }
    };

    /**
     * @alias sGis.geotools.rotate
     * @memberof sGis.geotools
     * @param features
     * @param angle
     * @param center
     */
    geotools.rotate = function(features, angle, center) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        geotools.transform(features, [[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center);
    };

    /**
     * @alias sGis.geotools.scale
     * @memberof sGis.geotools
     * @param features
     * @param scale
     * @param center
     */
    geotools.scale = function(features, scale, center) {
        geotools.transform(features, [[scale[0], 0, 0], [0, scale[1], 0], [0, 0, 1]], center);
    };

    geotools.move = function(features, translate) {
        geotools.transform(features, [[1, 0 ,0], [0, 1, 1], [translate[0], translate[1], 1]], [0, 0]);
    };
    
    function transformFeature(feature, matrix, center) {
        let base = center.crs ? center.projectTo(feature.crs).position : center;
        if (feature.rings) {
            let rings = feature.rings;
            transformRings(rings, matrix, base);
            feature.rings = rings;
        } else if (feature.points) {
            feature.points = transformRing(feature.points, matrix, base);
        } else if (feature.position) {
            feature.position = transformRing([feature.position], matrix, base)[0];
        }
    }
    
    function transformRings(rings, matrix, base) {
        rings.forEach((ring, index) => {
            rings[index] = transformRing(ring, matrix, base);
        });
    }
    
    function transformRing(ring, matrix, base) {
        math.extendCoordinates(ring, base);
        let transformed = math.multiplyMatrix(ring, matrix);
        math.collapseCoordinates(transformed, base);
        return transformed;
    }
    
    return geotools;
});
