import {Control, ControlParams, DrawingBeginEvent, DrawingFinishEvent, PointAddEvent} from "./Control";
import {MultiPoint} from "../features/MultiPoint";
import {PointSymbol} from "../symbols/point/Point";
import {Symbol} from "../symbols/Symbol";
import {PointFeature} from "../features/PointFeature";
import {sGisClickEvent, sGisDoubleClickEvent} from "../commonEvents";
import {Map} from "../Map";
import {sGisEvent} from "../EventHandler";
import {IPoint} from "../Point";

/**
 * Control for creating multipoints. When active, every click on the map will add a new point to the current multipoint.
 * Double click will finish drawing of current multipoint and start a new one.<br><br>
 *
 * When control is activated, a temporary feature layer is created and added to the map. Feature is drawn on that temp
 * layer. After drawing is finished, if .activeLayer is set, the created feature is removed from the temp layer and
 * added to the active layer.
 *
 * @alias sGis.controls.MultiPoint
 * @fires [[DrawingBeginEvent]]
 * @fires [[PointAddEvent]]
 * @fires [[DrawingFinishEvent]]
 */
export class MultiPointControl extends Control {
    private _dblClickTime: number = 0;
    private _activeFeature: MultiPoint | null = null;

    dblClickTimeout: number = 30;
    symbol: Symbol<PointFeature> = new PointSymbol();

    constructor(map: Map, {snappingProvider, activeLayer, isActive = false}: ControlParams = {}) {
        super(map, {snappingProvider, activeLayer, useTempLayer: true});
        this._handleClick = this._handleClick.bind(this);
        this._handleDblclick = this._handleDblclick.bind(this);

        this.isActive = isActive;
    }

    protected _activate(): void {
        this.map.on(sGisClickEvent.type, this._handleClick);
    }

    protected _deactivate(): void {
        this.cancelDrawing();
        this.map.off(sGisClickEvent.type, this._handleClick);
    }

    private _handleClick(event: sGisEvent): void {
        let clickEvent = event as sGisClickEvent;
        setTimeout(() => {
            if (Date.now() - this._dblClickTime < this.dblClickTimeout) return;
            if (this._activeFeature) {
                this._activeFeature.addPoint(clickEvent.point);
            } else {
                this.startNewFeature(clickEvent.point);
                this.fire(new DrawingBeginEvent());
            }
            this.fire(new PointAddEvent());

            if (this._tempLayer) this._tempLayer.redraw();
        }, 10);

        event.stopPropagation();
    }

    /**
     * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
     * @param point
     */
    startNewFeature(point: IPoint): void {
        this.activate();
        this.cancelDrawing();

        this._activeFeature = new MultiPoint([point.position], { crs: this.map.crs, symbol: this.symbol });
        if (this._tempLayer) this._tempLayer.add(this._activeFeature);

        this._setHandlers();
    }

    private _setHandlers(): void {
        this.map.on(sGisDoubleClickEvent.type, this._handleDblclick);
    }

    /**
     * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
     */
    cancelDrawing(): void {
        if (!this._activeFeature) return;

        this.map.off(sGisDoubleClickEvent.type, this._handleDblclick);

        if (this._tempLayer && this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
        this._activeFeature = null;
    }

    private _handleDblclick(event: sGisEvent) {
        if (!this._activeFeature) return;

        let dblclickEvent = event as sGisDoubleClickEvent;
        let feature = this._activeFeature;
        this.finishDrawing();
        event.stopPropagation();
        this._dblClickTime = Date.now();
        this.fire(new DrawingFinishEvent(feature, dblclickEvent.browserEvent ));
    }

    /**
     * Finishes drawing of the current feature and moves it to the active layer (if set).
     */
    finishDrawing() {
        let feature = this._activeFeature;
        this.cancelDrawing();
        if (this.activeLayer && feature) this.activeLayer.add(feature);
    }

    /**
     * The active drawing feature.
     */
    get activeFeature(): MultiPoint | null { return this._activeFeature; }
    set activeFeature(feature: MultiPoint | null) {
        if (!this._isActive) return;
        this.cancelDrawing();

        this._activeFeature = feature;
        this._setHandlers();
    }
}
