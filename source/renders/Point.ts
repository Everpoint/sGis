import {Coordinates} from "../baseTypes";
import {IRender} from "../interfaces/IRender";

/**
 * Point geometry rendered to the screen coordinates for drawing.
 * @alias sGis.render.Point
 * @implements sGis.IRender
 */
export class Point implements IRender {
    private _coord: Coordinates;

    /** The color of the point. Can be any valid css color string. */
    color: string = 'black';

    /** pecifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /**
     * @param {Number[]} coordinates - the rendered (px) coordinates of the point in [x, y] format.
     * @param {Object} [properties] - key-value list of any sGis.render.Point properties.
     */
    constructor(coordinates: Coordinates, properties?: Object) {
        this._coord = coordinates;
        if (properties) Object.assign(this, properties);
    }

    get isVector(): boolean { return true; }

    contains(position: Coordinates, tolerance: number = 2) {
        let dx = position[0] - this._coord[0];
        let dy = position[1] - this._coord[1];
        let distance2 = dx * dx + dy * dy;

        return distance2 < tolerance*tolerance;
    }

    /**
     *  The rendered (px) coordinates of the point in [x, y] format
     *  @type Number[]
     *  @readonly
     */
    get coordinates(): Coordinates { return this._coord; }
}
