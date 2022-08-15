import {HTMLRasterElement, Offset} from "../baseTypes";
import {StaticRender} from "./Render";
import {loadImage} from "../utils/utils";

export interface StaticImageRenderParams {
    src: string;
    width?: number;
    height?: number;
    onLoad?: () => void;
    onError?: (err?: ErrorEvent) => void;
    offset?: Offset;
    opacity?: number;
}

export abstract class StaticImageRender extends StaticRender {
    private _node: HTMLImageElement;
    private _opacity: number;
    private _width: number;
    private _height: number;
    private _src: string;
    private _aborted: boolean;
    private _controller: AbortController;
    private _complete: boolean;

    offset: Offset;
    onLoad?: () => void;
    onError?: (err?: ErrorEvent) => void;

    readyPromise: Promise<void>;

    constructor({src, width = 0, height = 0, onLoad = null, onError = null, opacity = 1, offset = [0, 0]}: StaticImageRenderParams) {
        super();

        this.offset = offset;
        this.onLoad = onLoad;
        this.onError = onError;

        this._opacity = opacity;
        this._width = width;
        this._height = height;
        this._src = src;
        this._aborted = false;
        this._complete = false;

        this._createNode();
    }

    private _createNode(): void {
        this._node = new Image();

        if (this._width > 0) this._node.width = this._width;
        if (this._height > 0) this._node.height = this._height;
        
        this._node.style.opacity = this._opacity.toString();
        
        const controller = new AbortController();
        const signal = controller.signal;
        this._controller = controller;
        this.readyPromise = loadImage(this._node, this._src, signal);
        this.readyPromise
          .then(() => {
            this._complete = true;
            this.onLoad();
          })
          .catch((error) => {
            if (this._aborted) {
              return;
            }
            this.onError(error);
          });

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

    // working only for base64 src
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

    get isImageLoaded(): boolean {
        return this._complete;
    }

    deleteNode(): void {
        this._aborted = true;
        this._controller.abort();
        if (this._node) {
            this._node.src = "";
        }
    }
}
