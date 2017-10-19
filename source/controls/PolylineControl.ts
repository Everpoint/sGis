import {PolyControl} from "./PolyControl";
import {PolylineSymbol} from "../symbols/Polyline";
import {Polyline} from "../features/Polyline";

/**
 * Control for drawing polyline features.
 * @alias sGis.controls.Polyline
 * @extends sGis.controls.Poly
 */
export class PolylineControl extends PolyControl {
    /**
     * @param {sGis.Map} map - map the control will work with
     * @param {Object} [properties] - key-value set of properties to be set to the instance
     */
    constructor(map, properties) {
        super(Polyline, new PolylineSymbol(), map, properties);
    }
}

/**
 * Symbol of the created features
 * @member {sGis.Symbol} sGis.controls.Polyline#symbol
 * @default new sGis.symbol.polyline.Simple()
 */


