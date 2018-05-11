import {
    ChangeEvent,
    Control, ControlWithSymbolParams, DrawingBeginEvent, DrawingFinishEvent,
    PointAddEvent
} from "./Control";
import {Poly} from "../features/Poly";
import {Coordinates} from "../baseTypes";
import {sGisClickEvent, sGisDoubleClickEvent, sGisMouseMoveEvent} from "../commonEvents";
import {IPoint} from "../Point";
import {Symbol} from "../symbols/Symbol";
import {sGisEvent} from "../EventHandler";
import {Map} from "../Map";

/**
 * Base class for polyline and polygon controls. When active, click on the map will start a new feature, then
 * every next click adds a new point to the feature. If ctrl is held during click, new point is added and then new
 * ring drawing starts. Feature is completed by double click.<br><br>
 *
 * When control is activated, a temporary feature layer is created and added to the map. Feature is drawn on that temp
 * layer. After drawing is finished, if .activeLayer is set, the created feature is removed from the temp layer and
 * added to the active layer.
 *
 * @alias sGis.controls.Poly
 */
export abstract class PolyControl extends Control {
    private _dblClickTime: number = 0;
    private _activeFeature: Poly | null = null;

    /**
     * Symbol with which new features will be created.
     */
    symbol: Symbol<Poly>;

    /**
     * @param map - map the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    protected constructor(map: Map, {snappingProvider, activeLayer, isActive = false, symbol}: ControlWithSymbolParams = {}) {
        super(map, {snappingProvider, activeLayer, useTempLayer: true});

        this._handleClick = this._handleClick.bind(this);
        this._handleMousemove = this._handleMousemove.bind(this);
        this._handleDblclick = this._handleDblclick.bind(this);

        this.symbol = symbol;
        this.isActive = isActive;
    }

    protected _activate(): void {
        this.map.on(sGisClickEvent.type, this._handleClick);
        this.map.on(sGisMouseMoveEvent.type, this._handleMousemove);
        this.map.on(sGisDoubleClickEvent.type, this._handleDblclick);
    }

    protected _deactivate(): void {
        this.cancelDrawing();
        this.map.off(sGisClickEvent.type, this._handleClick);
        this.map.off(sGisMouseMoveEvent.type, this._handleMousemove);
        this.map.off(sGisDoubleClickEvent.type, this._handleDblclick);
    }

    private _handleClick(event: sGisEvent): void {
        let clickEvent = event as sGisClickEvent;
        setTimeout(() => {
            if (Date.now() - this._dblClickTime < 30) return;
            if (this._activeFeature) {
                if (clickEvent.browserEvent.ctrlKey) {
                    this.startNewRing();
                } else {
                    this._activeFeature.addPoint(this._snap(clickEvent.point.position, clickEvent.browserEvent.altKey), this._activeFeature.rings.length - 1);
                }
            } else {
                this.startNewFeature(clickEvent.point);
                this.fire(new DrawingBeginEvent());
            }
            this.fire(new PointAddEvent());

            if (this._tempLayer) this._tempLayer.redraw();
        }, 10);

        event.stopPropagation();
    }

    protected abstract _getNewFeature(position: Coordinates): Poly;

    /**
     * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
     * @param point
     */
    startNewFeature(point: IPoint): void {
        this.activate();
        this.cancelDrawing();

        this._activeFeature = this._getNewFeature(point.position);
        if (this._tempLayer) this._tempLayer.add(this._activeFeature);
    }

    private _handleMousemove(event: sGisEvent): void {
        let mousemoveEvent = event as sGisMouseMoveEvent;
        let position = this._snap(mousemoveEvent.point.position, mousemoveEvent.browserEvent.altKey);
        if (!this._activeFeature) return;

        let ringIndex = this._activeFeature.rings.length - 1;
        let pointIndex = this._activeFeature.rings[ringIndex].length - 1;

        this._activeFeature.rings[ringIndex][pointIndex] = this._snap(position, mousemoveEvent.browserEvent.altKey, this._activeFeature.rings[ringIndex], pointIndex, this._activeFeature.isEnclosed);
        this._activeFeature.redraw();
        if (this._tempLayer) this._tempLayer.redraw();

        this.fire(new ChangeEvent(ringIndex, pointIndex));
    }

    private _handleDblclick(event: sGisEvent): void {
        let feature = this._activeFeature;
        if (!feature) return;

        let dblclickEvent = event as sGisDoubleClickEvent;
        this.finishDrawing();
        event.stopPropagation();
        this._dblClickTime = Date.now();
        this.fire(new DrawingFinishEvent(feature, dblclickEvent.browserEvent));
    }

    /**
     * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
     */
    cancelDrawing(): void {
        if (!this._activeFeature || !this._tempLayer) return;

        if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
        this._activeFeature = null;
        this._unsnap();
    }

    /**
     * Finishes drawing of the current feature and moves it to the active layer (if set). If the current ring has less
     * then two points, the ring is removed. If the feature has no rings, the feature is not added to the active layer.
     */
    finishDrawing(): void {
        let feature = this._activeFeature;
        if (!feature) return;
        let ringIndex = feature.rings.length - 1;

        this.cancelDrawing();
        if (ringIndex === 0 && feature.rings[ringIndex].length < 3) return;

        feature.removePoint(ringIndex, feature.rings[ringIndex].length - 1);

        if (this.activeLayer) this.activeLayer.add(feature);
    }

    /**
     * Start drawing of a new ring of the feature.
     */
    startNewRing(): void {
        if (!this._activeFeature) return;

        let rings = this._activeFeature.rings;
        let ringIndex = rings.length;
        let point = rings[ringIndex-1][rings[ringIndex-1].length-1];
        this._activeFeature.setRing(ringIndex, [point]);
    }

    /**
     * The active drawing feature.
     */
    get activeFeature(): Poly | null { return this._activeFeature; }
    set activeFeature(feature: Poly | null) {
        if (!this._isActive) return;
        this.cancelDrawing();

        this._activeFeature = feature;
    }
}
