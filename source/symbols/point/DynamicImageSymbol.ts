import {DynamicPointSymbol} from "../Symbol";
import {registerSymbol} from "../../serializers/symbolSerializer";
import {PIN_IMAGE} from "../../resourses/images";
import {Offset} from "../../baseTypes";
import {Feature} from "../../features/Feature";

export interface DynamicImageSymbolParams {
    /** @see [[DynamicImageSymbol.width]] */
    width?: number,
    /** @see [[DynamicImageSymbol.height]] */
    height?: number,
    /** @see [[DynamicImageSymbol.source]] */
    source?: string,
    /** @see [[DynamicImageSymbol.angle]] */
    angle?: number,
    /** @see [[DynamicImageSymbol.anchorPoint]] */
    anchorPoint?: Offset
}

/**
 * Symbol of point drawn as circle with outline.
 * @alias sGis.symbol.point.Image
 */
export class DynamicImageSymbol extends DynamicPointSymbol {
    /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
    width: number = 32;

    /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
    height: number = 32;

    /**
     * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.
     */
    anchorPoint: Offset = [16, 32];

    /** Source of the image. Can be url or data:url string. */
    source: string = PIN_IMAGE;

    /**
     * Clockwise rotation of the image in radians.
     */
    angle: number = 0;

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor({width = 32, height = 32, anchorPoint = [16, 32], source = PIN_IMAGE, angle = 0}: DynamicImageSymbolParams = {}) {
        super({offset: [0, 0]});
        this.width = width;
        this.height = height;
        this.anchorPoint = anchorPoint;
        this.angle = angle;
        this.source = source;
    }

    protected _getFeatureNode(feature: Feature): HTMLElement {
        let node = new Image();
        node.src = this.source;

        node.style.transformOrigin = `${this.anchorPoint[0]}px ${this.anchorPoint[1]}px`;
        node.style.transform = `translate(-${this.anchorPoint[0]}px,-${this.anchorPoint[1]}px) rotate(${this.angle}rad)`;

        if (this.width > 0) node.width = this.width;
        if (this.height > 0) node.height = this.height;

        if (this.angle !== 0) {
        }

        return node;
    }
}

registerSymbol(DynamicImageSymbol, 'point.Image', ['width', 'height', 'anchorPoint', 'source', 'angle']);
