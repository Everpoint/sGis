import {Symbol} from "../Symbol";
import {Offset} from "../../baseTypes";
import {Feature} from "../../features/Feature";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {PointFeature} from "../../features/PointFeature";
import {FillStyle, PolyRender} from "../../renders/Poly";

export interface CrossPointSymbolConstructorParams {
    /** @see [[CrossPointSymbol.size]] */
    size?: number,
    /** @see [[CrossPointSymbol.offset]] */
    offset?: Offset,
    /** @see [[CrossPointSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[CrossPointSymbol.strokeWidth]] */
    strokeWidth?: number
}

export class CrossPointSymbol extends Symbol<PointFeature> {
    /** Size of the square. */
    size: number = 11;

    /** Offset of the point from the feature position in {x: dx, y: dy} format. If set to {x:0, y:0}, center of the square will be at the position of the feature. */
    offset: Offset = [0, 0];

    /** Color of the outline of the square. Can be any valid css color string. */
    strokeColor: string = '#444';

    /** Width of the outline. */
    strokeWidth: number = 1;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: CrossPointSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);

    }

    renderFunction(feature: PointFeature, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof PointFeature)) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution, - position[1] / resolution];
        let halfSize = this.size / 2;
        let offset = this.offset;
        let coordinates = [
            [[pxPosition[0], pxPosition[1] - halfSize + offset[1]], [pxPosition[0], pxPosition[1] + halfSize + offset[1]]],
            [[pxPosition[0] - halfSize + offset[0], pxPosition[1]], [pxPosition[0] + halfSize + offset[0], pxPosition[1]]]
        ];

        return [new PolyRender(coordinates, {
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            enclosed: false,
            fillStyle: FillStyle.None
        })];
    }
}