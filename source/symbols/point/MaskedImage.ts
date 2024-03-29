import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {Color} from "../../utils/Color";
import {Coordinates, Offset} from "../../baseTypes";
import {warn, loadImage} from "../../utils/utils";
import {PIN_BACKGROUND, PIN_FOREGROUND} from "../../resourses/images";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {PointFeature} from "../../features/PointFeature";
import {StaticVectorImageRender} from "../../renders/StaticVectorImageRender";

const MAX_TRIES = 3;

export interface MaskedImageSymbolParams {
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
    maskColor?: string,

    onUpdate?: () => void
}

/**
 * Symbol of point drawn as masked image.
 * @alias sGis.symbol.point.MaskedImage
 */
export class MaskedImage extends Symbol<PointFeature> {
    /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
    width: number = 32;

    /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
    height: number = 32;

    onUpdate: () => void;

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
        if (deprecated && deprecated.x !== undefined && deprecated.y !== undefined) {
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

    private maskReadyPromise?: Promise<void>;
    private imageReadyPromise?: Promise<void>;


    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor({
        width,
        height,
        angle,
        anchorPoint,
        imageSource,
        maskSource,
        maskColor,
        onUpdate
    }: MaskedImageSymbolParams = {}) {
        super();

        this.width = width;
        this.height = height;
        this.angle = angle;
        this.anchorPoint = anchorPoint;
        this._maskColor = maskColor;
        this.onUpdate = onUpdate;

        this.setImageSource(imageSource);
        this.setMaskSource(maskSource);

        this._updateMasked();
    }

    prepareSymbol() {
        return Promise.all([
            this.imageReadyPromise,
            this.maskReadyPromise
        ]).then(() => {
            this._updateMasked();
        })
    }

    renderFunction(feature: PointFeature, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof PointFeature) || !this._maskedSrc) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition: Coordinates = [position[0] / resolution, - position[1] / resolution];

        return [new StaticVectorImageRender({
            src: this._maskedSrc,
            position: pxPosition,
            angle: this.angle,
            width: this.width,
            height: this.height,
            offset: [-this.anchorPoint[0], -this.anchorPoint[1]]
        })];
    }

    renderFunctionAsync(feature: PointFeature, resolution: number, crs: Crs): Promise<Render[]> {
        return this.prepareSymbol().then(() => this.renderFunction(feature, resolution, crs));
    }

    /**
     * Source of the base image. Can be url or data:url string.
     */
    get imageSource(): string { return this._imageSource; }
    set imageSource(source: string) {
        this._imageSource = source;

        this._image = new Image();
        this._image.src = source;

        if (this._image.complete) {
            this._updateMasked();
        } else {
            this._image.onload = this._updateMasked.bind(this);
        }
    }

    /**
     * Source of the mask image. Can be url or data:url string.
     */
    get maskSource(): string { return this._maskSource; }
    set maskSource(source: string) {
        this._maskSource = source;

        this._mask  = new Image();
        this._mask.src = source;

        if (this._mask.complete) {
            this._updateMasked();
        } else {
            this._mask.onload = this._updateMasked.bind(this);
        }
    }

    /**
     * Color of the mask. Can be any valid css color string.
     */
    get maskColor(): string { return this._maskColor; }
    set maskColor(color: string) {
        this._maskColor = color;
        this._updateMasked();
    }


    setImageSource(src: string) {
        this._imageSource = src;
        this._image = new Image();
        this.imageReadyPromise = loadImage(this._image, src, null);
        return this.imageReadyPromise;
    }

    setMaskSource(src: string) {
        this._maskSource = src;
        this._mask = new Image();
        this.maskReadyPromise = loadImage(this._mask, src, null);
        return this.maskReadyPromise;
    }

    _isLoaded(): boolean { return this._image.complete && this._mask.complete; }

    _updateMasked(triesNo: number = 0): void {
        if (!this._mask || !this._image || !this._isLoaded()) return;

        let canvas = document.createElement('canvas');
        canvas.width = this._mask.width;
        canvas.height = this._mask.height;

        let ctx = canvas.getContext('2d');
        if (canvas.width === 0 || canvas.height === 0) {
            // IE sometimes forgets to change the size of canvas and fails to draw the image. Need to check for that.
            if (triesNo > MAX_TRIES) return;
            setTimeout(() => this._updateMasked(triesNo+1), 0);
            return;
        }
        ctx.drawImage(this._mask, 0, 0);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._recolorMask(imageData);
        ctx.putImageData(imageData, 0, 0);

        let resultCanvas = document.createElement('canvas');
        resultCanvas.width = this._image.width;
        resultCanvas.height = this._image.height;

        let resultCtx = resultCanvas.getContext('2d');
        if (resultCanvas.width === 0 || resultCanvas.height === 0) {
            // IE sometimes forgets to change the size of canvas and fails to draw the image. Need to check for that.
            if (triesNo > MAX_TRIES) return;
            setTimeout(() => this._updateMasked(triesNo+1), 0);
            return;
        }
        resultCtx.drawImage(this._image, 0, 0);
        resultCtx.drawImage(canvas, 0, 0);

        this._maskedSrc = resultCanvas.toDataURL();

        if (this.onUpdate) this.onUpdate();
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
