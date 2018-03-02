import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {PointFeature} from "../../features/PointFeature";
import {Arc} from "../../renders/Arc";
import {Coordinates, Offset} from "../../baseTypes";
import {Render} from "../../renders/Render";
import {Crs} from "../../Crs";
import {warn} from "../../utils/utils";

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
export class PointSymbol extends Symbol<PointFeature> {
    /** Diameter of the circle. */
    size: number = 10;

    private _offset: Offset = [0, 0];

    /** Offset of the point from the feature position. If set to [0, 0], center of the circle will be at the position of the feature. */
    get offset(): Offset { return this._offset; }
    set offset(value: Offset) {
        // TODO: remove deprecated part after 2018
        let deprecated = <any>value;
        if (deprecated.x !== undefined && deprecated.y !== undefined) {
            warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
            this._offset = [deprecated.x, deprecated.y];
        } else {
            this._offset = value;
        }
    }

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

    renderFunction(feature: PointFeature, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof PointFeature)) return [];
        let position = feature.projectTo(crs).position;
        let pxPosition: Coordinates = [position[0] / resolution + (this.offset[0] || 0), - position[1] / resolution + (this.offset[1] || 0)];

        return [new Arc(pxPosition, {
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            radius: this.size / 2
        })];
    }
}

registerSymbol(PointSymbol, 'point.Point', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
