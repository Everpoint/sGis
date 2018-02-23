import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Color} from "../../utils/Color";
import {Symbol} from "../Symbol";
import {Render} from "../../renders/Render";
import {Crs} from "../../Crs";
import {Polygon} from "../../features/Polygon";

const ALPHA_NORMALIZER = 65025;

export interface BrushFillConstructorParams {
    /** @see [[BrushFill.strokeColor]] */
    strokeColor?: string,
    /** @see [[BrushFill.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[BrushFill.lineDash]] */
    lineDash?: number[]
    /** @see [[BrushFill.fillBrush]] */
    fillBrush?: number[][],
    /** @see [[BrushFill.fillForeground]] */
    fillForeground?: string,
    /** @see [[BrushFill.fillBackground]] */
    fillBackground?: string
}

/**
 * Symbol of polygon with brush filling.
 * @alias sGis.symbol.polygon.BrushFill
 */
export class BrushFill extends Symbol<Polygon> {
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
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash: number[] = [];
    
    private _initialized: boolean = false;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: BrushFillConstructorParams = {}) {
        super();
        if (options) Object.assign(this, options);

        this._initialized = true;
        this._updateBrush();
    }

    renderFunction(feature: Polygon, resolution: number, crs: Crs): Render[] {
        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        return [new PolyRender(coordinates, {
            enclosed: true,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fillStyle: FillStyle.Image,
            fillImage: this._brush,
            lineDash: this.lineDash
        })];
    }

    /**
     * Brush pattern for filling.
     */
    get fillBrush(): number[][] { return this._fillBrush; }
    set fillBrush(brush: number[][]) {
        this._fillBrush = brush;
        this._updateBrush();
    }

    /**
     * Brush background color. Can be any valid css color string.
     */
    get fillBackground(): string { return this._fillBackground; }
    set fillBackground(color: string) {
        this._fillBackground = color;
        this._updateBrush();
    }

    /**
     * Brush foreground color. Can be any valid css color string.
     */
    get fillForeground(): string { return this._fillForeground; }
    set fillForeground(color: string) {
        this._fillForeground = color;
        this._updateBrush();
    }

    _updateBrush(): void {
        if (!this._initialized) return;
        
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let brush = this.fillBrush;
        let foreground = new Color(this.fillForeground);
        let background = new Color(this.fillBackground);

        canvas.height = brush.length;
        canvas.width = brush[0].length;

        for (let i = 0, l = brush.length; i < l; i++) {
            for (let j = 0, m = brush[i].length; j < m; j++) {
                let srcA = brush[i][j] * foreground.a / ALPHA_NORMALIZER,
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

registerSymbol(BrushFill, 'polygon.BrushFill', ['fillBrush', 'fillBackground', 'fillForeground', 'strokeColor', 'strokeWidth']);
