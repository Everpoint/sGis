import {StaticImage} from "./StaticImage";
import {Coordinates} from "../baseTypes";

export enum HorizontalAlignment {
    Left, Center, Top
}

export enum VerticalAlignment {
    Top, Middle, Bottom
}

export interface VectorLabelConstructorParams {
    /** @see [[VectorLabel.font]] */
    font?: string,
    /** @see [[VectorLabel.horizontalAlignment]] */
    horizontalAlignment?: HorizontalAlignment,
    /** @see [[VectorLabel.verticalAlignment]] */
    verticalAlignment?: VerticalAlignment
    /** @see [[VectorLabel.isFilled]] */
    isFilled?: boolean
}

/**
 * Text label that is drawn as a vector element. This render prerenders itself to the offscreen canvas and then allows
 * layer renderer to draw it as a simple image.
 */
export class VectorLabel extends StaticImage {
    /**
     * Font of the label. Set as a valid css font string.
     */
    font = '10px arial';

    /** Horizontal alignment of the label relative to the position. */
    horizontalAlignment: HorizontalAlignment = HorizontalAlignment.Center;

    /** Vertical alignment of the label relative to the position. */
    verticalAlignment: VerticalAlignment = VerticalAlignment.Middle;

    /** Whether the font should be drawn as outline or if the letters should be filled inside. */
    isFilled: boolean = true;

    private _text: string;

    constructor(position: Coordinates, text: string, options: VectorLabelConstructorParams = {}) {
        super(initCanvas(), position, [0, 0]);
        this._text = text;
        Object.assign(this, options);
        this._render();
    }

    _render() {
        let ctx = (<HTMLCanvasElement>this.node).getContext('2d');
        ctx.font = this.font;
        let measure = ctx.measureText(this._text);

        this.node.width = Math.ceil(measure.width);

        let fontSize = parseInt(this.font) || 10;
        this.node.height = Math.ceil(fontSize * 1.6);

        let dy = 0;
        if (this.verticalAlignment === VerticalAlignment.Bottom) {
            ctx.textBaseline = 'bottom';
            dy = this.node.height;
        } else if (this.verticalAlignment === VerticalAlignment.Middle) {
            ctx.textBaseline = 'middle';
            dy = this.node.height / 2;
        } else {
            ctx.textBaseline = 'top';
        }

        if (this.isFilled) {
            ctx.fillText(this._text, 0, dy);
        } else {
            ctx.strokeText(this._text, 0, dy);
        }

        this._setOffset();
    }

    _setOffset() {
        let dx = 0;
        let dy = 0;

        if (this.horizontalAlignment === HorizontalAlignment.Left) {
            dx = -this.node.width;
        } else if (this.horizontalAlignment === HorizontalAlignment.Center) {
            dx = -this.node.width / 2;
        }

        if (this.verticalAlignment === VerticalAlignment.Top) {
            dy = -this.node.height;
        } else if (this.verticalAlignment === VerticalAlignment.Middle) {
            dy = -this.node.height / 2;
        }

        this.offset = [dx, dy];
    }
}

function initCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 0;
    return canvas;
}