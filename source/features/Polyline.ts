import {Poly} from "./Poly";
import {PolylineSymbol} from "../symbols/Polyline";

/**
 * A line or a set of geographical lines.
 * @alias sGis.feature.Polyline
 * @extends sGis.feature.Poly
 */
export class Polyline extends Poly {
    _symbol = new PolylineSymbol();

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     * @returns {sGis.feature.Polyline}
     */
    clone() {
        return new Polyline(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }
}
