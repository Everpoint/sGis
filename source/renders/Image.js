sGis.module('render.Image', [
], () => {

    'use strict';
    
    /**
     * Rendered image on a map.
     * @alias sGis.render.ImageRender
     * @implements sGis.IRender
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
            
            this._node = node;
        }

        /**
         * Bbox that will contain image.
         * @type sGis.Bbox
         * @readonly
         */
        get bbox() { return this._bbox; }

        contains(position) {
            var point = new sGis.Point([position.x * resolution, position.y * resolution], this._bbox.crs);
            return this._bbox.contains(point);
        }
        
        getCache() { return this._node; }
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