import {EventHandler} from "./EventHandler";
import {Bbox} from "./Bbox";
import {Feature} from "./features/Feature";
import {ResolutionLimits} from "./baseTypes";

/**
 * Base class for all map layers.
 * @alias sGis.Layer
 * @extends sGis.EventHandler
 */
export abstract class Layer extends EventHandler {
    private _isDisplayed: boolean = true;
    protected _opacity: number = 1.0;
    private _resolutionLimits: ResolutionLimits = [-1, -1];

    /** If set to true, the layer will be updated only after map position change has ended (e.g. pan or zoom end). If set to true, the layer will be redrawn on every change. */
    delayedUpdate: boolean = false;

    /** If set to true, the layer rendering will not be updated (though the feature lists will be requested as needed). This is intended for lazy object update without "jumping" effect. */
    updateProhibited: boolean = false;

    /**
     * @constructor
     * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
     */
    constructor(properties?: Object) {
        super();

        if (properties) Object.assign(this, properties);
    }

    /**
     * Returns the array of features to be drawn for given parameters.
     * @param {sGis.Bbox} bbox - bounding box of the area to get features from
     * @param {Number} resolution - current resolution
     * @returns {sGis.Feature[]}
     */
    abstract getFeatures(bbox: Bbox, resolution: number): Feature[]

    /**
     * Whether the layer is drawn to map
     * @type Boolean
     * @default true
     * @fires sGis.Layer#propertyChange
     */
    get isDisplayed(): boolean { return this._isDisplayed; }
    set isDisplayed(bool: boolean) {
        this._isDisplayed = bool;
        this.fire('visibilityChange');
    }

    /**
     * Return true if the layer is displayed and the resolution is inside the limits
     * @param resolution
     * @returns {Boolean|*|boolean}
     */
    checkVisibility(resolution: number): boolean {
        return this._isDisplayed && (this.resolutionLimits[0] < 0 || resolution >= this.resolutionLimits[0]) && (this.resolutionLimits[1] < 0 || resolution <= this.resolutionLimits[1]);
    }

    /**
     * Makes the layer visible
     * @fires sGis.Layer#propertyChange
     */
    show(): void {
        this.isDisplayed = true;
    }

    /**
     * Makes the layer invisible
     * @fires sGis.Layer#propertyChange
     */
    hide(): void {
        this.isDisplayed = false;
    }

    /**
     * Opacity of the layer. It sets the opacity of all objects in this layer. Valid values: [0..1].
     * @type Number
     * @default 1
     * @fires sGis.Layer#propertyChange
     */
    get opacity(): number { return this.getOpacity(); }
    set opacity(opacity: number) { this.setOpacity(opacity); }

    protected getOpacity() { return this._opacity; }
    protected setOpacity(opacity) {
        opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
        this._opacity = opacity;
        this.fire('propertyChange', {property: 'opacity'});
    }

    /**
     * Min and max resolution between which the layer will be displayed. Must be in [min, max] format. Negative values are treated as no limit.
     * @type Number[]
     * @default [-1, -1]
     * @fires sGis.Layer#propertyChange
     * @fires sGis.Layer#propertyChange
     */
    get resolutionLimits(): ResolutionLimits { return this._resolutionLimits; }
    set resolutionLimits(limits: ResolutionLimits) {
        this._resolutionLimits = limits;
        this.fire('propertyChange', {property: 'resolutionLimits'});
    }

    /**
     * Forces redrawing of the layer
     * @fires sGis.Layer#propertyChange
     */
    redraw(): void {
        this.fire('propertyChange', {property: 'content'});
    }
}


/**
 * A property of the layer has changed. Fired when redrawing is required.
 * @event sGis.Layer#propertyChange
 * @type {Object}
 * @mixes sGisEvent
 * @prop {String} property - the name of the property that has been changed
 */

/**
 * @typedef {function(Object)} sGis.Layer.constructor
 * @returns sGis.Layer
 */
