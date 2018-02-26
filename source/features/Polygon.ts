import {Poly} from "./Poly";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {FeatureParams} from "./Feature";
import {Crs} from "../Crs";
import {projectRings} from "../geotools";

/**
 * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
 * @alias sGis.feature.Polygon
 */
export class Polygon extends Poly {
    isEnclosed: boolean = true;

    constructor(rings, {symbol = new PolygonSymbol(), ...params}: FeatureParams = {}) {
        super(rings, {symbol, ...params});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new Polygon(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }

    projectTo(crs: Crs): Polygon {
        let projected = projectRings(this.rings, this.crs, crs);
        return new Polygon(projected, {crs: this.crs, symbol: this.symbol, persistOnMap: this.persistOnMap});
    }
}
