import {Bbox} from "../Bbox";
import {GetNodeCallback, IRender, OnAfterDisplayedHandler} from "../interfaces/IRender";

/**
 * Rendered image on a map.
 * @alias sGis.render.ImageRender
 */
export class ImageRender implements IRender{
    private _src: string;
    private _bbox: Bbox;
    private _node: HTMLImageElement;

    /** Opacity of the image */
    opacity: number = 1;

    /**
     * Handler to be called after the element is added to DOM.
     */
    onAfterDisplayed: OnAfterDisplayedHandler | null;

    /**
     * @param src - the source of the image.
     * @param bbox - bbox that will contain image. The rendered image will be adjusted to fit the given bbox.
     * @param onAfterDisplayed - callback function that will be called after a render node is drawn to the DOM.
     */
    constructor(src, bbox, onAfterDisplayed: OnAfterDisplayedHandler = null) {
        this._src = src;
        this._bbox = bbox;
        this.onAfterDisplayed = onAfterDisplayed;
    }

    /**
     * Returns HTML img element as the second parameter to callback function
     * @param callback - callback function that will be called after node is ready
     */
    getNode(callback: GetNodeCallback): void {
        let node = new Image();
        node.style.opacity = <any>this.opacity;
        node.onload = function() { callback(null, node); };
        node.onerror = function() { callback('Failed to load image', null); };

        node.src = this._src;

        this._node = node;
    }

    /**
     * Bbox that will contain image.
     */
    get bbox(): Bbox { return this._bbox; }

    contains() {
        // TODO: Contains method works with pixel position, but Image render does not know about pixels. Should change its operation from bbox to px.
        return false;
    }

    get isVector(): boolean { return false; }

    /**
     * Returns rendered node if ready.
     */
    getCache(): HTMLElement | null { return this._node || null; }
}
