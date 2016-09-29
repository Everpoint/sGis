sGis.module('symbol.polygon.ImageFill', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, symbolSerializer) {

    'use strict';

    /**
     * Symbol of polygon with brush filling.
     * @alias sGis.symbol.polygon.ImageFill
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
            if (!this._image) this.src = this._src;
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            if (!this._image.complete) {
                this._image.onload = feature.redraw.bind(feature);
                return [];
            }
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            if (!coordinates) return [];
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._image, lineDash: this.lineDash })];
        }

        /**
         * Source for the filling image. Can be url or data:url string.
         * @type String
         * @default /an empty image/
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this._image = new Image();
            this._image.src = src;
        }
    }

    PolygonSymbol.prototype._src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} strokeColor
     * @memberof sGis.symbol.polygon.ImageFill
     * @instance
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} strokeWidth
     * @memberof sGis.symbol.polygon.ImageFill
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    /**
     * Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification
     * @member {Number[]} sGis.symbol.polygon.ImageFill#lineDash
     * @default []
     */
    PolygonSymbol.prototype.lineDash = [];

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});
