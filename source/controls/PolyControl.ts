import {Control, ControlConstructorParams} from "./Control";
import {FeatureLayer} from "../FeatureLayer";
import {Symbol} from "../symbols/Symbol";
import {Poly} from "../features/Poly";
import {Coordinates} from "../baseTypes";
import {sGisEvent} from "../EventHandler";
import {Polygon} from "../features/Polygon";

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
    private _dblClickTime: number;
    private _activeFeature: Poly;

    /**
     * @param map - map the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map, {snappingProvider = null, activeLayer = null, isActive = false} = {}) {
        super(map, {snappingProvider, activeLayer, useTempLayer: true});

        this._handleClick = this._handleClick.bind(this);
        this._handleMousemove = this._handleMousemove.bind(this);
        this._handleDblclick = this._handleDblclick.bind(this);

        this.isActive = isActive;
    }

    _activate() {
        this.map.on('click', this._handleClick);
        this.map.on('mousemove', this._handleMousemove);
        this.map.on('dblclick', this._handleDblclick);
    }

    _deactivate() {
        this.cancelDrawing();
        this.map.off('click', this._handleClick);
        this.map.off('mousemove', this._handleMousemove);
        this.map.off('dblclick', this._handleDblclick);
    }

    _handleClick(sGisEvent) {
        setTimeout(() => {
            if (Date.now() - this._dblClickTime < 30) return;
            if (this._activeFeature) {
                if (sGisEvent.ctrlKey) {
                    this.startNewRing();
                } else {
                    this._activeFeature.addPoint(this._snap(sGisEvent.point.position, sGisEvent.browserEvent.altKey), this._activeFeature.rings.length - 1);
                }
            } else {
                this.startNewFeature(sGisEvent.point);
                this.fire('drawingBegin');
            }
            this.fire('pointAdd');

            this._tempLayer.redraw();
        }, 10);

        sGisEvent.stopPropagation();
    }

    protected abstract _getNewFeature(position: Coordinates): Poly;

    /**
     * Starts a new feature with the first point at given position. If the control was not active, this method will set it active.
     * @param point
     */
    startNewFeature(point) {
        this.activate();
        this.cancelDrawing();

        this._activeFeature = this._getNewFeature(point.position);
        this._tempLayer.add(this._activeFeature);
    }

    _handleMousemove(sGisEvent) {
        let position = this._snap(sGisEvent.point.position, sGisEvent.browserEvent.altKey);
        if (!this._activeFeature) return;

        let ringIndex = this._activeFeature.rings.length - 1;
        let pointIndex = this._activeFeature.rings[ringIndex].length - 1;

        const isPolygon = this._activeFeature instanceof Polygon;

        this._activeFeature.rings[ringIndex][pointIndex] = this._snap(position, sGisEvent.browserEvent.altKey, this._activeFeature.rings[ringIndex], pointIndex, isPolygon);
        this._activeFeature.redraw();
        this._tempLayer.redraw();

        this.fire('mousemove');
    }

    _handleDblclick(sGisEvent) {
        let feature = this._activeFeature;
        if (!feature) return;

        this.finishDrawing();
        sGisEvent.stopPropagation();
        this._dblClickTime = Date.now();
        this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
    }

    /**
     * Cancels drawing of the current feature, removes the feature and the temp layer. No events are fired.
     */
    cancelDrawing() {
        if (!this._activeFeature) return;

        if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
        this._activeFeature = null;
        this._unsnap();
    }

    /**
     * Finishes drawing of the current feature and moves it to the active layer (if set). If the current ring has less
     * then two points, the ring is removed. If the feature has no rings, the feature is not added to the active layer.
     */
    finishDrawing() {
        let feature = this._activeFeature;
        let ringIndex = feature.rings.length - 1;

        this.cancelDrawing();
        if (ringIndex === 0 && feature.rings[ringIndex].length < 3) return;

        feature.removePoint(ringIndex, feature.rings[ringIndex].length - 1);

        if (this.activeLayer) this.activeLayer.add(feature);
    }

    /**
     * Start drawing of a new ring of the feature.
     */
    startNewRing() {
        let rings = this._activeFeature.rings;
        let ringIndex = rings.length;
        let point = rings[ringIndex-1][rings[ringIndex-1].length-1];
        this._activeFeature.setRing(ringIndex, [point]);
    }

    /**
     * The active drawing feature.
     */
    get activeFeature() { return this._activeFeature; }
    set activeFeature(feature) {
        if (!this._isActive) return;
        this.cancelDrawing();

        this._activeFeature = feature;
    }
}

/**
* The drawing of a new feature is started by clicking on the map.
* @event sGis.controls.Poly#drawingBegin
* @type {Object}
* @mixes sGisEvent
*/

/**
 * A new point is added to the feature by clicking on the map.
 * @event sGis.controls.Poly#pointAdd
 * @type {Object}
 * @mixes sGisEvent
 */

/**
 * Drawing of the feature is finished by double click and the feature is moved to the active layer (if set).
 * @event sGis.controls.Poly#drawingFinish
 * @type {Object}
 * @mixes sGisEvent
 * @prop {sGis.feature.Poly} feature - feature that was created
 */
