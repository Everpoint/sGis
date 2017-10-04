import {ImageSymbol} from "./symbols/Image";
import {Layer} from "./Layer";
import {ImageFeature} from "./features/ImageFeature";
import {Crs} from "./Crs";

/**
 * Represents a layer that is fully drawn by server and is displayed as an image overlay.
 * @alias sGis.DynamicLayer
 * @extends sGis.Layer
 */
export class DynamicLayer extends Layer {
    private _url: string;
    private _crs: Crs;
    private _currHeight: number;
    private _currWidth: number;
    private _forceUpdate: boolean = false;
    private _features: ImageFeature[];
    private _getUrl: Function;

    delayedUpdate = true;

    /**
     * @constructor
     * @param {function(sGis.Bbox, Number)} getUrlDelegate
     * @param {Object} [properties] - key-value set of properties to be assigned to the instance
     */
    constructor(getUrlDelegate, properties?: Object) {
        super(properties);
        this._getUrl = getUrlDelegate;
    }

    getFeatures(bbox, resolution) {
        if (!this.checkVisibility(resolution)) return [];

        if (this.crs) {
            if (bbox.crs.canProjectTo(this.crs)) {
                bbox = bbox.projectTo(this.crs);
            } else {
                return [];
            }
        }

        if (this._features && this._features[0].crs !== bbox.crs) this._features = null;

        if (!this._features) this._createFeature(bbox);
        var width  = bbox.width / resolution;
        var height = bbox.height / resolution;
        if (this._forceUpdate || !this._features[0].bbox.equals(bbox) || this._currWidth !== width || this._currHeight !== height) {
            var url = this._getUrl(bbox, resolution);
            if (url == null) return [];
            if (this._forceUpdate) {
                url += '&ts=' + Date.now();
                this._forceUpdate = false;
            }

            this._features[0].src = url;
            this._features[0].bbox = bbox;
            this._currWidth = bbox.width / resolution;
            this._currHeight = bbox.height / resolution;
        }

        return this._features;
    }

    /**
     * Ensures update of the layer image
     */
    forceUpdate() {
        this._forceUpdate = true;
        this.fire('propertyChange', {property: 'source'});
    }

    _createFeature(bbox) {
        var feature = new ImageFeature(bbox, { crs: this.crs || bbox.crs, opacity: this.opacity});
        this._features = [feature];
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

    /**
     * Base url of the service
     * @type {String}
     */
    get url() { return this._url; }

    _updateSymbol() {
        if (this._features) this._features[0].symbol = new ImageSymbol({ opacity: this.opacity });
    }
}
