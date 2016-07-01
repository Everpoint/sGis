sGis.module('symbol.polyline.Simple', [
    'Symbol',
    'render.Polyline',
    'serializer.symbolSerializer'
], function(Symbol, Polyline, symbolSerializer) {
    
    'use strict';

    /**
     * @namespace sGis.symbol.polyline
     */

    /**
     * Symbol of polyline drawn as simple line
     * @alias sGis.symbol.polyline.Simple
     * @extends sGis.Symbol
     */
    class PolylineSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Polyline */ feature, resolution, crs) {
            var coordinates = this._getRenderedCoordinates(feature, resolution, crs);
            return [new Polyline(coordinates, {strokeColor: this.strokeColor, strokeWidth: this.strokeWidth})];
        }

        _getRenderedCoordinates(feature, resolution, crs) {
            var projected = feature.projectTo(crs).coordinates;
            
            return projected.map(ring => {
                return ring.map(point => {
                    return [point[0] / resolution, point[1] / -resolution];
                });
            });
        }
    }

    /**
     * Stroke color of the line. Can be any valid css color string.
     * @member {String} strokeColor
     * @memberof sGis.symbol.polyline.Simple
     * @instance
     * @default "black"
     */
    PolylineSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the line.
     * @member {Number} strokeWidth
     * @memberof sGis.symbol.polyline.Simple
     * @default 1
     */
    PolylineSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);

    return PolylineSymbol;
    
});
