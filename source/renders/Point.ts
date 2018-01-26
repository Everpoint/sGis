import {Coordinates} from "../baseTypes";
import {VectorRender} from "./Render";

export interface PointRenderConstructorParams {
    /** @see Point.color */
    color?: string,
    /** @see Point.ignoreEvents */
    ignoreEvents?: boolean
}

/**
 * Point geometry rendered to the screen coordinates for drawing.
 * @alias sGis.render.Point
 */
export class Point extends VectorRender {
    private _coord: Coordinates;

    /** The color of the point. Can be any valid css color string. */
    color: string = 'black';

    /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /**
     * @param coordinates - the rendered (px) coordinates of the point in [x, y] format.
     * @param __namedParameters - properties to be set to the corresponding fields.
     */
    constructor(coordinates: Coordinates, {color = 'black', ignoreEvents = false}: PointRenderConstructorParams = {}) {
        super();

        this._coord = coordinates;
        this.color = color;
        this.ignoreEvents = ignoreEvents;
    }

    get isVector(): boolean { return true; }

    contains(position: Coordinates, tolerance: number = 2): boolean {
        let dx = position[0] - this._coord[0];
        let dy = position[1] - this._coord[1];
        let distance2 = dx * dx + dy * dy;

        return distance2 < tolerance*tolerance;
    }

    /**
     *  The rendered (px) coordinates of the point in [x, y] format.
     */
    get coordinates(): Coordinates { return this._coord; }
}
