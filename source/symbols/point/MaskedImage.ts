import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {HtmlElement} from "../../renders/HtmlElement";
import {Color} from "../../utils/Color";
import {Offset} from "../../baseTypes";
import {warn} from "../../utils/utils";
import {PIN_BACKGROUND, PIN_FOREGROUND} from "../../resourses/images";
import {Feature} from "../../features/Feature";
import {Crs} from "../../Crs";
import {IRender} from "../../interfaces/IRender";
import {PointFeature} from "../../features/Point";

export interface MaskedImageSymbolConstructorParams {
    /** @see [[MaskedImage.width]] */
    width?: number,
    /** @see [[MaskedImage.height]] */
    height?: number,
    /** @see [[MaskedImage.angle]] */
    angle?: number,
    /** @see [[MaskedImage.anchorPoint]] */
    anchorPoint?: Offset,
    /** @see [[MaskedImage.imageSource]] */
    imageSource?: string,
    /** @see [[MaskedImage.maskSource]] */
    maskSource?: string,
    /** @see [[MaskedImage.maskColor]] */
    maskColor?: string
}

/**
 * Symbol of point drawn as masked image.
 * @alias sGis.symbol.point.MaskedImage
 */
export class MaskedImage extends Symbol {
    /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
    width: number = 32;

    /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
    height: number = 32;

    private _anchorPoint: Offset = [16, 32];

    /**
     * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.
     */
    get anchorPoint(): Offset {
        return this._anchorPoint;
    }
    set anchorPoint(anchorPoint: Offset) {
        // TODO: remove deprecated part after 2018
        let deprecated = <any>anchorPoint;
        if (deprecated.x !== undefined && deprecated.y !== undefined) {
            warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
            this._anchorPoint = [deprecated.x, deprecated.y];
        } else {
            this._anchorPoint = anchorPoint;
        }
    }

    /**
     * Clockwise rotation of the image in radians.
     */
    angle: number = 0;

    _imageSource = PIN_BACKGROUND;
    _maskSource = PIN_FOREGROUND;
    _maskColor = '#9bdb00';

    private _maskedSrc: string;
    private _image: HTMLImageElement;
    private _mask: HTMLImageElement;


    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: MaskedImageSymbolConstructorParams = {}) {
        super();

        Object.assign(this, options);
        if (!this._image) this.imageSource = this._imageSource;
        if (!this._mask) this.maskSource = this._maskSource;

        this._updateMasked();
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        if (!(feature instanceof PointFeature)) return [];

        if (!this._isLoaded()) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution, - position[1] / resolution];
        let renderPosition = [pxPosition[0], pxPosition[1]];

        let widthProp = this.width > 0 ? `width="${this.width}"` : '';
        let heightProp = this.height > 0 ? `height="${this.height}"` : '';
        let translateProp = this.angle !== 0 ? `style="transform-origin: 50% 50%; transform: rotate(${this.angle}rad)"` : '';

        let html = `<img src="${this._maskedSrc}" ${widthProp} ${heightProp} ${translateProp}>`;
        return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint[0], -this.anchorPoint[1]])];
    }

    /**
     * Source of the base image. Can be url or data:url string.
     */
    get imageSource(): string { return this._imageSource; }
    set imageSource(source: string) {
        this._imageSource = source;

        this._image = new Image();
        this._image.onload = this._updateMasked.bind(this);
        this._image.src = source;
    }

    /**
     * Source of the mask image. Can be url or data:url string.
     */
    get maskSource(): string { return this._maskSource; }
    set maskSource(source: string) {
        this._maskSource = source;

        this._mask  = new Image();
        this._mask.onload = this._updateMasked.bind(this);
        this._mask.src = source;
    }

    /**
     * Color of the mask. Can be any valid css color string.
     */
    get maskColor(): string { return this._maskColor; }
    set maskColor(color: string) {
        this._maskColor = color;
        this._updateMasked();
    }

    _isLoaded(): boolean { return this._image.complete && this._mask.complete; }

    _updateMasked(): void {
        if (!this._mask || !this._image || !this._isLoaded()) return;

        let canvas = document.createElement('canvas');
        canvas.width = this._mask.width;
        canvas.height = this._mask.height;

        let ctx = canvas.getContext('2d');
        ctx.drawImage(this._mask, 0, 0);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._recolorMask(imageData);
        ctx.putImageData(imageData, 0, 0);

        let resultCanvas = document.createElement('canvas');
        resultCanvas.width = this._image.width;
        resultCanvas.height = this._image.height;

        let resultCtx = resultCanvas.getContext('2d');
        resultCtx.drawImage(this._image, 0, 0);
        resultCtx.drawImage(canvas, 0, 0);

        this._maskedSrc = resultCanvas.toDataURL();
    }

    _recolorMask(imageData: ImageData): void {
        let maskColor = new Color(this.maskColor);
        let alphaNormalizer = 65025;

        let d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let a = d[i+3];
            let srcA = a * maskColor.a / alphaNormalizer;
            d[i+3] = + Math.round(Math.min(1, srcA) * 255);
            d[i] = maskColor.r * r / 255;
            d[i+1] = maskColor.g * r / 255;
            d[i+2] = maskColor.b * r / 255;
        }
    }
}

registerSymbol(MaskedImage, 'point.MaskedImage', ['width', 'height', 'anchorPoint', 'imageSource', 'maskSource', 'maskColor', 'angle']);
