import {registerSymbol} from "../../serializers/symbolSerializer";
import {PolygonRender} from "../../renders/Polygon";
import {Symbol} from "../Symbol";

/**
 * Symbol of point drawn as a square.
 * @alias sGis.symbol.point.Square
 * @extends sGis.Symbol
 */
export class SquareSymbol extends Symbol {
    /** Size of the square. */
    size = 10;

    /** Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the square will be at the position of the feature. */
    offset = {x: 0, y: 0};

    /** Color of the inner part of the square. Can be any valid css color string. */
    fillColor = 'black';

    /** Color of the outline of the square. Can be any valid css color string. */
    strokeColor = 'transparent';

    /** Width of the outline. */
    strokeWidth = 1;

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);

    }

    renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
        if (feature.position === undefined) return [];

        var position = feature.projectTo(crs).position;
        var pxPosition = [position[0] / resolution, - position[1] / resolution];
        var halfSize = this.size / 2;
        var offset = this.offset;
        var coordinates = [
            [pxPosition[0] - halfSize + offset.x, pxPosition[1] - halfSize + offset.y],
            [pxPosition[0] - halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
            [pxPosition[0] + halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
            [pxPosition[0] + halfSize + offset.x, pxPosition[1] - halfSize + offset.y]
        ];

        return [new PolygonRender(coordinates, {fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth})];
    }
}

registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
