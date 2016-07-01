sGis.module('render.Image', [
    
], () => {

    'use strict';
    
    /**
     * @alias sGis.render.ImageRender
     */
    class ImageRender {
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
            var node = new Image();
            node.style.opacity = this.opacity;
            node.onload = function() { callback(null, node); };
            node.onerror = function() { callback('Failed to load image', null); };
            
            node.src = this._src;
        }

        /**
         * Bbox that will contain image.
         * @type sGis.Bbox
         * @readonly
         */
        get bbox() { return this._bbox; }

        /**
         * Returns true if 'position' is inside the rendered element.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            var point = new sGis.Point(position.x * resolution, position.y * resolution, this._bbox.crs);
            return this._bbox.contains(point);
        }
    }

    /**
     * Opacity of the image
     * @instance
     * @member {Number} opacity
     * @memberof sGis.render.ImageRender
     * @default 1
     */
    ImageRender.prototype.opacity = 1;
    
    return ImageRender;
    
});