import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {Polygon} from "../../features/Polygon";

export interface PolygonSymbolConstructorParams {
    /** @see [[PolygonSymbol.fillColor]] */
    fillColor?: string,
    /** @see [[PolygonSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[PolygonSymbol.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[PolygonSymbol.lineDash]] */
    lineDash?: number[]
}

/**
 * Symbol of polygon with one color filling.
 * @alias sGis.symbol.polygon.Simple
 */
export class PolygonSymbol extends Symbol<Polygon> {
    /** Fill color of the polygon. Can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash: number[] = [];

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: PolygonSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);

    }

    renderFunction(feature: Polygon, resolution: number, crs: Crs): Render[] {
        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        return [new PolyRender(coordinates, {
            enclosed: true,
            fillStyle: FillStyle.Color,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fillColor: this.fillColor,
            lineDash: this.lineDash
        })];
    }
}

registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);
