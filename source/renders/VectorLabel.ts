import {VectorImage} from "./VectorImage";

export class VectorLabel extends VectorImage {
    font = '10px arial';
    align = 'center middle';
    isFilled = true;

    private _text: string;

    constructor(position, text, properties) {
        super(initCanvas(), position, properties);
        this._text = text;
        this._render();
    }

    _render() {
        let ctx = (<HTMLCanvasElement>this.node).getContext('2d');
        ctx.font = this.font;
        let measure = ctx.measureText(this._text);

        this.node.width = Math.ceil(measure.width);

        let fontSize = parseInt(this.font) || 10;
        this.node.height = Math.ceil(fontSize * 1.6);

        let vAlign = this.vAlign;
        let dy = 0;
        if (vAlign === 1) {
            ctx.textBaseline = 'bottom';
            dy = this.node.height;
        } else if (vAlign === 0) {
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

    get hAlign() { return this.align.indexOf('right') >= 0 ? 1 : this.align.indexOf('center') >= 0 ? 0 : -1; }
    get vAlign() { return this.align.indexOf('bottom') >= 0 ? 1 : this.align.indexOf('middle') >= 0 ? 0 : -1; }

    _setOffset() {
        let dx = 0;
        let dy = 0;

        if (this.hAlign === 1) {
            dx = -this.node.width;
        } else if (this.hAlign === 0) {
            dx = -this.node.width / 2;
        }

        if (this.vAlign === 1) {
            dy = -this.node.height;
        } else if (this.vAlign === 0) {
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