sGis.module('feature.Polygon', [
    'utils',
    'geotools',
    'symbol.polygon.Simple',
    'feature.Polyline',
    'Point',
    'feature.Point'
], function(utils, geotools, PolygonSymbol, Polyline, Point, PointF) {
    'use strict';

    var defaults = {
        _symbol: new PolygonSymbol()
    };

    /**
     * @alias sGis.feature.Polygon
     * @extends sGis.feature.Polyline
     */
    class Polygon extends Polyline {
        constructor(coordinates, properties) {
            super(coordinates, properties);
        }
    }

    utils.extend(Polygon.prototype, defaults);

    Object.defineProperties(Polygon.prototype, {
        type: {
            value: 'polygon'
        },

        fillColor: {
            get: function() {
                return this._symbol.fillColor;
            },

            set: function(color) {
                this._symbol.fillColor = color;
            }
        },

        clone: {
            value: function() {
                return new Polygon(this._coordinates, {
                    crs: this._crs,
                    color: this._color,
                    width: this._width,
                    fillColor: this.fillColor,
                    symbol: this.originalSymbol
                });
            }
        },

        /**
         * Checks if the point is inside the polygon
         * @param {sGis.Point|sGis.feature.Point|Array} point - The point to check. Coordinates can be given in [x, y] format (must be in polygon crs)
         * @return {Boolean}
         */
        contains: {
            value: function(point) {
                var pointCoordinates;
                if (point instanceof sGis.Point || point instanceof sGis.feature.Point) {
                    pointCoordinates = point.projectTo(this.crs).coordinates;
                } else if (sGis.utils.is.array(point)) {
                    pointCoordinates = point;
                } else {
                    sGis.utils.error('Invalid format of the point');
                }

                return sGis.geotools.contains(this.coordinates, pointCoordinates);
            }
        }
    });

    return Polygon;

});
