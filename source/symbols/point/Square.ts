import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {Symbol} from "../Symbol";
import {Offset} from "../../baseTypes";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {PointFeature} from "../../features/PointFeature";
import {warn} from "../../utils/utils";

export interface SquareSymbolConstructorParams {
    /** @see [[SquareSymbol.size]] */
    size?: number,
    /** @see [[SquareSymbol.offset]] */
    offset?: Offset,
    /** @see [[SquareSymbol.fillColor]] */
    fillColor?: string,
    /** @see [[SquareSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[SquareSymbol.strokeWidth]] */
    strokeWidth?: number
}

/**
 * Symbol of point drawn as a square.
 * @alias sGis.symbol.point.Square
 */
export class SquareSymbol extends Symbol<PointFeature> {
    /** Size of the square. */
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

    /** Color of the inner part of the square. Can be any valid css color string. */
    fillColor: string = 'black';

    /** Color of the outline of the square. Can be any valid css color string. */
    strokeColor: string = 'transparent';

    /** Width of the outline. */
    strokeWidth: number = 1;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: SquareSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);

    }

    renderFunction(feature: PointFeature, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof PointFeature)) return [];
        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution, - position[1] / resolution];
        let halfSize = this.size / 2;
        let offset = this.offset;
        let coordinates = [[
            [pxPosition[0] - halfSize + offset[0], pxPosition[1] - halfSize + offset[1]],
            [pxPosition[0] - halfSize + offset[0], pxPosition[1] + halfSize + offset[1]],
            [pxPosition[0] + halfSize + offset[0], pxPosition[1] + halfSize + offset[1]],
            [pxPosition[0] + halfSize + offset[0], pxPosition[1] - halfSize + offset[1]]
        ]];

        return [new PolyRender(coordinates, {
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            enclosed: true,
            fillStyle: FillStyle.Color
        })];
    }
}

registerSymbol(SquareSymbol, 'point.Square', ['size', 'offset', 'fillColor', 'strokeColor', 'strokeWidth']);
