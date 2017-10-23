import {IRender} from "../interfaces/IRender";
import {contains} from "../geotools";
import {Coordinates} from "../baseTypes";

/**
 * Rendered polygon
 * @alias sGis.render.Polygon
 * @implements sGis.IRender
 */
export class PolygonRender implements IRender {
    coordinates: Coordinates[][];

    /** Fill style of the polygon. Possible values: "color", "image". */
    fillStyle: string = 'color';

    /** Stroke color of the polygon. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Fill color of the polygon. Can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Stroke width of the polyline. */
    strokeWidth: number = 1;

    /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /** The distance (px) from the drawn line inside which the event is still considered to be inside the line. */
    lineContainsTolerance: number = 4;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash: number[] = [];

    /** Fill image of the polygon */
    fillImage: HTMLImageElement = null;

    /**
     * @constructor
     * @param {Number[][][]} coordinates - the coordinates of the polygon: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
     * @param {Object} [properties] - key-value list of any properties of sGis.render.Polygon
     */
    constructor(coordinates, properties) {
        if (properties) Object.assign(this, properties);
        this.coordinates = coordinates;
    }

    get isVector() { return true; }

    contains(position: Coordinates): boolean | [number, number] {
        return contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
    }
}
