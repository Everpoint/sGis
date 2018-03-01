import {Control, ControlWithSymbolParams, DrawingBeginEvent, DrawingFinishEvent} from "./Control";
import {PolygonSymbol} from "../symbols/polygon/Simple";
import {Polygon} from "../features/Polygon";
import {Map} from "../Map";
import {Symbol} from "../symbols/Symbol";
import {Contour} from "../baseTypes";
import {IPoint} from "../Point";
import {DragEndEvent, DragEvent, DragStartEvent} from "../commonEvents";
import {Poly} from "../features/Poly";

/**
 * Base class for controls that create polygon feature by dragging some area on the map. When the control is activated,
 * a new temporary layer is created and added to the map. The feature is drawn on that temp layer. After drawing is
 * finished, if the .activeLayer property is set, the feature is moved to the active layer.
 * @alias sGis.controls.PolyDrag
 * @fires [[DrawingBeginEvent]]
 * @fires [[DrawingFinishEvent]]
 */
export abstract class PolyDrag extends Control {
    /**
     * Symbol that will be used for features created by this control.
     */
    symbol: Symbol<Poly>;
    protected _activeFeature: Polygon | null;

    /**
     * @param map - map the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {symbol = new PolygonSymbol(), activeLayer = null, isActive = false}: ControlWithSymbolParams = {}) {
        super(map, {activeLayer, useTempLayer: true});

        this.symbol = symbol;

        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);

        this.isActive = isActive;
    }

    protected _activate(): void {
        this.map.on(DragStartEvent.type, this._handleDragStart);
    }

    protected _deactivate(): void {
        this._activeFeature = null;
        this._removeDragListeners();
        this.map.off(DragStartEvent.type, this._handleDragStart);
    }

    private _handleDragStart(event: DragStartEvent): void {
        this._activeFeature = new Polygon(this._getNewCoordinates(event.point), {crs: event.point.crs, symbol: this.symbol});
        this._tempLayer.add(this._activeFeature);

        this.map.on(DragEvent.type, this._handleDrag);
        this.map.on(DragEndEvent.type, this._handleDragEnd);

        this.fire(new DrawingBeginEvent());
    }

    private _handleDrag(event: DragEvent): void {
        this._activeFeature.rings = this._getUpdatedCoordinates(event.point);

        this._tempLayer.redraw();
        event.stopPropagation();
    }

    private _handleDragEnd(event: DragEndEvent): void {
        let feature = this._activeFeature;
        this._activeFeature = null;
        if (this._tempLayer && this._tempLayer.has(feature)) {
            this._tempLayer.remove(feature);
        }
        this._removeDragListeners();

        if (this.activeLayer) this.activeLayer.add(feature);
        this.fire(new DrawingFinishEvent(feature, event.browserEvent));
    }

    private _removeDragListeners(): void {
        this.map.off(DragEvent.type, this._handleDrag);
        this.map.off(DragEndEvent.type, this._handleDragEnd);
    }

    /**
     * This method is called when a new feature is started. Returns coordinates set for the new feature based on where the drawing has started.
     * @param point - position of the new feature.
     */
    protected abstract _getNewCoordinates(point: IPoint): Contour[];

    /**
     * This method is called when the coordinates of the active feature must be updated. Returns new coordinates of the feature.
     * @param point
     */
    protected abstract _getUpdatedCoordinates(point: IPoint): Contour[];

    /**
     * The feature being drawn.
     */
    get activeFeature(): Polygon { return this._activeFeature; }
}
