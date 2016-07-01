sGis.module('symbol.polygon.BrushFill', [
    'Symbol',
    'symbol.polyline.Simple',
    'render.Polygon',
    'utils.Color',
    'serializer.symbolSerializer'
], function(Symbol, PolylineSymbol, PolygonRender, Color, symbolSerializer) {

    'use strict';

    var ALPHA_NORMALIZER = 65025;

    /**
     * Symbol of polygon with brush filling.
     * @alias sGis.symbol.polygon.BrushFill
     * @extends sGis.Symbol
     */
    class PolygonSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
            this._updateBrush();
        }

        renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
            var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
            return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._brush })];
        }

        /**
         * Brush pattern for filling.
         * @type Number[][]
         */
        get fillBrush() { return this._fillBrush; }
        set fillBrush(/** Number[][] */ brush) {
            this._fillBrush = brush;
            this._updateBrush();
        }

        /**
         * Brush background color. Can be any valid css color string.
         * @type String
         * @default "transparent"
         */
        get fillBackground() { return this._fillBackground; }
        set fillBackground(/** String */ color) {
            this._fillBackground = color;
            this._updateBrush();
        }

        /**
         * Brush foreground color. Can be any valid css color string.
         * @type String
         * @default "black"
         */
        get fillForeground() { return this._fillForeground; }
        set fillForeground(/** String */ color) {
            this._fillForegroudn = color;
            this._updateBrush();
        }

        _updateBrush() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var brush = this.fillBrush;
            var foreground = new Color(this.fillForeground);
            var background = new Color(this.fillBackground);

            canvas.height = brush.length;
            canvas.width = brush[0].length;

            for (var i = 0, l = brush.length; i < l; i++) {
                for (var j = 0, m = brush[i].length; j < m; j++) {
                    var srcA = brush[i][j] * foreground.a / ALPHA_NORMALIZER,
                        dstA = background.a / 255 * (1 - srcA),
                        a = + Math.min(1, (srcA + dstA)).toFixed(2),
                        r = Math.round(Math.min(255, background.r * dstA + foreground.r * srcA)),
                        g = Math.round(Math.min(255, background.g * dstA + foreground.g * srcA)),
                        b = Math.round(Math.min(255, background.b * dstA + foreground.b * srcA));

                    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                    ctx.fillRect(j,i,1,1);
                }
            }

            this._brush = new Image();
            this._brush.src = canvas.toDataURL();
        }
    }

    PolygonSymbol.prototype._fillBrush =
       [[255, 255, 0, 0, 0, 0, 0, 0, 255, 255],
        [255, 255, 255, 0, 0, 0, 0, 0, 0, 255],
        [255, 255, 255, 255, 0, 0, 0, 0, 0, 0],
        [0, 255, 255, 255, 255, 0, 0, 0, 0, 0],
        [0, 0, 255, 255, 255, 255, 0, 0, 0, 0],
        [0, 0, 0, 255, 255, 255, 255, 0, 0, 0],
        [0, 0, 0, 0, 255, 255, 255, 255, 0, 0],
        [0, 0, 0, 0, 0, 255, 255, 255, 255, 0],
        [0, 0, 0, 0, 0, 0, 255, 255, 255, 255],
        [255, 0, 0, 0, 0, 0, 0, 255, 255, 255]];

    PolygonSymbol.prototype._fillBackground = 'transparent';
    PolygonSymbol.prototype._fillForeground = 'black';

    /**
     * Stroke color of the outline. Can be any valid css color string.
     * @member {String} strokeColor
     * @memberof sGis.symbol.polygon.BrushFill
     * @instance
     * @default "black"
     */
    PolygonSymbol.prototype.strokeColor = 'black';

    /**
     * Stroke width of the outline.
     * @member {Number} strokeWidth
     * @memberof sGis.symbol.polygon.BrushFill
     * @default 1
     */
    PolygonSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(PolygonSymbol, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);

    return PolygonSymbol;

});