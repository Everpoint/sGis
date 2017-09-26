import {PointSymbol} from "./point/Point";
import {PolylineRender} from "../renders/Polyline";
import {PolygonRender} from "../renders/Polygon";
import {Arc} from "../renders/Arc";
import {PointImageSymbol} from "./point/PointImageSymbol";
import {MaskedImage} from "./point/MaskedImage";
import {Symbol} from "./Symbol";

/**
 * Symbol of a highlighted feature for editor.
 * @alias sGis.symbol.Editor
 * @extends sGis.Symbol
 */
export class EditorSymbol extends Symbol {
    /** Base symbol of the feature. Used to render original feature with the highlight. */
    baseSymbol = new PointSymbol();

    /** Color of the halo (highlight). Can be any valid css color string. */
    color = 'rgba(97,239,255,0.5)';

    /** Size of the halo around the feature. */
    haloSize = 5;

    /**
     * @constructor
     * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
     */
    constructor(properties) {
        super(properties);
    }

    renderFunction(feature, resolution, crs) {
        var baseRender = <any>this.baseSymbol.renderFunction(feature, resolution, crs);
        var halo;
        for (var i = 0; i < baseRender.length; i++) {
            if (baseRender[i] instanceof Arc) {
                halo = new Arc(baseRender[i].center, {
                    fillColor: this.color,
                    radius: parseFloat(baseRender[i].radius) + this.haloSize,
                    strokeColor: 'transparent'
                });
                break;
            } else if (baseRender[i] instanceof PolygonRender) {
                halo = new PolygonRender(baseRender[i].coordinates, {
                    strokeColor: this.color,
                    fillColor: this.color,
                    strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                });
                break;
            } else if (baseRender[i] instanceof PolylineRender) {
                halo = new PolylineRender(baseRender[i].coordinates, {
                    strokeColor: this.color,
                    strokeWidth: parseFloat(baseRender[i].strokeWidth) + 2 * this.haloSize
                });
                break;
            } else if (this.baseSymbol instanceof PointImageSymbol || this.baseSymbol instanceof MaskedImage) {
                halo = new Arc(
                    [
                        baseRender[i].position[0] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
                        baseRender[i].position[1] - (+this.baseSymbol.anchorPoint.x) + this.baseSymbol.width / 2,
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

