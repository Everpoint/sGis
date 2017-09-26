import {registerSymbol} from "../serializers/symbolSerializer";
import {ImageRender} from "../renders/Image";
import {Symbol} from "./Symbol";
import {Feature} from "../features/Feature";
import {Crs} from "../Crs";
import {IRender} from "../interfaces/IRender";

/**
 * Symbol for image with size bound by feature bbox.
 * @alias sGis.symbol.image.Image
 * @extends sGis.Symbol
 */
export class ImageSymbol extends Symbol {
    /** Transition (fade in) time of the image node in ms. */
    transitionTime = 0;

    /** Opacity of the image. */
    opacity = 1;

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super(properties);
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        let bbox = feature.bbox.projectTo(crs);
        let render = new ImageRender((<any>feature).src, bbox);

        if (this.transitionTime > 0) {
            render.opacity = 0;
            render.onAfterDisplayed = (node) => {
                setTimeout(() => {
                    node.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
                    node.style.opacity = this.opacity;
                }, 0);
            }
        } else {
            render.opacity = this.opacity;
        }

        return [render];
    }
}

registerSymbol(ImageSymbol, 'image.Image', ['transitionTime', 'opacity']);
