import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {FillStyle, PolyRender, PolyRenderConstructorParams} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {Polygon} from "../../features/Polygon";
import {Poly} from "../../features/Poly";
import {Shadow} from "../../baseTypes";

export interface PolygonSymbolConstructorParams extends Pick<PolyRenderConstructorParams, "lineDash" | "lineCap" | "lineJoin" | "miterLimit" | "angle"> {
    /** @see [[PolygonSymbol.fillColor]] */
    fillColor?: string;
    /** @see [[PolygonSymbol.strokeColor]] */
    strokeColor?: string;
    /** @see [[PolygonSymbol.strokeWidth]] */
    strokeWidth?: number;
    /** @see [[PolygonSymbol.shadow]] */
    shadow?: Shadow;
}

/**
 * Symbol of polygon with one color filling.
 * @alias sGis.symbol.polygon.Simple
 */
export class PolygonSymbol extends Symbol<Polygon> implements PolygonSymbolConstructorParams {
    /** Fill color of the polygon. Can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** @see [[PolyRender.lineDash]] */
    lineDash: number[] = [];

    /** Emulation CanvasRenderingContext2D.filter shadow. */
    shadow: Shadow = null;
    /** @see [[PolyRender.lineCap]] */
    lineCap: "butt" | "round" | "square" = "round";

    /** @see [[PolyRender.lineJoin]] */
    lineJoin: "bevel" | "miter" | "round" = "round";

    /** @see [[PolyRender.miterLimit]] */
    miterLimit: number = 10;

    /** @see [[PolyRender.angle]] */
    angle: number = 0;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: PolygonSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);
    }

    renderFunction(feature: Polygon, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof Poly)) return [];

        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        return [new PolyRender(coordinates, {
            enclosed: true,
            fillStyle: FillStyle.Color,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fillColor: this.fillColor,
            lineDash: this.lineDash,
            shadow: this.shadow,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            miterLimit: this.miterLimit,
            angle: this.angle, 
        })];
    }
}

registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth', 'lineDash', 'shadow', 'lineCap', 'lineJoin', 'miterLimit', 'angle']);
