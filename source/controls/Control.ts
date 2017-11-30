import {EventHandler} from "../EventHandler";
import {Map} from "../Map";
import {FeatureLayer} from "../FeatureLayer";
import {ISnappingProvider} from "./snapping/ISnappingProvider";
import {Contour, Coordinates} from "../baseTypes";
import {PointFeature} from "../features/Point";
import {CrossPointSymbol} from "../symbols/point/CrossPointSymbol";
import {Symbol} from "../symbols/Symbol";

export interface ControlConstructorParams {
    useTempLayer?: boolean,
    snappingProvider?: ISnappingProvider,
    activeLayer?: FeatureLayer
}

/**
 * Base class of all controls. Controls are objects that provide methods for setting interactions between user and map.
 * @alias sGis.Control
 */
export abstract class Control extends EventHandler {
    private _map: Map;
    private _activeLayer: FeatureLayer;
    private _snappingFeature: PointFeature;
    private _snappingSymbol: Symbol = new CrossPointSymbol();

    protected _isActive: boolean = false;
    protected _tempLayer: FeatureLayer | null = null;

    useTempLayer: boolean = false;
    snappingProvider: ISnappingProvider | null = null;

    /**
     * @param map
     * @param options - key-value set of properties to be set to the instance
     */
    constructor(map, options: ControlConstructorParams = {}) {
        super();
        Object.assign(this, options);
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

    protected abstract _activate();

    protected abstract _deactivate();

    /**
     * Vector layer the control will work with. Some controls do not require active layer to be set.
     */
    get activeLayer() { return this._activeLayer; }
    set activeLayer(layer) { this._activeLayer = layer; }

    /**
     * Active status of the control.
     */
    get isActive(): boolean { return this._isActive; }
    set isActive(bool: boolean) {
        if (!this._map || this._isActive === bool) return;
        this._isActive = bool;

        if (bool) {
            if (this.useTempLayer) {
                this._tempLayer = new FeatureLayer();
                this._map.addLayer(this._tempLayer);
            }
            this._activate();
        } else {
            this._deactivate();
            if (this._map.contains(this._tempLayer)) {
                this._map.removeLayer(this._tempLayer);
            }
            this._tempLayer = null;
        }
    }

    protected _snap(point: Coordinates, isAltPressed: boolean, activeContour?: Contour, activeIndex?: number, isPolygon?: boolean): Coordinates {
        let snappingPoint = null;
        if (!isAltPressed && this.snappingProvider) {
            snappingPoint = this.snappingProvider.getSnappingPoint(point, activeContour, activeIndex, isPolygon);
        }

        if (this._tempLayer) {
            const snappingFeature = this._getSnappingFeature(snappingPoint);
            if (snappingPoint && !this._tempLayer.has(snappingFeature)) {
                this._tempLayer.add(snappingFeature);
            } else if (!snappingPoint && this._tempLayer.has(snappingFeature)) {
                this._tempLayer.remove(snappingFeature);
            }
            this._tempLayer.redraw();
        }

        return snappingPoint || point;
    }

    protected _unsnap() {
        if (this._tempLayer && this._snappingFeature && this._tempLayer.has(this._snappingFeature)) {
            this._tempLayer.remove(this._snappingFeature);
        }
    }

    private _getSnappingFeature(point: Coordinates | null): PointFeature {
        if (!this._snappingFeature) {
            this._snappingFeature = new PointFeature([0, 0], {crs: this._map.crs, symbol: this._snappingSymbol});
        }

        if (point) {
            this._snappingFeature.position = point;
        }

        return this._snappingFeature;
    }

    /**
     * Map the control works with.
     */
    get map() { return this._map; }
}