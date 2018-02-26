import {Poly} from "./Poly";
import {PolylineSymbol} from "../symbols/PolylineSymbol";
import {FeatureParams} from "./Feature";
import {Crs} from "../Crs";
import {projectRings} from "../geotools";

/**
 * A line or a set of geographical lines.
 * @alias sGis.feature.Polyline
 */
export class Polyline extends Poly {
    isEnclosed: boolean = false;

    constructor(rings, {symbol = new PolylineSymbol(), ...params}: FeatureParams = {}) {
        super(rings, {symbol, ...params});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new Polyline(this.rings, {crs: this.crs, symbol: this.originalSymbol});
    }

    projectTo(crs: Crs): Polyline {
        let projected = projectRings(this.rings, this.crs, crs);
        return new Polyline(projected, {crs: this.crs, symbol: this.symbol, persistOnMap: this.persistOnMap});
    }
}
