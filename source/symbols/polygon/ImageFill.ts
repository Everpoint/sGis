import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Symbol} from "../Symbol";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {Polygon} from "../../features/Polygon";
import {Poly} from "../../features/Poly";

export interface ImageFillConstructorParams {
    /** @see [[ImageFill.strokeColor]] */
    strokeColor?: string,
    /** @see [[ImageFill.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[ImageFill.lineDash]] */
    lineDash?: number[],
    /** @see [[ImageFill.src]] */
    src?: string
}

/**
 * Symbol of polygon with image filling.
 * @alias sGis.symbol.polygon.ImageFill
 */
export class ImageFill extends Symbol<Polygon> {
    private _image: HTMLImageElement = new Image();
    private _src: string;

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string;

    /** Stroke width of the outline. */
    strokeWidth: number;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash: number[];

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor({
        src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        strokeWidth = 1,
        strokeColor = 'block',
        lineDash = []
    }: ImageFillConstructorParams = {}) {
        super();

        this.strokeWidth = strokeWidth;
        this.strokeColor = strokeColor;
        this.lineDash = lineDash;
        this._src = src;

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
            lineDash: this.lineDash
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

registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);
