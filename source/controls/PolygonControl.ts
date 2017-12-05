import {PolyControl} from "./PolyControl";
import {Polygon} from "../features/Polygon";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {Coordinates} from "../baseTypes";
import {Poly} from "../features/Poly";
import {ControlWithSymbolParams} from "./Control";
import {Map} from "../Map";

/**
 * Control for drawing polygon features.
 * @alias sGis.control.Polygon
 */
export class PolygonControl extends PolyControl {
    /**
     * @param map - map the control will work with
     * @param properties - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolygonSymbol(), ...controlOptions}: ControlWithSymbolParams = {}) {
        super(map, {symbol, ...controlOptions});
    }

    protected _getNewFeature(position: Coordinates): Poly {
        return new Polygon([[position, position]], {crs: this.map.crs, symbol: this.symbol});
    }
}


