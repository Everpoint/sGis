import {Coordinates, HTMLRasterElement} from "../baseTypes";
import {StaticVectorImageRender} from "./StaticVectorImageRender";

export enum HorizontalAlignment {
    Left, Center, Right
}

export enum VerticalAlignment {
    Top, Middle, Bottom
}

export interface VectorLabelRenderParams {
    text: string;
    position: Coordinates;

    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;

    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;

    /** @see [[VectorLabel.horizontalAlignment]] */
    horizontalAlignment?: HorizontalAlignment;
    /** @see [[VectorLabel.verticalAlignment]] */
    verticalAlignment?: VerticalAlignment;
}

/**
 * Text label that is drawn as a vector element. This render prerenders itself to the offscreen canvas and then allows
 * layer renderer to draw it as a simple image.
 */
export class VectorLabel extends StaticVectorImageRender {
    fontSize: number;
    fontFamily: string;
    fontStyle?: string;

    strokeColor: string;
    strokeWidth: number;
    fillColor: string;

    /** Horizontal alignment of the label relative to the position. */
    horizontalAlignment: HorizontalAlignment;

    /** Vertical alignment of the label relative to the position. */
    verticalAlignment: VerticalAlignment;

    private _text: string;
    private _canvas: HTMLCanvasElement;

    constructor({
        position,
        text,
        horizontalAlignment = HorizontalAlignment.Right,
        verticalAlignment = VerticalAlignment.Middle,
        fontSize = 14,
        fontFamily = 'arial',
        fontStyle = null,
        strokeColor = 'white',
        strokeWidth = 2,
        fillColor = 'black'
    }: VectorLabelRenderParams) {
        super({src: '', position: position});
        this._text = text;
        this.horizontalAlignment = horizontalAlignment;
        this.verticalAlignment = verticalAlignment;

        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.fontStyle = fontStyle;

        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.fillColor = fillColor;
    }

    get node(): HTMLRasterElement {
        if (this._canvas) return this._canvas;
        this._render();
        return this._canvas;
    }

    get width(): number { return this.node.width; }
    get height(): number { return this.node.height; }

    get font(): string {
        let font = '';
        if (this.fontStyle) font += this.fontStyle + ' ';
        font += `${this.fontSize}px ${this.fontFamily}`;
        return font;
    }

    private _render(): void {
        this._canvas = document.createElement('canvas');
        this._canvas.height = this._canvas.width = 0;

        let ctx = this._canvas.getContext('2d');
        ctx.font = this.font;
        let measure = ctx.measureText(this._text);

        this._canvas.width = Math.ceil(measure.width);
        this._canvas.height = Math.ceil(this.fontSize);

        let dy = 0;
        if (this.verticalAlignment === VerticalAlignment.Bottom) {
            ctx.textBaseline = 'bottom';
            dy = this._canvas.height;
        } else if (this.verticalAlignment === VerticalAlignment.Middle) {
            ctx.textBaseline = 'middle';
            dy = this._canvas.height / 2;
        } else {
            ctx.textBaseline = 'top';
        }

        ctx.font = this.font;

        if (this.strokeWidth > 0) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.strokeText(this._text, 0, dy);
        }

        ctx.fillStyle = this.fillColor;
        ctx.fillText(this._text, 0, dy);

        this._setOffset();
    }

    private _setOffset() {
        let dx = 0;
        let dy = 0;

        if (this.horizontalAlignment === HorizontalAlignment.Left) {
            dx = -this._canvas.width;
        } else if (this.horizontalAlignment === HorizontalAlignment.Center) {
            dx = -this._canvas.width / 2;
        }

        if (this.verticalAlignment === VerticalAlignment.Top) {
            dy = -this._canvas.height;
        } else if (this.verticalAlignment === VerticalAlignment.Middle) {
            dy = -this._canvas.height / 2;
        }

        this.offset = [Math.round(dx), Math.round(dy)];
    }
}
