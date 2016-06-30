sGis.module('symbol.image', [
    'utils'
], (/** sGis.utils */ utils) => {

    'use strict';

    /**
     * @namespace sGis.symbol.image
     */

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

        renderFunction(/** sGis.feature.Image */ feature) {
            if (!feature.src) return [];

            var render = new sGis.render.Image(feature.src, feature.bbox, this.width, this.height);
            if (this.transitionTime > 0) {
                render.opacity = 0;
                render.onAfterDisplayed = (node) => {
                    setTimeout(() => {
                        node.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
                        node.style.opacity = this.opacity;
                    }, 0);
                }
            } else {
                render.opacity = this.opacity;
            }

            return [render];
        }
    }

    /**
     * Width of the image.
     * @member {Number} width
     * @memberof sGis.symbol.image.Image
     * @instance
     * @default 256
     */
    ImageSymbol.prototype.width = 256;

    /**
     * Height of the image.
     * @member {Number} height
     * @memberof sGis.symbol.image.Image
     * @instance
     * @default 256
     */
    ImageSymbol.prototype.height = 256;

    /**
     * Time in ms of the image to fade in to the map.
     * @member {Number} transitionTime
     * @memberof sGis.symbol.image.Image
     * @instance
     * @default 0
     */
    ImageSymbol.prototype.transitionTime = 0;

    /**
     * Opacity of the image from 0 to 1.
     * @member {Number} opacity
     * @memberof sGis.symbol.image.Image
     * @instance
     * @default 1
     */
    ImageSymbol.prototype.opacity = 1;

    return {
        Image: ImageSymbol
    };
    
});