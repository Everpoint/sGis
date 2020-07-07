import {Symbol} from "./Symbol";
import {registerSymbol} from "../serializers/symbolSerializer";
import {simplifyCoordinates} from "../utils/math";
import {FillStyle, PolyRender} from "../renders/Poly";
import {Render} from "../renders/Render";
import {Crs} from "../Crs";
import {Poly} from "../features/Poly";
import {Polyline} from "../features/Polyline";
import {Coordinates} from "../baseTypes";

export interface PolylineSymbolConstructorParams {
    /** @see [[PolylineSymbol.strokeColor]] */
    strokeColor?: string,
    /** @see [[PolylineSymbol.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[PolylineSymbol.lineDash]] */
    lineDash?: number[]
}

/**
 * Symbol of polyline drawn as simple line.
 * @alias sGis.symbol.polyline.Simple
 */
export class PolylineSymbol extends Symbol<Polyline> {
    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash: number[] = [];

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
            lineDash: this.lineDash
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

registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);
