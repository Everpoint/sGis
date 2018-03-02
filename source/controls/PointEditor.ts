import {Control, ControlParams, EditEvent} from "./Control";
import {PointFeature} from "../features/PointFeature";
import {DragEndEvent, DragEvent, DragStartEvent} from "../commonEvents";
import {Map} from "../Map";
import {sGisEvent} from "../EventHandler";

/**
 * Control for editing point features. When activeFeature is set, the feature is becoming draggable.
 * @alias sGis.controls.PointEditor
 * @fires [[EditEvent]]
 */
export class PointEditor extends Control {
    private _activeFeature: PointFeature | null = null;
    ignoreEvents: boolean = false;

    /**
     * @param map - map object the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {snappingProvider, isActive = false, activeLayer}: ControlParams = {}) {
        super(map, {useTempLayer: true, snappingProvider, activeLayer});

        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);

        this.isActive = isActive;
    }

    protected _activate(): void {
        if (!this._activeFeature) return;

        this._activeFeature.on(DragStartEvent.type, this._handleDragStart);
        this._activeFeature.on(DragEvent.type, this._handleDrag);
        this._activeFeature.on(DragEndEvent.type, this._handleDragEnd);
    }

    protected _deactivate(): void {
        if (!this._activeFeature) return;

        this._activeFeature.off(DragStartEvent.type, this._handleDragStart);
        this._activeFeature.off(DragEvent.type, this._handleDrag);
        this._activeFeature.off(DragEndEvent.type, this._handleDragEnd);
    }

    /**
     * Point to drag. If set to null, the control is deactivated.
     */
    get activeFeature(): PointFeature | null { return this._activeFeature; }
    set activeFeature(feature: PointFeature | null) {
        this.deactivate();

        this._activeFeature = feature;
        if (feature) this.activate();
    }

    private _handleDragStart(event: sGisEvent): void {
        if (this.ignoreEvents || !this._activeFeature) return;

        let dragStartEvent = event as DragStartEvent;
        dragStartEvent.draggingObject = this._activeFeature;
        event.stopPropagation();
    }

    private _handleDrag(event: sGisEvent): void {
        if (!this._activeFeature) return;
        let dragEvent = event as DragEvent;
        this._activeFeature.position = this._snap(dragEvent.point.position, dragEvent.browserEvent.altKey);
        if (this.activeLayer) this.activeLayer.redraw();
    }

    private _handleDragEnd(): void {
        this.fire(new EditEvent());
    }
}
