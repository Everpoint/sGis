sGis.module('feature.Point', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.point.Simple'
], function(utils, Feature, Crs, /**sGis.Point*/ Point, Bbox, PointSymbol) {

    'use strict';

    var defaults = {
        _symbol: new PointSymbol()
    };

    /**
     * @alias sGis.feature.Point
     * @extends sGis.Feature
     */
    class PointF extends Feature {
        constructor(point, properties) {
            super(properties);
            this._point = point;
        }

        projectTo(crs) {
            var point = new sGis.Point(this._point[0], this._point[1], this._crs),
                projected = point.projectTo(crs),
                coordinates = crs === sGis.CRS.geo ? [projected.y, projected.x] : [projected.x, projected.y];

            var response = new PointF(coordinates, {crs: crs});
            if (this._color) response._color = this._color;
            if (this._size) response._size = this._size;

            return response;
        }

        clone() {
            return this.projectTo(this._crs);
        }
    }

    utils.extend(PointF.prototype, defaults);

    Object.defineProperties(PointF.prototype, {
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
