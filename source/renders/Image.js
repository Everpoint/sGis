sGis.module('render.Image', [
    'utils'
], (utils) => {

    'use strict';
    
    var defaults = {
        /**
         * Opacity of the image
         * @instance
         * @memberof sGis.render.ImageRender
         * @default 1
         */
        opacity: 1
    };
    
    /**
     * @alias sGis.render.ImageRender
     */
    class ImageRender {
        /**
         * @constructor
         * @param {String} src - the source of the image.
         * @param {sGis.Bbox} bbox - bbox that will contain image. The rendered image will be adjusted to fit the given bbox.
         * @param {Number} width - width of the image. For best quality should equal the width of the actual image.
         * @param {Number} height - height of the image. For best quality should equal the height fo the actual image.
         * @param {Function} [onAfterDisplayed] - callback function that will be called after a render node is drawn to the DOM.
         */
        constructor(src, bbox, width, height, onAfterDisplayed) {
            this._src = src;
            this._bbox = bbox;

            this._resolution = this._bbox / width;
            
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
         * Width of the image.
         * @type Number
         * @readonly
         */
        get width() { return this._width; }

        /**
         * Height of the image.
         * @type Number
         * @readonly
         */
        get height() { return this._height; }

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
    
    utils.extend(ImageRender.prototype, defaults);
    
    return ImageRender;
    
});