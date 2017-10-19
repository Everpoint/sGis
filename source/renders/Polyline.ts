import {IRender} from "../interfaces/IRender";
import {pointToLineDistance} from "../geotools";
import {Coordinates} from "../baseTypes";

/**
 * Rendered polyline.
 * @alias sGis.render.Polyline
 * @implements sGis.IRender
 */

export class PolylineRender implements IRender {
    coordinates: Coordinates[][];

    /** Stroke color of the polygon. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Stroke width of the polyline. */
    strokeWidth: number = 1;

    /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /** The distance (px) from the drawn line inside which the event is still considered to be inside the line. */
    lineContainsTolerance: number = 4;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash: number[] = [];

    /**
     * @constructor
     * @param {Number[][][]} coordinates - the coordinates of the polyline: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
     * @param {Object} [properties] - key-value list of any properties of sGis.render.Polyline
     */
    constructor(coordinates: Coordinates[][], properties?: Object) {
        if (properties) Object.assign(this, properties);
        this.coordinates = coordinates;
    }

    get isVector(): boolean { return true; }

    /**
     * Returns true if 'position' is inside the rendered polygon.
     * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
     * @returns {boolean}
     */
    contains(position: Coordinates): boolean | [number, number]{
        for (let ring = 0, l = this.coordinates.length; ring < l; ring++) {
            for (let i = 1, m = this.coordinates[ring].length; i < m; i++) {
                if (pointToLineDistance(position, [this.coordinates[ring][i-1], this.coordinates[ring][i]]) < this.strokeWidth / 2 + this.lineContainsTolerance) return [ring, i - 1];
            }
        }
        return false;
    }
}
