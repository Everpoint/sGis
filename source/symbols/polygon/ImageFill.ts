import {registerSymbol} from "../../serializers/symbolSerializer";
import {FillStyle, PolygonRender} from "../../renders/Polygon";
import {PolylineSymbol} from "../Polyline";
import {Symbol} from "../Symbol";

/**
 * Symbol of polygon with brush filling.
 * @alias sGis.symbol.polygon.ImageFill
 * @extends sGis.Symbol
 */
export class ImageFill extends Symbol {
    private _image: HTMLImageElement;

    //noinspection SpellCheckingInspection
    _src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    /** Stroke color of the outline. Can be any valid css color string. */
    strokeColor = 'black';

    /** Stroke width of the outline. */
    strokeWidth = 1;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash = [];

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);

        if (!this._image) this.src = this._src;
    }

    renderFunction(/** sGis.feature.Polygon */ feature, resolution, crs) {
        if (!this._image.complete) {
            this._image.onload = feature.redraw.bind(feature);
            return [];
        }
        var coordinates = PolylineSymbol._getRenderedCoordinates(feature, resolution, crs);
        if (!coordinates) return [];
        return [new PolygonRender(coordinates, { strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, fillStyle: FillStyle.Image, fillImage: this._image, lineDash: this.lineDash })];
    }

    /**
     * Source for the filling image. Can be url or data:url string.
     * @type String
     * @default /an empty image/
     */
    get src() { return this._src; }
    set src(/** String */ src) {
        this._src = src;
        this._image = new Image();
        this._image.src = src;
    }
}

registerSymbol(ImageFill, 'polygon.ImageFill', ['src', 'strokeColor', 'strokeWidth']);
