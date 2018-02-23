import {PointSymbol} from "./point/Point";
import {FillStyle, PolyRender} from "../renders/Poly";
import {Arc} from "../renders/Arc";
import {StaticImageSymbol} from "./point/StaticImageSymbol";
import {MaskedImage} from "./point/MaskedImage";
import {Symbol} from "./Symbol";
import {Feature} from "../features/Feature";
import {Render} from "../renders/Render";
import {Crs} from "../Crs";

export interface EditorSymbolConstructorParams {
    /** @see [[EditorSymbol.baseSymbol]] */
    baseSymbol?: Symbol<Feature>,
    /** @see [[EditorSymbol.color]] */
    color?: string,
    /** @see [[EditorSymbol.haloSize]] */
    haloSize?: number
}

/**
 * Symbol of a highlighted feature for editor.
 * @alias sGis.symbol.Editor
 */
export class EditorSymbol extends Symbol<Feature> {
    /** Base symbol of the feature. Used to render original feature with the highlight. */
    baseSymbol: Symbol<Feature> = new PointSymbol();

    /** Color of the halo (highlight). Can be any valid css color string. */
    color: string = 'rgba(97,239,255,0.5)';

    /** Size of the halo around the feature. */
    haloSize: number = 5;

    /**
     * @param {Object} [options] - key-value list of properties to be assigned to the instance.
     */
    constructor(options: EditorSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);

    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): Render[] {
        let baseRender = <any>this.baseSymbol.renderFunction(feature, resolution, crs);
        let halo;
        for (let i = 0; i < baseRender.length; i++) {
            if (baseRender[i] instanceof Arc) {
                halo = new Arc(baseRender[i].center, {
                    fillColor: this.color,
                    radius: parseFloat(baseRender[i].radius) + this.haloSize,
                    strokeColor: 'transparent'
                });
                break;
            } else if (baseRender[i] instanceof PolyRender) {
                halo = new PolyRender(baseRender[i].coordinates, {
                    enclosed: baseRender[i].enclosed,
                    fillStyle: baseRender[i].fillStyle === FillStyle.None ? FillStyle.None : FillStyle.Color,
                    strokeColor: this.color,
                    fillColor: this.color,
                    strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                });
                break;
            } else if (this.baseSymbol instanceof StaticImageSymbol || this.baseSymbol instanceof MaskedImage) {
                halo = new Arc(
                    [
                        baseRender[i].position[0] - (+this.baseSymbol.anchorPoint[0]) + this.baseSymbol.width / 2,
                        baseRender[i].position[1] - (+this.baseSymbol.anchorPoint[0]) + this.baseSymbol.width / 2,
                    ],
                    {
                        fillColor: this.color,
                        radius: this.baseSymbol.width / 2 + this.haloSize,
                        strokeColor: 'transparent'}
                );
                break;
            }
        }

        if (halo) baseRender.unshift(halo);
        return baseRender;
    }
}

