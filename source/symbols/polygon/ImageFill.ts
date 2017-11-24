import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";
import {Symbol} from "../Symbol";
import {Feature} from "../../features/Feature";
import {Crs} from "../../Crs";
import {IRender} from "../../interfaces/IRender";
import {Polygon} from "../../features/Polygon";

export interface ImageFillConstructorParams {
    /** @see [[ImageFill.strokeColor]] */
    strokeColor?: string,
    /** @see [[ImageFill.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[ImageFill.lineDash]] */
    lineDash?: number[],
    /** @see [[ImageFill.src]] */
    src?: 'string'
}

/**
 * Symbol of polygon with image filling.
 * @alias sGis.symbol.polygon.ImageFill
 */
export class ImageFill extends Symbol {
    private _image: HTMLImageElement;

    //noinspection SpellCheckingInspection
    private _src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor = 'black';

    /** Stroke width of the outline. */
    strokeWidth = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash = [];

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: ImageFillConstructorParams = {}) {
        super();
        Object.assign(this, options);
        if (!this._image) this.src = this._src;
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        if (!(feature instanceof Polygon)) return [];

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
        this._image = new Image();
        this._image.src = src;
    }
}

registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);
