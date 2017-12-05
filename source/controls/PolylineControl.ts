import {PolyControl} from "./PolyControl";
import {PolylineSymbol} from "../symbols/PolylineSymbol";
import {Polyline} from "../features/Polyline";
import {Poly} from "../features/Poly";
import {ControlWithSymbolParams} from "./Control";
import {Map} from "../Map";
import {Coordinates} from "../baseTypes";

/**
 * Control for drawing polyline features.
 * @alias sGis.controls.Polyline
 */
export class PolylineControl extends PolyControl {
    /**
     * @param map - map the control will work with
     * @param properties - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolylineSymbol(), ...controlOptions}: ControlWithSymbolParams = {}) {
        super(map, {symbol, ...controlOptions});
    }

    protected _getNewFeature(position: Coordinates): Poly {
        return new Polyline([[position, position]], {crs: this.map.crs, symbol: this.symbol});
    }
}
