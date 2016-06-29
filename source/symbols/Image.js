sGis.module('symbol.image', [
    'utils'
], (/** sGis.utils */ utils) => {

    'use strict';

    var defaults = {
        /**
         * Width of the image.
         * @type Number
         * @memberof sGis.symbol.image.Image
         * @instance
         * @default 256
         */
        width: 256,

        /**
         * Height of the image.
         * @type Number
         * @memberof sGis.symbol.image.Image
         * @instance
         * @default 256
         */
        height: 256,
        
        /**
         * Time in ms of the image to fade in to the map.
         * @type Number
         * @memberof sGis.symbol.image.Image
         * @instance
         * @default 0
         */
        transitionTime: 0,

        /**
         * Opacity of the image from 0 to 1.
         * @type Number
         * @memberof sGis.symbol.image.Image
         * @instance
         * @default 1
         */
        opacity: 1
    };

    /**
     * @alias sGis.symbol.image.Image
     * @implements sGis.ISymbol
     */
    class ImageSymbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties) {
            utils.init(this, properties);
        }

        /**
         * @implementation
         */
        renderFunction(feature, resolution, crs) {
            var render = new sGis.render.Image(feature.src, feature.bbox, this.width, this.height);
            if (feature.transitionTime > 0) {
                render.opacity = 0;
                render.onAfterDisplayed = function(node) {
                    setTimeout(() => {
                        node.style.transition = 'opacity ' + feature.transitionTime / 1000 + 's linear';
                        node.style.opacity = this.opacity;
                    }, 0);
                }
            } else {
                render.opacity = feature.opacity;
            }

            return [render];
        }
    }

    utils.extend(ImageSymbol.prototype, defaults);
    
    return {
        Image: ImageSymbol
    };
    
});