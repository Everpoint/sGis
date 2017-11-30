import {Control} from "./Control";
import {PointFeature} from "../features/Point";

/**
 * Control for editing point features. When activeFeature is set, the feature is becoming draggable.
 * @alias sGis.controls.PointEditor
 */
export class PointEditor extends Control {
    private _activeFeature: PointFeature;
    ignoreEvents = false;

    /**
     * @param {sGis.Map} map - map object the control will work with
     * @param {Object} [options] - key-value set of properties to be set to the instance
     */
    constructor(map, {snappingProvider = null, isActive = false, activeLayer = null} = {}) {
        super(map, {useTempLayer: true, snappingProvider, activeLayer});
        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        this.isActive = isActive;
    }

    _activate() {
        if (!this._activeFeature) return;

        this._activeFeature.on('dragStart', this._handleDragStart);
        this._activeFeature.on('drag', this._handleDrag);
        this._activeFeature.on('dragEnd', this._handleDragEnd);
    }

    _deactivate() {
        if (!this._activeFeature) return;

        this._activeFeature.off('dragStart', this._handleDragStart);
        this._activeFeature.off('drag', this._handleDrag);
        this._activeFeature.off('dragEnd', this._handleDragEnd);
    }

    /**
     * Point to drag. If set to null, the control is deactivated.
     */
    get activeFeature() { return this._activeFeature; }
    set activeFeature(/** sGis.feature.Point */ feature) {
        this.deactivate();

        this._activeFeature = feature;
        if (feature) this.activate();
    }

    _handleDragStart(sGisEvent) {
        if (this.ignoreEvents) return;

        sGisEvent.draggingObject = this._activeFeature;
        sGisEvent.stopPropagation();
    }

    _handleDrag(sGisEvent) {
        this._activeFeature.position = this._snap(sGisEvent.point.position, sGisEvent.browserEvent.altKey);
        if (this.activeLayer) this.activeLayer.redraw();
    }

    _handleDragEnd() {
        this.fire('edit');
    }
}

/**
 * Dragging of the point if finished and the feature is released.
 * @event sGis.controls.PointEditor#edit
 * @type {Object}
 * @mixes sGisEvent
 */
