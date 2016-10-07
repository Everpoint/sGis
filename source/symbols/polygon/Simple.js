sGis.module('symbol.polygon.Simple', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    /**
     * @namespace sGis.symbol.polygon
     */

    /**
     * Symbol of polygon with one color filling.
     * @alias sGis.symbol.polygon.Simple
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillColor: this.fillColor, lineDash: this.lineDash })];
        }
    }

    /**
     * Fill color of the polygon. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.Simple#fillColor
     * @default "transparent"
     */
    PolygonSymbol.prototype.fillColor = 'transparent';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} sGis.symbol.polygon.Simple#strokeColor
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} sGis.symbol.polygon.Simple#strokeWidth
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polygon.Simple#lineDash
     * @default []
     */
    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});
