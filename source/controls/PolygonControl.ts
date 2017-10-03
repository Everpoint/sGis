import {PolyControl} from "./PolyControl";
import {Polygon} from "../features/Polygon";
import {PolygonSymbol} from "../symbols/polygon/Simple";

/**
 * Control for drawing polygon features.
 * @alias sGis.control.Polyline
 * @extends sGis.controls.Poly
 */
export class PolygonControl extends PolyControl {
    /**
     * @param {sGis.Map} map - map the control will work with
     * @param {Object} [properties] - key-value set of properties to be set to the instance
     */
    constructor(map, properties) {
        super(Polygon, new PolygonSymbol(), map, properties);
    }
}

/**
 * Symbol of the created features
 * @member {sGis.Symbol} sGis.controls.Polyline#symbol
 * @default new sGis.symbol.polygon.Simple()
 */


