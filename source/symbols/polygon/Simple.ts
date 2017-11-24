import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {PolylineSymbol} from "../PolylineSymbol";

/**
 * Symbol of polygon with one color filling.
 * @alias sGis.symbol.polygon.Simple
 * @extends sGis.Symbol
 */
export class PolygonSymbol extends Symbol {

    /** Fill color of the polygon. Can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the outline. */
    strokeWidth: number = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification */
    lineDash: number[] = [];

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);

    }

    renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
        let coordinates = PolylineSymbol.getRenderedCoordinates(feature, resolution, crs);
        if (!coordinates) return [];
        return [new PolyRender(coordinates, {
            enclosed: true,
            fillStyle: FillStyle.Color,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fillColor: this.fillColor,
            lineDash: this.lineDash
        })];
    }
}

registerSymbol(PolygonSymbol, 'polygon.Simple', ['fillColor', 'strokeColor', 'strokeWidth']);
