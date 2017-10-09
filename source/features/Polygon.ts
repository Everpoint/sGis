import {Poly} from "./Poly";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {IFeatureConstructorArgs} from "./Feature";
import {Symbol} from "../symbols/Symbol";

/**
 * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
 * @alias sGis.feature.Polygon
 * @extends sGis.feature.Poly
 */
export class Polygon extends Poly {
    /** Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol. */
    _symbol: Symbol;
    isEnclosed = true;

    constructor(rings, {symbol = new PolygonSymbol(), crs}: IFeatureConstructorArgs = {}) {
        super(rings, {symbol, crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     * @returns {sGis.feature.Polygon}
     */
    clone() {
        return new Polygon(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }
}
