import {ImageSymbol} from "./symbols/Image";
import {Layer, LayerConstructorParams, PropertyChangeEvent} from "./Layer";
import {ImageFeature} from "./features/ImageFeature";
import {Crs} from "./Crs";
import {Bbox} from "./Bbox";
import {Feature} from "./features/Feature";

export type GetUrlDelegate = (bbox: Bbox, resolution: number) => string;

/**
 * Represents a layer that is fully drawn by server and is displayed as an image overlay.
 * @alias sGis.DynamicLayer
 */
export abstract class DynamicLayer extends Layer {
    private _crs: Crs;
    private _currHeight: number;
    private _currWidth: number;
    private _forceUpdate: boolean = false;
    private _image: ImageFeature;

    delayedUpdate = true;

    /**
     * @param properties - properties to be set to the corresponding fields
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance
     */
    constructor(properties: LayerConstructorParams = {}, extensions?: Object) {
        super(properties, extensions);
    }

    abstract getUrl(bbox: Bbox, resolution: number);

    getFeatures(bbox: Bbox, resolution: number): Feature[] {
        if (!this.checkVisibility(resolution)) return [];

        if (this.crs) {
            if (bbox.crs.canProjectTo(this.crs)) {
                bbox = bbox.projectTo(this.crs);
            } else {
                return [];
            }
        }

        if (this._image && this._image.crs !== bbox.crs) this._image = null;

        if (!this._image) this._createFeature(bbox);

        let width  = bbox.width / resolution;
        let height = bbox.height / resolution;

        let needRedraw = this._forceUpdate || !this._image.bbox.equals(bbox) || this._currWidth !== width || this._currHeight !== height;
        if (needRedraw) {
            let url = this.getUrl(bbox, resolution);
            if (!url) return [];
            if (this._forceUpdate) {
                url += '&ts=' + Date.now();
                this._forceUpdate = false;
            }

            this._image.src = url;
            this._image.bbox = bbox;
            this._currWidth = bbox.width / resolution;
            this._currHeight = bbox.height / resolution;
        }

        return [this._image];
    }

    /**
     * Ensures update of the layer image
     */
    forceUpdate() {
        this._forceUpdate = true;
        this.fire(new PropertyChangeEvent('source'));
    }

    _createFeature(bbox) {
        this._image = new ImageFeature(bbox, { src: '', crs: this.crs || bbox.crs});
        this._updateSymbol();
    }

    get opacity() { return this.getOpacity(); }
    set opacity(opacity) {
        this.setOpacity(opacity);
        this._updateSymbol();
    }

    /**
     * Coordinate system of the layer
     * @type {sGis.Crs}
     * @default null
     */
    get crs() { return this._crs; }
    set crs(/** sGis.Crs */ crs) { this._crs = crs; }

    _updateSymbol() {
        if (this._image) this._image.symbol = new ImageSymbol({ opacity: this.opacity });
    }
}
