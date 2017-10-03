import {EventHandler} from "../EventHandler";
import {Map} from "../Map";
import {FeatureLayer} from "../FeatureLayer";

/**
 * Base class of all controls. Controls are objects that provide methods for setting interactions between user and map.
 * @alias sGis.Control
 * @extends sGis.EventHandler
 */
export class Control extends EventHandler {
    private _map: Map;
    private _activeLayer: FeatureLayer;

    protected _isActive: boolean = false;

    /**
     * @param {sGis.Map} map
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(map, properties?: Object) {
        super();
        Object.assign(this, properties);
        this._map = map;
    }

    /**
     * Makes the control active, setting event handlers on the map
     */
    activate() {
        this.isActive = true;
    }

    /**
     * Makes the control inactive, removing all event handlers and removing any temp objects
     */
    deactivate() {
        this.isActive = false;
    }

    _activate() {
        // abstract method, must be implemented in child
    }

    _deactivate() {
        // abstract method, must be implemented in child
    }

    /**
     * Vector layer the control will work with. Some controls do not require active layer to be set.
     * @type {sGis.FeatureLayer}
     */
    get activeLayer() { return this._activeLayer; }
    set activeLayer(/** sGis.FeatureLayer */ layer) { this._activeLayer = layer; }

    /**
     * Active status of the control.
     * @type {Boolean}
     * @default false
     */
    get isActive() { return this._isActive; }
    set isActive(/** Boolean */ bool) {
        if (!this._map) return;
        bool = !!bool;
        if (this._isActive === bool) return;
        this._isActive = bool;

        if (bool) {
            this._activate();
        } else {
            this._deactivate();
        }

    }

    /**
     * Map the control works with.
     * @type {sGis.Map}
     * @readonly
     */
    get map() { return this._map; }
}