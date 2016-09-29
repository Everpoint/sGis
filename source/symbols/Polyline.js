sGis.module('symbol.polyline.Simple', [
    'utils',
    'math',
    'Symbol',
    'render.Polyline',
    'serializer.symbolSerializer'
], function(utils, math, Symbol, Polyline, symbolSerializer) {
    
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
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new Polyline(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, lineDash: this.lineDash })];
        }

        static _getRenderedCoordinates(feature, resolution, crs) {
            if (!feature.coordinates || !utils.isArray(feature.coordinates) || !utils.isArray(feature.coordinates[0])) return null;
            var projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;
            
            return math.simplifyCoordinates(projected.map(ring => {
                return ring.map(point => {
                    return [point[0] / resolution, point[1] / -resolution];
                });
            }), 1);
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

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polyline.Simple#lineDash
     * @default []
     */
    PolylineSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);

    return PolylineSymbol;
    
});
