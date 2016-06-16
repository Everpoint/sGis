sGis.module('geotools', ['math'], function(math) {
    'use strict';

    var geotools = {};

    geotools.distance = function (a, b) {
        if (a.crs.from) {
            var p1 = a.projectTo(sGis.CRS.geo),
                p2 = b.projectTo(sGis.CRS.geo),
                d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(math.degToRad((p2.y - p1.y) / 2)), 2) + Math.cos(math.degToRad(p1.y)) * Math.cos(math.degToRad(p2.y)) * Math.pow(Math.sin(math.degToRad((p2.x - p1.x) / 2)), 2))),
                R = 6372795,
                l = d * R;
        } else {
            var l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
        }

        return l;
    };

    geotools.length = function(geometry, crs) {
        var coord = geometry instanceof sGis.feature.Polyline ? geometry.coordinates : geometry,
            length = 0,
            ringTemp;

        crs = geometry instanceof sGis.feature.Polyline ? geometry.crs : crs ? crs : sGis.CRS.geo;

        for (var ring = 0, l = coord.length; ring < l; ring++) {
            ringTemp = [].concat(coord[ring]);
            if (geometry instanceof sGis.feature.Polygon) ringTemp.push(ringTemp[0]);

            for (var i = 0, m = ringTemp.length - 1; i < m; i++) {
                length += geotools.distance(new sGis.Point(ringTemp[i][0], ringTemp[i][1], crs), new sGis.Point(ringTemp[i + 1][0], ringTemp[i + 1][1], crs));
            }
        }

        return length;
    };

    geotools.area = function (geometry, crs) {
        var coord = geometry instanceof sGis.feature.Polyline ? geometry.coordinates : geometry;
        crs = geometry instanceof sGis.feature.Polyline ? geometry.crs : crs ? crs : sGis.CRS.geo;

        var tempFeature = new sGis.feature.Polyline(coord, {crs: crs}),
            area = 0;


        if (crs.from) {
            var projected = tempFeature.projectTo(sGis.CRS.cylindricalEqualArea).coordinates;
        } else {
            projected = tempFeature.coordinates;
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
     * @param {sGis.feature.Polygon|sGis.geom.Polygon|number[][][]} polygon  - polygon feature or coordinates
     * @returns {boolean}
     */
    geotools.isPolygonValid = function (polygon) {
        var coordinates = (polygon instanceof sGis.feature.Polygon || polygon instanceof sGis.geom.Polygon) ? polygon.coordinates : polygon;
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



    return geotools;
});

sGis.module('math', [], function() {

    /**
     * @namespace sGis.math
     */
    var math = {
        /**
         * Converts degrees to radians
         * @param {number} d - degrees
         * @memberof sGis.math
         * @returns {number}
         */
        degToRad: function (d) {
            return d / 180 * Math.PI;
        },

        /**
         * Converts radians to degrees
         * @param {number} r - radians
         * @returns {number}
         */
        radToDeg: function (r) {
            return r / Math.PI * 180;
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function softEquals(a, b) {
            return Math.abs(a - b) < math.tolerance * a;
        },

        tolerance: 0.000001
    };

    return math;
});
