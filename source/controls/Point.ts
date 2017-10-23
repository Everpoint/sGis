import {Control} from "./Control";
import {PointFeature} from "../features/Point";
import {PointSymbol} from "../symbols/point/Point";

/**
 * Control for creating point features. When active, any click on the map will create a new point feature and add it
 * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
 * @alias sGis.controls.Point
 * @extends sGis.Control
 * @fires sGis.controls.Point#drawingFinish
 */
export class PointControl extends Control {
    /** Symbol of the points that are created by the control. */
    symbol = new PointSymbol();

    /**
     * @param {sGis.Map} map
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(map, properties: any = {}) {
        super(map, properties);
        this._handleClick = this._handleClick.bind(this);
        this.isActive = properties.isActive;
    }

    _activate() {
        this.map.addListener('click', this._handleClick);
    }

    _deactivate() {
        this.map.removeListener('click', this._handleClick);
    }

    _handleClick(sGisEvent) {
        sGisEvent.stopPropagation();

        let point = sGisEvent.point.projectTo(this.map.crs);
        let feature = new PointFeature(point.position, {crs: this.map.crs, symbol: this.symbol});

        if (this.activeLayer) this.activeLayer.add(feature);
        this.fire('drawingFinish', { feature: feature });
    }
}

/**
 * A point is drawn and is added to the active layer (if set).
 * @event sGis.controls.Point#drawingFinish
 * @type {Object}
 * @mixes sGisEvent
 * @prop {sGis.feature.Point} feature - point that was created.
 */
