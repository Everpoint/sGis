sGis.module('render.HtmlNode', [
], () => {

    'use strict';

    /**
     * Custom HTML element on the map.
     * @alias sGis.render.HtmlNode
     * @implements sGis.IRender
     */
    class HtmlNode {
        /**
         * @constructor
         * @param {HTMLElement} node - content node
         * @param {Position} position - projected position of render in [x, y] format
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM
         * @param offset
         */
        constructor(node, position, onAfterDisplayed, offset) {
            this._node = node;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
            this.offset = offset;
        }

        static get isVector() { return false; }

        /**
         * Returns HTML element as the second parameter to callback function
         * @param {Function} callback - callback function that will be called after node is ready
         */
        getNode(callback) {
            callback(null, this._node);
        }

        /**
         * Position of the render in [x, y] format
         * @type Position
         * @readonly
         */
        get position() { return this._position; }

        contains(position) {
            let width = this._node.clientWidth || this._node.offsetWidth || 0;
            let height = this._node.clientHeight || this._node.offsetHeight || 0;

            let x = this._position[0] + (this.offset && this.offset[0] || 0);
            let y = this._position[1] + (this.offset && this.offset[1] || 0);

            return x < position[0] && y < position[1] && x + width > position[0] && y + height > position[1];
        }
    }

    return HtmlNode;

});