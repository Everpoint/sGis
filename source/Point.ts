import {Coordinates} from './baseTypes';
import {Crs, geo} from './Crs';
import {error} from './utils/utils';
import {softEquals} from "./utils/math";

export interface IPoint {
    position: Coordinates;
    x: number;
    y: number;
    readonly crs: Crs;

    /**
     * Returns a new point with same position in new crs
     * @param newCrs - target coordinate system
     * @throws Cannot project to specified crs.
     */
    projectTo(newCrs: Crs): IPoint;
}

/**
 * Simple geographical point
 * @alias sGis.Point
 */
export class Point implements IPoint {
    private _crs: Crs;

    public position: Coordinates;

    constructor(position: Coordinates, crs: Crs = geo) {
        if (crs !== undefined) this._crs = crs;
        this.position = position;
    }

    projectTo(newCrs: Crs): Point {
        let projection = this.crs.projectionTo(newCrs);
        if (projection === null) error("Cannot project point to crs: " + newCrs.toString());

        return new Point(projection(this.position), newCrs);
    }

    /**
     * Returns a copy of the point
     * @returns {sGis.Point}
     */
    clone() {
        return new Point(this.position, this.crs);
    }

    get point() { return this.clone(); }
    set point(point) { this.position = point.projectTo(this.crs).position; }

    get x() { return this.position[0]; }
    set x(x) { this.position[0] = x; }

    get y() { return this.position[1]; }
    set y(y) { this.position[1] = y; }

    /**
     * Coordinate system of the point
     * @type sGis.Crs
     */
    get crs() { return this._crs; }

    /**
     * Returns true if the target point has the same position and crs as the current one
     * @param {sGis.Point} point - target point for comparison
     * @returns {boolean}
     */
    equals(point) {
        return softEquals(point.x, this.x) && softEquals(point.y, this.y) && point.crs.equals(this.crs);
    }

    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }
    set coordinates(position: Coordinates) { this.position = [position[0], position[1]]; }
}
