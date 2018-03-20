import {HTMLRasterElement, Offset} from "../baseTypes";
import {StaticRender} from "./Render";

export interface StaticImageRenderParams {
    src: string;
    width?: number;
    height?: number;
    onLoad?: () => void;
    offset?: Offset;
    opacity?: number;
}

export abstract class StaticImageRender extends StaticRender {
    private _node: HTMLImageElement;
    private _opacity: number;
    private _width: number;
    private _height: number;
    private _src: string;

    offset: Offset;
    onLoad?: () => void;

    constructor({src, width = 0, height = 0, onLoad = null, opacity = 1, offset = [0, 0]}: StaticImageRenderParams) {
        super();

        this.offset = offset;
        this.onLoad = onLoad;

        this._opacity = opacity;
        this._width = width;
        this._height = height;
        this._src = src;

        this._createNode();
    }

    private _createNode(): void {
        this._node = new Image();
        this._node.onload = () => {
            if (this.onLoad) this.onLoad();
        };

        this._node.onerror = (err) => {
            this._node.onload(err);
        };


        if (this._width > 0) this._node.width = this._width;
        if (this._height > 0) this._node.height = this._height;

        this._node.src = this._src;
    }

    get node(): HTMLRasterElement {
        if (this._node) return this._node;
        this._createNode();
        return this._node;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get isReady(): boolean {
        return this._node && this._node.complete;
    }

    get error(): boolean {
        return this._node && this._node.complete && this._node.naturalWidth === 0;
    }

    get opacity(): number { return parseFloat(this.node.style.opacity); }
    set opacity(value: number) {
        this._opacity = value;
        if (this.node) this.node.style.opacity = value.toString();
    }
}