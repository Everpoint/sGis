import {EventHandler, sGisEvent} from "../EventHandler";
import {Bbox} from "../Bbox";
import {ResolutionLimits} from "../baseTypes";
import {Render} from "../renders/Render";

export interface LayerConstructorParams {
    delayedUpdate?: boolean,
    resolutionLimits?: ResolutionLimits,
    opacity?: number,
    isDisplayed?: boolean
}

/**
 * Some property of the layer has been changed
 * @event PropertyChangeEvent
 */
export class PropertyChangeEvent extends sGisEvent {
    static type: string = 'propertyChange';

    /**
     * Name of the property that has been changed
     */
    readonly property: string;

    /**
     * @param propertyName - ame of the property that has been changed
     */
    constructor(propertyName: string) {
        super(PropertyChangeEvent.type);
        this.property = propertyName;
    }
}

/**
 * Visibility property of the layer has been changed.
 * @event VisibilityChangeEvent
 */
export class VisibilityChangeEvent extends sGisEvent {
    static type: string = 'visibilityChange';

    constructor() {
        super(VisibilityChangeEvent.type);
    }
}

/**
 * Base class for all map layers. A layer is a container for features, that is responsible for filter out (or create)
 * features for requested bbox and resolution.
 * @alias sGis.Layer
 */
export abstract class Layer extends EventHandler {
    private _isDisplayed: boolean;
    private _resolutionLimits: ResolutionLimits;

    protected _opacity: number;

    /** If set to true, the layer will be updated only after map position change has ended (e.g. pan or zoom end). If set to true, the layer will be redrawn on every change. */
    delayedUpdate: boolean;

    /** If set to true, the layer rendering will not be updated (though the feature lists will be requested as needed). This is intended for lazy object update without "jumping" effect. */
    updateProhibited: boolean;

    /**
     * @param __namedParameters - properties to be set to the corresponding fields
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance
     */
    constructor({ delayedUpdate = false, resolutionLimits = [-1, -1], opacity = 1, isDisplayed = true}: LayerConstructorParams = {}, extensions?: Object) {
        super();

        this.delayedUpdate = delayedUpdate;
        this._resolutionLimits = <any>resolutionLimits;
        this._opacity = opacity;
        this._isDisplayed = isDisplayed;

        if (extensions) Object.assign(this, extensions);
    }

    /**
     * Returns the array of renders to be drawn for given parameters.
     * @param bbox - bounding box of the area to get features from
     * @param resolution - current resolution
     */
    abstract getRenders(bbox: Bbox, resolution: number): Render[]

    /**
     * Whether the layer is drawn to map
     * @fires [[VisibilityChangeEvent]]
     */
    get isDisplayed(): boolean { return this._isDisplayed; }
    set isDisplayed(bool: boolean) {
        this._isDisplayed = bool;
        this.fire(new VisibilityChangeEvent());
    }

    /**
     * Return true if the layer is displayed and the resolution is inside the limits
     * @param resolution
     */
    checkVisibility(resolution: number): boolean {
        return this._isDisplayed && (this.resolutionLimits[0] < 0 || resolution >= this.resolutionLimits[0]) && (this.resolutionLimits[1] < 0 || resolution <= this.resolutionLimits[1]);
    }

    /**
     * Makes the layer visible
     * @fires [[PropertyChangeEvent]]
     */
    show(): void {
        this.isDisplayed = true;
    }

    /**
     * Makes the layer invisible
     * @fires [[PropertyChangeEvent]]
     */
    hide(): void {
        this.isDisplayed = false;
    }

    /**
     * Opacity of the layer. It sets the opacity of all features in this layer. Valid values: [0..1].
     * @fires [[PropertyChangeEvent]]
     */
    get opacity(): number { return this.getOpacity(); }
    set opacity(opacity: number) { this.setOpacity(opacity); }

    protected getOpacity() { return this._opacity; }
    protected setOpacity(opacity) {
        opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
        this._opacity = opacity;
        this.fire(new PropertyChangeEvent('opacity'));
    }

    /**
     * Min and max resolution between which the layer will be displayed. Negative values are treated as no limit.
     * @fires [[PropertyChangeEvent]]
     */
    get resolutionLimits(): ResolutionLimits { return this._resolutionLimits; }
    set resolutionLimits(limits: ResolutionLimits) {
        this._resolutionLimits = limits;
        this.fire(new PropertyChangeEvent('resolutionLimits'));
    }

    /**
     * Forces redrawing of the layer
     * @fires [[PropertyChangeEvent]]
     */
    redraw(): void {
        this.fire(new PropertyChangeEvent('content'));
    }
}
