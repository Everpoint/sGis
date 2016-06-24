sGis.module('render.Image', [
    'utils'
], (utils) => {

    'use strict';
    
    /**
     * @namespace sGis.renders
     */

    var defaults = {
        /** @memberof sGis.render.ImageRender */
        opacity: 1
    };
    
    /**
     * @alias sGis.render.ImageRender
     */
    class ImageRender {
        constructor(src, bbox, width, height, onAfterDisplayed) {
            this._src = src;
            this._bbox = bbox;
            this._width = width;
            this._height = height;
            
            this._resolution = this._bbox / width;
            
            this.onAfterDisplayed = onAfterDisplayed;
        }

        static get isVector() { return false; }

        getNode(callback) {
            var node = new Image();
            node.width = this._width;
            node.height = this._height;
            node.style.opacity = this.opacity;
            node.onload = function() { callback(null, node); };
            node.onerror = function() { callback('Failed to load image', null); };
            
            node.src = this._src;
        }

        get bbox() { return this._bbox; }
        get width() { return this._width; }
        get height() { return this._height; }
        
        contains(position) {
            var point = new sGis.Point(position.x * resolution, position.y * resolution, this._bbox.crs);
            return this._bbox.contains(point);
        }
    }
    
    utils.extend(ImageRender.prototype, defaults);
    
    return ImageRender;
    
});