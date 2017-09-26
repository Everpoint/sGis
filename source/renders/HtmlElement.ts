/**
 * Custom HTML element on the map.
 * @alias sGis.render.HtmlElement
 * @implements sGis.IRender
 */
import {Coordinates} from "../baseTypes";
import {IRender} from "../interfaces/IRender";

export class HtmlElement implements IRender {
    private _htmlText: string;
    private _position: Coordinates;
    private onAfterDisplayed: Function;
    private offset: [number, number];
    private _lastNode: HTMLElement;
    /**
     * @constructor
     * @param {String} htmlText - the inner html value of html element
     * @param {Position} position - projected position of render in [x, y] format
     * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM
     * @param offset
     */
    constructor(htmlText, position, onAfterDisplayed?: Function, offset: [number, number] = [0, 0]) {
        this._htmlText = htmlText;
        this._position = position;
        this.onAfterDisplayed = onAfterDisplayed;
        this.offset = offset;
    }

    static get isVector() { return false; }

    /**
     * Returns HTML div element as the second parameter to callback function
     * @param {Function} callback - callback function that will be called after node is ready
     */
    getNode(callback) {
        var node = document.createElement('div');
        node.innerHTML = this._htmlText;
        this._lastNode = node;
        callback(null, node);
    }

    /**
     * Position of the render in [x, y] format
     * @type Position
     * @readonly
     */
    get position() { return this._position; }

    contains(position) {
        let width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
        let height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;

        let x = this._position[0] + (this.offset && this.offset[0] || 0);
        let y = this._position[1] + (this.offset && this.offset[1] || 0);

        return x < position[0] && y < position[1] && x + width > position[0] && y + height > position[1];
    }

    get isVector() { return false; }
}
