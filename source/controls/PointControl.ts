import {Control, ControlWithSymbolParams, DrawingFinishEvent} from "./Control";
import {PointFeature} from "../features/PointFeature";
import {PointSymbol} from "../symbols/point/Point";
import {sGisClickEvent, sGisMouseMoveEvent} from "../commonEvents";
import {Map} from "../Map";
import {Symbol} from "../symbols/Symbol";

/**
 * Control for creating point features. When active, any click on the map will create a new point feature and add it
 * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
 * @alias sGis.controls.Point
 * @fires [[DrawingFinishEvent]]
 */
export class PointControl extends Control {
    /** Symbol of the points that are created by the control. */
    symbol: Symbol<PointFeature>;

    /**
     * @param map
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {activeLayer = null, snappingProvider = null, isActive = false, symbol = new PointSymbol()}: ControlWithSymbolParams = {}) {
        super(map, {activeLayer, snappingProvider, useTempLayer: true});

        this._handleClick = this._handleClick.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);

        this.symbol = symbol;
        this.isActive = isActive;
    }

    protected _activate(): void {
        this.map.on(sGisClickEvent.type, this._handleClick);
        this.map.on(sGisMouseMoveEvent.type, this._handleMouseMove);
    }

    protected _deactivate(): void {
        this.map.off(sGisClickEvent.type, this._handleClick);
        this.map.off(sGisMouseMoveEvent.type, this._handleMouseMove);
    }

    private _handleClick(event: sGisClickEvent): void {
        event.stopPropagation();

        let feature = new PointFeature(this._snap(event.point.position, event.browserEvent.altKey), {crs: this.map.crs, symbol: this.symbol});

        if (this.activeLayer) this.activeLayer.add(feature);
        this.fire(new DrawingFinishEvent(feature, event.browserEvent));
    }

    private _handleMouseMove(event: sGisMouseMoveEvent): void {
        this._snap(event.point.position, event.browserEvent.altKey);
    }
}
