import {Offset} from "../baseTypes";
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
    private _isReady: boolean = false;

    node: HTMLImageElement;
    offset: Offset;
    onLoad?: () => void;
    constructor({src, width = 0, height = 0, onLoad = null, opacity = 1, offset = [0, 0]}: StaticImageRenderParams) {
        super();

        this.offset = offset;
        this.onLoad = onLoad;

        this.node = new Image();
        this.node.onload = () => {
            this._isReady = true;
            if (this.onLoad) this.onLoad();
        };

        this.node.onerror = this.node.onload;

        this.opacity = opacity;

        if (width > 0) this.node.width = width;
        if (height > 0) this.node.height = height;

        this.node.src = src;
    }

    get width(): number {
        return this.node.width;
    }

    get height(): number {
        return this.node.height;
    }

    get isReady(): boolean {
        return this._isReady;
    }

    get opacity(): number { return parseFloat(this.node.style.opacity); }
    set opacity(value: number) {
        this.node.style.opacity = value.toString();
    }
}