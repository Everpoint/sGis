import {Symbol} from "../Symbol";
import {HtmlElement} from "../../renders/HtmlElement";
import {registerSymbol} from "../../serializers/symbolSerializer";
import {PIN_IMAGE} from "../../resourses/images";
import {Offset} from "../../baseTypes";
import {Feature} from "../../features/Feature";
import {Crs} from "../../Crs";
import {IRender} from "../../interfaces/IRender";
import {PointFeature} from "../../features/Point";
import {warn} from "../../utils/utils";

export interface PointImageSymbolConstructorParams {
    /** @see [[PointImageSymbol.width]] */
    width?: number,
    /** @see [[PointImageSymbol.height]] */
    height?: number,
    /** @see [[PointImageSymbol.source]] */
    source?: string,
    /** @see [[PointImageSymbol.angle]] */
    angle?: number,
    /** @see [[PointImageSymbol.anchorPoint]] */
    anchorPoint?: Offset
}

/**
 * Symbol of point drawn as circle with outline.
 * @alias sGis.symbol.point.Image
 */
export class PointImageSymbol extends Symbol {
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

    /** Source of the image. Can be url or data:url string. */
    source: string = PIN_IMAGE;

    /**
     * Clockwise rotation of the image in radians.
     */
    angle: number = 0;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: PointImageSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);

    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        if (!(feature instanceof PointFeature)) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition = [position[0] / resolution, - position[1] / resolution];
        let renderPosition = [pxPosition[0], pxPosition[1]];

        let widthProp = this.width > 0 ? `width="${this.width}"` : '';
        let heightProp = this.height > 0 ? `height="${this.height}"` : '';
        let translateProp = this.angle !== 0 ? `style="transform-origin: 50% 50%; transform: rotate(${this.angle}rad)"` : '';
        let html = `<img src="${this.source}" ${widthProp} ${heightProp} ${translateProp}>`;
        return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint[0], -this.anchorPoint[0]])];
    }
}

registerSymbol(PointImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source', 'angle']);
