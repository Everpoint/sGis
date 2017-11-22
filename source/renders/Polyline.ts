import {IRender} from "../interfaces/IRender";
import {pointToLineDistance} from "../geotools";
import {Contour, Coordinates} from "../baseTypes";

export interface PolylineRenderConstructorParams {
    /** @see PolylineRender.strokeColor */
    strokeColor?: string,
    /** @see PolylineRender.strokeWidth */
    strokeWidth?: number,
    /** @see PolylineRender.ignoreEvents */
    ignoreEvents?: boolean,
    /** @see PolylineRender.lineContainsTolerance */
    lineContainsTolerance?: number,
    /** @see PolylineRender.lineDash */
    lineDash?: number[]
}

/**
 * Rendered polyline.
 * @alias sGis.render.Polyline
 */
export class PolylineRender implements IRender {
    coordinates: Contour[];

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
     * @param coordinates - rendered (px) coordinates of the polyline.
     * @param options - properties to be assigned to the instance
     */
    constructor(coordinates: Coordinates[][], options: PolylineRenderConstructorParams = {}) {
        Object.assign(this, options);
        this.coordinates = coordinates;
    }

    get isVector(): boolean { return true; }

    contains(position: Coordinates): boolean | [number, number]{
        for (let ring = 0, l = this.coordinates.length; ring < l; ring++) {
            for (let i = 1, m = this.coordinates[ring].length; i < m; i++) {
                if (pointToLineDistance(position, [this.coordinates[ring][i-1], this.coordinates[ring][i]]) < this.strokeWidth / 2 + this.lineContainsTolerance) return [ring, i - 1];
            }
        }
        return false;
    }
}
