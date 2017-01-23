sGis.module('symbol.point.Image', [
    'Symbol',
    'render.HtmlElement',
    'serializer.symbolSerializer'
], (Symbol, HtmlElement, symbolSerializer) => {

    'use strict';

    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Image
     * @extends sGis.Symbol
     */
    class ImageSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
            if (feature.position === undefined) return [];

            var position = feature.projectTo(crs).position;
            var pxPosition = [position[0] / resolution, - position[1] / resolution];
            var renderPosition = [pxPosition[0], pxPosition[1]];

            var html = '<img src="' + this.source + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
            return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint.x, -this.anchorPoint.y])];
        }
    }

    /**
     * Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.Image#width
     * @default 10
     */
    ImageSymbol.prototype.width = 32;

    /**
     * Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used.
     * @member {Number} sGis.symbol.point.Image#height
     * @default 32
     */
    ImageSymbol.prototype.height = 32;

    /**
     * Anchor point of the image in the {x: dx, y: dy} format. If set to {x: 0, y: 0}, image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.  
     * @member {Object} sGis.symbol.point.Image#anchorPoint
     * @default {x: 16, y: 32}
     */
    ImageSymbol.prototype.anchorPoint = {x: 16, y: 32};

    //noinspection SpellCheckingInspection
    /**
     * Source of the image. Can be url or data:url string.
     * @member {String} sGis.symbol.point.Image#source
     * @default <img src="data:image/png;base64,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">
     */
    ImageSymbol.prototype.source = 'data:image/png;base64,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';

    symbolSerializer.registerSymbol(ImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source']);

    return ImageSymbol;

});