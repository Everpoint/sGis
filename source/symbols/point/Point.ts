import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {PointFeature} from "../../features/Point";
import {Arc} from "../../renders/Arc";

export type Offset = {
    x: number;
    y: number;
}

/**
* Symbol of point drawn as circle with outline.
 * @alias sGis.symbol.point.Point
 * @extends sGis.Symbol
 */
export class PointSymbol extends Symbol {
    /** Diameter of the circle. */
    size: number = 10;

    /** Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the circle will be at the position of the feature. */
    offset: Offset = { x: 0, y: 0 };

    /** Color of the inner part of the circle. Can be any valid css color string. */
    fillColor: string = 'black';

    /** Color of the outline of the circle. Can be any valid css color string. */
    strokeColor: string = 'transparent';

    /** Width of the outline. */
    strokeWidth: number = 1;

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);
    }

    renderFunction(feature, resolution, crs) {
        if ((<PointFeature>feature).position === undefined) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution + this.offset.x, - position[1] / resolution + this.offset.y];

        let point = new Arc(pxPosition, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2 });
        return [point];
    }
}

registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
