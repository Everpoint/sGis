import {Control} from "./Control";
import {PointFeature} from "../features/Point";
import {PointSymbol} from "../symbols/point/Point";

/**
 * Control for creating point features. When active, any click on the map will create a new point feature and add it
 * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
 * @alias sGis.controls.Point
 */
export class PointControl extends Control {
    /** Symbol of the points that are created by the control. */
    symbol = new PointSymbol();

    /**
     * @param {sGis.Map} map
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(map, {activeLayer = null, snappingProvider = null, isActive = false} = {}) {
        super(map, {activeLayer, snappingProvider, useTempLayer: true});
        this._handleClick = this._handleClick.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this.isActive = isActive;
    }

    _activate() {
        this.map.addListener('click', this._handleClick);
        this.map.on('mousemove', this._handleMouseMove);
    }

    _deactivate() {
        this.map.removeListener('click', this._handleClick);
        this.map.off('mousemove', this._handleMouseMove);
    }

    _handleClick(sGisEvent) {
        sGisEvent.stopPropagation();

        let feature = new PointFeature(this._snap(sGisEvent.point.position, sGisEvent.browserEvent.altKey), {crs: this.map.crs, symbol: this.symbol});

        if (this.activeLayer) this.activeLayer.add(feature);
        this.fire('drawingFinish', { feature: feature });
    }

    _handleMouseMove(sGisEvent) {
        this._snap(sGisEvent.point.position, sGisEvent.browserEvent.altKey);
    }
}

/**
 * A point is drawn and is added to the active layer (if set).
 * @event sGis.controls.Point#drawingFinish
 * @type {Object}
 * @mixes sGisEvent
 * @prop {sGis.feature.Point} feature - point that was created.
 */
