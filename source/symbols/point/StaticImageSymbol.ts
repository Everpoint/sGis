import {Symbol} from "../Symbol";
import {registerSymbol} from "../../serializers/symbolSerializer";
import {PIN_IMAGE} from "../../resourses/images";
import {Coordinates, Offset} from "../../baseTypes";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {PointFeature} from "../../features/PointFeature";
import {warn} from "../../utils/utils";
import {StaticVectorImageRender} from "../../renders/StaticVectorImageRender";

export interface PointImageSymbolConstructorParams {
    /** @see [[StaticImageSymbol.width]] */
    width?: number,
    /** @see [[StaticImageSymbol.height]] */
    height?: number,
    /** @see [[StaticImageSymbol.source]] */
    source?: string,
    /** @see [[StaticImageSymbol.angle]] */
    angle?: number,
    /** @see [[StaticImageSymbol.anchorPoint]] */
    anchorPoint?: Offset
}

/**
 * Symbol of point drawn as circle with outline.
 * @alias sGis.symbol.point.Image
 */
export class StaticImageSymbol extends Symbol<PointFeature> {
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

    renderFunction(feature: PointFeature, resolution: number, crs: Crs): Render[] {
        let position = feature.projectTo(crs).position;
        let pxPosition: Coordinates = [position[0] / resolution, - position[1] / resolution];

        return [new StaticVectorImageRender({
            src: this.source,
            position: pxPosition,
            angle: this.angle,
            width: this.width,
            height: this.height,
            offset: [-this.anchorPoint[0], -this.anchorPoint[1]]
        })];
    }
}

registerSymbol(StaticImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source', 'angle']);
