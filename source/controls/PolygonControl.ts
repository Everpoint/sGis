import {PolyControl} from "./PolyControl";
import {Polygon} from "../features/Polygon";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {Coordinates} from "../baseTypes";
import {Poly} from "../features/Poly";
import {Symbol} from "../symbols/Symbol";

/**
 * Control for drawing polygon features.
 * @alias sGis.control.Polyline
 * @extends sGis.controls.Poly
 */
export class PolygonControl extends PolyControl {
    symbol: Symbol;

    /**
     * @param {sGis.Map} map - map the control will work with
     * @param {Object} [properties] - key-value set of properties to be set to the instance
     */
    constructor(map, properties) {
        super(map, properties);
    }

    protected _getNewFeature(position: Coordinates): Poly {
        return new Polygon([[position]], {crs: this.map.crs, symbol: this.symbol});
    }
}


