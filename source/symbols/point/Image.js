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
            var f = feature.projectTo(crs);
            var pxPosition = [f._point[0] / resolution, - f._point[1] / resolution];
            var renderPosition = [pxPosition[0] - this.anchorPoint.x, pxPosition[1] - this.anchorPoint.y];

            var html = '<img src="' + this.source + '"' + (this.width > 0 ? ' width="' + this.width + '"' : '') + (this.height > 0 ? ' height="' + this.height + '"' : '') + '>';
            return [new sGis.render.HtmlElement(html, renderPosition)];
        }
    }

    /**
     * Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used.
     * @member {Number} width
     * @memberof sGis.symbol.point.Image
     * @instance
     * @default 10
     */
    ImageSymbol.prototype.width = 32;

    /**
     * Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used.
     * @member {Number} height
     * @memberof sGis.symbol.point.Image
     * @instance
     * @default 32
     */
    ImageSymbol.prototype.height = 32;

    /**
     * Anchor point of the image in the {x: dx, y: dy} format. If set to {x: 0, y: 0}, image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.  
     * @member {Object} anchorPoint
     * @memberof sGis.symbol.point.Image
     * @instance
     * @default {x: 16, y: 16}
     */
    ImageSymbol.prototype.anchorPoint = {x: 16, y: 16};

    /**
     * Source of the image. Can be url or data:url string.
     * @member {String} source
     * @memberof sGis.symbol.point.Image
     * @instance
     * @default <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN5QTFRFAAAAAAAAAAAAAAAAji4jiCwhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKg4KJgwJxEAw20o040Up41hE5EYq5Ugs5kov50wx6E406GNR6GNS6GZV6GpY6G1c6G9f6HBg6HNj6HZm6Hlq6VA26X1t6YBx6Yd56lI56oN16ot96o6A6pGE61Q765WI65mN7J2R7KCV7VY+7aWa7lhA7qme7q2j71pC77Ko8FxF8Lat8Lqx8V5H8mBK8r+38sS982JM9GRO9WZR9mhT+GtW+W1Y+m9b+3Fd/HNf/XVi+RwEUgAAABF0Uk5TAAYHERYXHB0eIiM3OD1JSlRYXujgAAABPUlEQVQ4y2WS2ULCMBBFE0qxlWIdwI19EZBFFhFEUHBX/v+HTJtOmAnnqTn3hodwhYiQAFIwuJGw2/EGNxK2hcKW36AmDZuCYkNvUOPC+iJmjQ3JjITVZcJKNyzjwPIKWeobVDjCycLiGlmAlOyYdYTM5GB+g8yBHXKZ6CdVY3aL5PPmc6Zz3ZjeHTHFXDcm9xaTQ64b4wfGmOa6MXokjHiuG8Mnw9DOVcOHwbNhAL6Vq/frvRB6x/vovzL69j66bxZd2khD5/2IzqHhQvsDKRbNZxsbLrQ+kRawQ7Ko5hfShPMzdoz30fhG6hCe+jmoG9GIF1X7SahB6KWiNyUmXlT1N6Ya5frVjUkWVflTVHQuqDGLKu/3ZcyJIYsqlQ55ZMLIsEXRXBkvVIYuKhvQXIiUFwQndFGOY/+9aP4B2y1gaNteoqgAAAAASUVORK5CYII=">
     */
    ImageSymbol.prototype.source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN5QTFRFAAAAAAAAAAAAAAAAji4jiCwhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKg4KJgwJxEAw20o040Up41hE5EYq5Ugs5kov50wx6E406GNR6GNS6GZV6GpY6G1c6G9f6HBg6HNj6HZm6Hlq6VA26X1t6YBx6Yd56lI56oN16ot96o6A6pGE61Q765WI65mN7J2R7KCV7VY+7aWa7lhA7qme7q2j71pC77Ko8FxF8Lat8Lqx8V5H8mBK8r+38sS982JM9GRO9WZR9mhT+GtW+W1Y+m9b+3Fd/HNf/XVi+RwEUgAAABF0Uk5TAAYHERYXHB0eIiM3OD1JSlRYXujgAAABPUlEQVQ4y2WS2ULCMBBFE0qxlWIdwI19EZBFFhFEUHBX/v+HTJtOmAnnqTn3hodwhYiQAFIwuJGw2/EGNxK2hcKW36AmDZuCYkNvUOPC+iJmjQ3JjITVZcJKNyzjwPIKWeobVDjCycLiGlmAlOyYdYTM5GB+g8yBHXKZ6CdVY3aL5PPmc6Zz3ZjeHTHFXDcm9xaTQ64b4wfGmOa6MXokjHiuG8Mnw9DOVcOHwbNhAL6Vq/frvRB6x/vovzL69j66bxZd2khD5/2IzqHhQvsDKRbNZxsbLrQ+kRawQ7Ko5hfShPMzdoz30fhG6hCe+jmoG9GIF1X7SahB6KWiNyUmXlT1N6Ya5frVjUkWVflTVHQuqDGLKu/3ZcyJIYsqlQ55ZMLIsEXRXBkvVIYuKhvQXIiUFwQndFGOY/+9aP4B2y1gaNteoqgAAAAASUVORK5CYII=';

    symbolSerializer.registerSymbol(ImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source']);

    return ImageSymbol;

});