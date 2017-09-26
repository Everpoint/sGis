import {registerSymbol} from "../../serializers/symbolSerializer";
import {PolygonRender} from "../../renders/Polygon";
import {PolylineSymbol} from "../Polyline";
import {Color} from "../../utils/Color";
import {Symbol} from "../Symbol";

const ALPHA_NORMALIZER = 65025;

/**
 * Symbol of polygon with brush filling.
 * @alias sGis.symbol.polygon.BrushFill
 * @extends sGis.Symbol
 */
class PolygonSymbol extends Symbol {
    _brush: HTMLImageElement;
    _fillBackground = 'transparent';
    _fillForeground = 'black';

    _fillBrush =   [[255, 255, 0, 0, 0, 0, 0, 0, 255, 255],
                    [255, 255, 255, 0, 0, 0, 0, 0, 0, 255],
                    [255, 255, 255, 255, 0, 0, 0, 0, 0, 0],
                    [0, 255, 255, 255, 255, 0, 0, 0, 0, 0],
                    [0, 0, 255, 255, 255, 255, 0, 0, 0, 0],
                    [0, 0, 0, 255, 255, 255, 255, 0, 0, 0],
                    [0, 0, 0, 0, 255, 255, 255, 255, 0, 0],
                    [0, 0, 0, 0, 0, 255, 255, 255, 255, 0],
                    [0, 0, 0, 0, 0, 0, 255, 255, 255, 255],
                    [255, 0, 0, 0, 0, 0, 0, 255, 255, 255]];

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor = 'black';

    /** Stroke width of the outline. */
    strokeWidth = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash = [];

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
        if (!coordinates) return [];
        return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: 'image', fillImage: this._brush, lineDash: this.lineDash })];
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
        this._fillForeground = color;
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

registerSymbol(PolygonSymbol, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);
