import {ImageSymbol} from "../symbols/Image";
import {Feature, IFeatureConstructorArgs} from "./Feature";
import {Bbox} from "../Bbox";

export interface IImageFeatureConstructorArgs extends IFeatureConstructorArgs {
    symbol?: ImageSymbol,
    src: string
}

/**
 * @alias sGis.feature.Image
 * @extends sGis.Feature
 */
export class ImageFeature extends Feature {
    private _bbox: Bbox;

    _src: string;
    _symbol: ImageSymbol;

    /**
     * @constructor
     * @param {sGis.Bbox} bbox - bbox that the image will fit
     * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
     */
    constructor(bbox, { src, crs, symbol = new ImageSymbol() }: IImageFeatureConstructorArgs, extension?: Object) {
        super({ symbol, crs }, extension);

        this._src = src;
        this.bbox = bbox;
    }

    /**
     * @override
     * @private
     */
    _needToRender(resolution, crs) {
        return !this.getRenderCache();
    }

    /**
     * Source of the image. Can be html address or data:url string.
     * @type String
     * @default null
     */
    get src() { return this._src; }
    set src(/** String */ src) {
        this._src = src;
        this.redraw();
    }

    /**
     * Bbox that the image will fit
     * @type sGis.Bbox
     */
    get bbox() { return this._bbox; }
    set bbox(/** sGis.Bbox */ bbox) {
        this._bbox = bbox.projectTo(this.crs);
        this.redraw();
    }
}
