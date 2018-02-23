import {Poly} from "./Poly";
import {PolylineSymbol} from "../symbols/PolylineSymbol";
import {FeatureParams} from "./Feature";

/**
 * A line or a set of geographical lines.
 * @alias sGis.feature.Polyline
 */
export class Polyline extends Poly {

    constructor(rings, {symbol = new PolylineSymbol(), crs}: FeatureParams = {}) {
        super(rings, {symbol, crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new Polyline(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }
}
