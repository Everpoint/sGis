import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {PointFeature} from "../../features/Point";
import {Arc} from "../../renders/Arc";
import {Offset} from "../../baseTypes";
import {Feature} from "../../features/Feature";
import {IRender} from "../../interfaces/IRender";
import {Crs} from "../../Crs";

export interface PointSymbolConstructorParams {
    /** @see [[PointSymbol.size]] */
    size?: number,
    /** @see [[PointSymbol.offset]] */
    offset?: Offset,
    /** @see [[PointSymbol.fillColor]] */
    fillColor?: string,
    /** @see [[PointSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[PointSymbol.strokeWidth]] */
    strokeWidth?: number
}

/**
 * Symbol of point drawn as circle with outline.
 * @alias sGis.symbol.point.Point
 */
export class PointSymbol extends Symbol {
    /** Diameter of the circle. */
    size: number = 10;

    /** Offset of the point from the feature position. If set to [0, 0], center of the circle will be at the position of the feature. */
    offset: Offset = [0, 0];

    /** Color of the inner part of the circle. Can be any valid css color string. */
    fillColor: string = 'black';

    /** Color of the outline of the circle. Can be any valid css color string. */
    strokeColor: string = 'transparent';

    /** Width of the outline. */
    strokeWidth: number = 1;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: PointSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        if (!(feature instanceof PointFeature)) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution + (this.offset[0] || 0), - position[1] / resolution + (this.offset[1] || 0)];

        let point = new Arc(pxPosition, { fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2 });
        return [point];
    }
}

registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
