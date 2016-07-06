sGis.module('PointGroup', [
    'utils',
    'feature.Point',
    'Point',
    'Bbox'
], function(utils, PointF, Point, Bbox) {
    'use strict';
    
    var PointGroup = function(points) {
        this._points = [];
        this.points = points;
    };

    PointGroup.prototype = {
        addPoint: function(point) {
            if (!(point instanceof sGis.feature.Point)) sGis.utils.error('sGis.feature.Point instance is expected but got ' + point + ' instead');
            this._points.push(point);
        },

        removePoint: function(point) {
            var index = this._points.indexOf(point);
            if (index === -1) {
                sGis.utils.error('The point is not in the group');
            }

            this._points.splice(index, 1);
        },

        transform: function(matrix, center) {
            if (center instanceof sGis.Point || center instanceof sGis.feature.Point) {
                var basePoint = center.projectTo(this.crs),
                    base = [basePoint.x, basePoint.y];
            } else if (sGis.utils.isArray(center) && sGis.utils.isNumber(center[0]) && sGis.utils.isNumber(center[1])) {
                base = [parseFloat(center[0]), parseFloat(center[1])];
            } else if (center === undefined) {
                base = this.centroid;
            } else {
                sGis.utils.error('Unknown format of center point: ' + center);
            }
            var coord = this.coordinates,
                extended = sGis.utils.extendCoordinates(coord, base),
                transformed = sGis.utils.multiplyMatrix(extended, matrix),
                result = sGis.utils.collapseCoordinates(transformed, base);

            this.coordinates = result;
        },

        rotate: function(angle, center) {
            if (!sGis.utils.isNumber(angle)) sGis.utils.error('Number is expected but got ' + angle + ' instead');

            var sin = Math.sin(angle),
                cos = Math.cos(angle);

            this.transform([[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center);
        },

        scale: function(scale, center) {
            if (sGis.utils.isNumber(scale)) {
                scale = [scale, scale];
            } else if (!sGis.utils.isArray(scale)) {
                sGis.utils.error('Number or array is expected but got ' + scale + ' instead');
            }
            this.transform([[parseFloat(scale[0]), 0, 0], [0, parseFloat(scale[1]), 0], [0, 0, 1]], center);
        }
    };

    Object.defineProperties(PointGroup.prototype, {
        points: {
            get: function() {
                return [].concat(this._points);
            },

            set: function(points) {
                this._points = [];
                for (var i = 0, l = points.length; i < l; i++) {
                    this.addPoint(points[i]);
                }
            }
        },

        coordinates: {
            get: function() {
                var coord = [],
                    crs = this.crs;
                for (var i = 0, len = this._points.length; i < len; i++) {
                    var point = this._points[i] === crs ? this._points[i] : this._points[i].projectTo(crs);
                    coord.push(point.position);
                }
                return coord;
            },

            set: function(coordinates) {
                var crs = this.crs;
                if (!crs) sGis.utils.error('Cannot assign coordinates to empty group');

                for (var i = 0, len = coordinates.length; i < len; i++) {
                    if (!this._points[i]) this._points[i] = this._points[0].clone();
                    this._points[i].coordinates = coordinates[i];
                }

                if (this._points.length > len) {
                    this._points = this._points.slice(0, len);
                }
            }
        },

        crs: {
            get: function() {
                if (this._points.length > 0) {
                    return this._points[0].crs;
                } else {
                    return undefined;
                }
            }
        },

        bbox: {
            get: function() {
                var len = this._points.length;
                if (len > 0) {
                    var xArray = [],
                        yArray = [],
                        crs = this._points[0].crs;
                    for (var i = 0; i < len; i++) {
                        xArray.push(this._points[i].x);
                        yArray.push(this._points[i].y);
                    }

                    var xmin = sGis.utils.min(xArray),
                        xmax = sGis.utils.max(xArray),
                        ymin = sGis.utils.min(yArray),
                        ymax = sGis.utils.max(yArray);

                    return new sGis.Bbox([xmin, ymin], [xmax, ymax], crs);
                } else {
                    return undefined;
                }
            }
        },

        centroid: {
            get: function() {
                var len = this._points.length;
                if (len > 0) {
                    var x = 0,
                        y = 0,
                        crs = this._points[0].crs;
                    for (var i = 0; i < len; i++) {
                        var projected = this._points[i].projectTo(crs);
                        x += projected.x;
                        y += projected.y;
                    }

                    return [x, y];
                } else {
                    return undefined;
                }
            }
        }
    });

    return PointGroup;
    
});
