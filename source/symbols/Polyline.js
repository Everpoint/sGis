sGis.module('symbol.polyline', [
    'utils',
    'Symbol',
    'geom.Polyline'
], function(utils, Symbol, Polyline) {
    'use strict';

    var polylineSymbols = {
        Simple: function(style) {
            sGis.utils.init(this, style, true);
        }
    };

    polylineSymbols.Simple.prototype = new sGis.Symbol({
        _strokeWidth: 1,
        _strokeColor: 'black',

        renderFunction: function(feature, resolution, crs) {
            var coordinates = getPolylineRenderedCoordinates(feature, resolution, crs);

            return [new sGis.render.Polyline(coordinates, {color: this.strokeColor, width: this.strokeWidth})];
        },

        clone: function() {
            return new polylineSymbols.Simple({strokeWidth: this.strokeWidth, strokeColor: this.strokeColor});
        },

        getDescription: function() {
            return {
                symbolName: 'polyline.Simple',
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor,
            }
        }
    });

    Object.defineProperties(polylineSymbols.Simple.prototype, {
        type: {
            value: 'polyline'
        },

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        strokeColor: {
            get: function() {
                return this._strokeColor;
            },
            set: function(color) {
                this._strokeColor = color;
            }
        }
    });


    function getPolylineRenderedCoordinates(feature, resolution, crs) {
        if (!feature._cache[resolution]) {
            var projected = feature.projectTo(crs).coordinates;

            for (var ring = 0, l = projected.length; ring < l; ring++) {
                for (var i = 0, m = projected[ring].length; i < m; i++) {
                    projected[ring][i][0] /= resolution;
                    projected[ring][i][1] /= -resolution;
                }
            }

            var simpl = sGis.utils.simplify(projected, 0.5);
            feature._cache[resolution] = simpl;
        } else {
            simpl = feature._cache[resolution];
        }
        return simpl;
    }

    return polylineSymbols;
    
});
