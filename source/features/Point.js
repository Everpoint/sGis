sGis.module('feature.Point', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.point'
], function(utils, Feature, Crs, Point, Bbox, pointSymbols) {
    'use strict';

    /**
     * @class
     * @alias sGis.feature.Point
     * @param point
     * @param options
     * @constructor
     */
    var PointF = function (point, options) {
        this.__initialize(options);
        if (!point) sGis.utils.error('The point position is not specified');

        this._point = point;
    };

    PointF.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.point.Point,
        _crs: sGis.CRS.geo,

        projectTo: function(crs) {
            var point = new sGis.Point(this._point[0], this._point[1], this._crs),
                projected = point.projectTo(crs),
                coordinates = crs === sGis.CRS.geo ? [projected.y, projected.x] : [projected.x, projected.y];

            var response = new PointF(coordinates, {crs: crs});
            if (this._color) response._color = this._color;
            if (this._size) response._size = this._size;

            return response;
        },

        clone: function() {
            return this.projectTo(this._crs);
        }
    });

    Object.defineProperties(PointF.prototype, {
        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                this._crs = crs;
            }
        },

        bbox: {
            get: function() {
                var point = new sGis.Point(this._point[0], this._point[1], this._crs);
                return new sGis.Bbox(point, point);
            }
        },

        size: {
            get: function() {
                return this._symbol.size;
            },

            set: function(size) {
                this._symbol.size = size;
            }
        },

        color: {
            get: function() {
                return this._symbol.fillColor;
            },

            set: function(color) {
                this._symbol.fillColor = color;
            }
        },

        x: {
            get: function() {
                return this.crs === sGis.CRS.geo ? this._point[1] : this._point[0];
            },

            set: function(x) {
                var index = this.crs === sGis.CRS.geo ? 1 : 0;
                this._point[index] = x;
            }
        },

        y: {
            get: function() {
                return this.crs === sGis.CRS.geo ? this._point[0] : this._point[1];
            },

            set: function(y) {
                var index = this.crs === sGis.CRS.geo ? 0 : 1;
                this._point[index] = y;
            }
        },

        coordinates: {
            get: function() {
                return this._point;
            },

            set: function(coordinates) {
                if (!sGis.utils.isArray(coordinates) || !sGis.utils.isNumber(coordinates[0]) || !sGis.utils.isNumber(coordinates[1])) sGis.utils.error('[x, y] is expected but got ' + coordinates + ' instead');
                this._point = coordinates;
            }
        },

        type: {
            value: 'point'
        }
    });

    return PointF;
    
});
