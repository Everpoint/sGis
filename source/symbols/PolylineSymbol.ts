import {Symbol} from "./Symbol";
import {registerSymbol} from "../serializers/symbolSerializer";
import {simplifyCoordinates} from "../utils/math";
import {FillStyle, PolyRender, PolyRenderConstructorParams} from "../renders/Poly";
import {Render} from "../renders/Render";
import {Crs} from "../Crs";
import {Poly} from "../features/Poly";
import {Polyline} from "../features/Polyline";
import {Coordinates, Shadow} from "../baseTypes";

export interface PolylineSymbolConstructorParams extends Pick<PolyRenderConstructorParams, "lineDash" | "lineCap" | "lineJoin" | "miterLimit">{
    /** @see [[PolylineSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[PolylineSymbol.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[PolylineSymbol.shadow]] */
    shadow?: Shadow
}

/**
 * Symbol of polyline drawn as simple line.
 * @alias sGis.symbol.polyline.Simple
 */
export class PolylineSymbol extends Symbol<Polyline> implements PolylineSymbolConstructorParams {
    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** @see [[PolyRender.lineDash]] */
    lineDash: number[] = [];

    /** Emulation CanvasRenderingContext2D.filter drop-shadow. */
    shadow: Shadow = null;
    /** @see [[PolyRender.lineCap]] */
    lineCap: "butt" | "round" | "square" = "round";

    /** @see [[PolyRender.lineJoin]] */
    lineJoin: "bevel" | "miter" | "round" = "round";

    /** @see [[PolyRender.miterLimit]] */
    miterLimit: number = 10;


    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: PolylineSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);
    }

    renderFunction(feature: Polyline, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof Poly)) return [];
        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        return [new PolyRender(coordinates, {
            fillStyle: FillStyle.None,
            enclosed: false,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            lineDash: this.lineDash,
            shadow: this.shadow,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            miterLimit: this.miterLimit,
        })];
    }

    /**
     * Projects coordinates of a poly feature to the requested crs and resolution.
     * @param feature
     * @param resolution
     * @param crs
     */
    static getRenderedCoordinates(feature: Poly, resolution: number, crs: Crs) {
        let projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;

        return simplifyCoordinates(projected.map(ring => {
            return ring.map(point => {
                return <Coordinates>[point[0] / resolution, point[1] / -resolution];
            });
        }), 1);
    }
}

registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth', 'shadow', 'lineCap', 'lineDash', 'lineJoin', 'miterLimit']);
