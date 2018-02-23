import {Poly} from "./Poly";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {FeatureParams} from "./Feature";

/**
 * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
 * @alias sGis.feature.Polygon
 */
export class Polygon extends Poly {
    isEnclosed = true;

    constructor(rings, {symbol = new PolygonSymbol(), crs}: FeatureParams = {}) {
        super(rings, {symbol, crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new Polygon(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }
}
