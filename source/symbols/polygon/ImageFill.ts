import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolyRender, PolyRenderConstructorParams} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Symbol} from "../Symbol";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {Polygon} from "../../features/Polygon";
import {Poly} from "../../features/Poly";
import {Shadow} from "../../baseTypes";

export interface ImageFillConstructorParams extends Pick<PolyRenderConstructorParams, "lineDash" | "lineCap" | "lineJoin" | "miterLimit" | "angle"> {
    /** @see [[ImageFill.strokeColor]] */
    strokeColor?: string,
    /** @see [[ImageFill.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[ImageFill.src]] */
    src?: string,
    /** @see [[ImageFill.shadow]] */
    shadow?: Shadow
}

/**
 * Symbol of polygon with image filling.
 * @alias sGis.symbol.polygon.ImageFill
 */
export class ImageFill extends Symbol<Polygon> implements ImageFillConstructorParams {
    private _image: HTMLImageElement = new Image();
    private _src: string;

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string;

    /** Stroke width of the outline. */
    strokeWidth: number;

    /** @see [[PolyRender.lineDash]] */
    lineDash: number[] = [];

    /** @see [[PolyRender.lineCap]] */
    lineCap: "butt" | "round" | "square" = "round";

    /** @see [[PolyRender.lineJoin]] */
    lineJoin: "bevel" | "miter" | "round" = "round";

    /** @see [[PolyRender.miterLimit]] */
    miterLimit: number = 10;

    /** Emulation CanvasRenderingContext2D.filter drop-shadow. */
    shadow: Shadow = null;

    /** @see [[PolyRender.angle]] */
    angle: number = 0;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor({
        src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        strokeWidth = 1,
        strokeColor = 'block',
        lineDash = [],
        shadow = null
    }: ImageFillConstructorParams = {}) {
        super();

        this.strokeWidth = strokeWidth;
        this.strokeColor = strokeColor;
        this.lineDash = lineDash;
        this._src = src;
        this.shadow = shadow;

        this._updateImage();
    }

    renderFunction(feature: Polygon, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof Poly)) return [];
        if (!this._image.complete) {
            this._image.onload = feature.redraw.bind(feature);
            return [];
        }
        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        return [new PolyRender(coordinates, {
            enclosed: true,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fillStyle: FillStyle.Image,
            fillImage: this._image,
            lineDash: this.lineDash,
            shadow: this.shadow,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            miterLimit: this.miterLimit,
            angle: this.angle,
        })];
    }

    /**
     * Source for the filling image. Can be url or data:url string.
     */
    get src(): string { return this._src; }
    set src(src: string) {
        this._src = src;
        this._updateImage();
    }

    private _updateImage(): void {
        this._image = new Image();
        this._image.src = this._src;
    }
}

registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth', 'lineDash', 'shadow', 'lineCap', 'lineJoin', 'miterLimit', 'angle']);
