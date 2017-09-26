/**
 * Rendered image on a map.
 * @alias sGis.render.ImageRender
 * @implements sGis.IRender
 */
import {Bbox} from "../Bbox";

export class ImageRender {
    /** Opacity of the image */
    opacity: number = 1;
    private _src: string;
    private _bbox: Bbox;
    private onAfterDisplayed: Function;
    private _node: HTMLImageElement;

    /**
     * @constructor
     * @param {String} src - the source of the image.
     * @param {sGis.Bbox} bbox - bbox that will contain image. The rendered image will be adjusted to fit the given bbox.
     * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM.
     */
    constructor(src, bbox, onAfterDisplayed) {
        this._src = src;
        this._bbox = bbox;
        this.onAfterDisplayed = onAfterDisplayed;
    }

    static get isVector() { return false; }

    /**
     * Returns HTML img element as the second parameter to callback function
     * @param {Function} callback - callback function that will be called after node is ready
     */
    getNode(callback) {
        let node = new Image();
        node.style.opacity = <any>this.opacity;
        node.onload = function() { callback(null, node); };
        node.onerror = function() { callback('Failed to load image', null); };

        node.src = this._src;

        this._node = node;
    }

    /**
     * Bbox that will contain image.
     * @type sGis.Bbox
     * @readonly
     */
    get bbox() { return this._bbox; }

    contains(/*position*/) {
        // TODO: Contains method works with pixel position, but Image render does not know about pixels. Should change its operation from bbox to px.
        return false;
    }

    getCache() { return this._node; }
}
