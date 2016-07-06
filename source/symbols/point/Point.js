sGis.module('symbol.point.Point', [
    'Symbol',
    'render.Arc',
    'serializer.symbolSerializer'
], (Symbol, ArcRender, symbolSerializer) => {

    'use strict';

    /**
     * @namespace sGis.symbol.point
     */

    /**
     * Symbol of point drawn as circle with outline.
     * @alias sGis.symbol.point.Point
     * @extends sGis.Symbol
     */
    class PointSymbol extends Symbol {
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
            var pxPosition = [position[0] / resolution + this.offset.x, - position[1] / resolution + this.offset.y];

            var point = new ArcRender(pxPosition, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2 });
            return [point];
        }
    }

    /**
     * Diameter of the circle.
     * @member {Number} size
     * @memberof sGis.symbol.point.Point
     * @instance
     * @default 10
     */
    PointSymbol.prototype.size = 10;

    /**
     * Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the circle will be at the position of the feature.
     * @member {Object} offset
     * @memberof sGis.symbol.point.Point
     * @instance
     * @default {x: 0, y: 0}
     */
    PointSymbol.prototype.offset = {x: 0, y: 0};

    /**
     * Color of the inner part of the circle. Can be any valid css color string.
     * @member {String} fillColor
     * @memberof sGis.symbol.point.Point
     * @instance
     * @default "black"
     */
    PointSymbol.prototype.fillColor = 'black';

    /**
     * Color of the outline of the circle. Can be any valid css color string.
     * @member {String} strokeColor
     * @memberof sGis.symbol.point.Point
     * @instance
     * @default "transparent"
     */
    PointSymbol.prototype.strokeColor = 'transparent';

    /**
     * Width of the outline.
     * @member {Number} strokeWidth
     * @memberof sGis.symbol.point.Point
     * @instance
     * @default 1
     */
    PointSymbol.prototype.strokeWidth = 1;

    symbolSerializer.registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);

    return PointSymbol;

});