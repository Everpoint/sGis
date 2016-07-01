sGis.module('symbol.image.Image', [
    'Symbol',
    'render.Image',
    'serializer.symbolSerializer'
], (Symbol, ImageRender, symbolSerializer) => {

    'use strict';

    class ImageSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Image */ feature, resolution, crs) {
            var render = new ImageRender(feature.src, feature.bbox);

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

    ImageSymbol.prototype.transitionTime = 0;

    ImageSymbol.prototype.opacity = 1;

    symbolSerializer.registerSymbol(ImageSymbol, 'image.Image', ['transitionTime', 'opacity']);

    return ImageSymbol;
    
});