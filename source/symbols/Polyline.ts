import {Symbol} from "./Symbol";
import {PolylineRender} from "../renders/Polyline";
import {isArray} from "../utils/utils";
import {registerSymbol} from "../serializers/symbolSerializer";
import {simplifyCoordinates} from "../utils/math";

/**
 * Symbol of polyline drawn as simple line
 * @alias sGis.symbol.polyline.Simple
 * @extends sGis.Symbol
 */
export class PolylineSymbol extends Symbol {
    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash: number[] = [];

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties) {
        super(properties);
    }

    renderFunction(/** sGis.feature.Polyline */ feature, resolution, crs) {
        let coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
        if (!coordinates) return [];
        return [new PolylineRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, lineDash: this.lineDash })];
    }

    static _getRenderedCoordinates(feature, resolution, crs) {
        if (!feature.coordinates || !isArray(feature.coordinates) || !isArray(feature.coordinates[0])) return null;
        let projected = feature.crs.equals(crs) ? feature.rings : feature.projectTo(crs).rings;

        return simplifyCoordinates(projected.map(ring => {
            return ring.map(point => {
                return [point[0] / resolution, point[1] / -resolution];
            });
        }), 1);
    }
}

registerSymbol(PolylineSymbol, 'polyline.Simple', ['strokeColor', 'strokeWidth']);
