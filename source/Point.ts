import { Coordinates } from './baseTypes';
import { Crs, geo } from './Crs';
import { error } from './utils/utils';
import { softEquals } from "./utils/math";

/**
 * IPoint interface
 */
export interface IPoint {
    /**
     * Position of this point
     */
    position: Coordinates;
    /**
     * X coordinate of this point
     */
    x: number;
    /**
     * Y coordinate of this point
     */
    y: number;
    /**
     * Coordinate system of this point
     */
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
 * @example const point = new Point([0, 0], CRS.geo)
 */
export class Point implements IPoint {
    /**
     * Coordinate system of this point
     */
    readonly crs: Crs;

    /**
     * Position of this point
     */
    position: Coordinates;

    /**
     * @constructor
     * @param position - point position
     * @param crs - point coordinate system
     */
    constructor(position: Coordinates, crs: Crs = geo) {
        this.crs = crs;
        this.position = position;
    }

    /**
     * Returns a new point with same position in new crs
     * @param newCrs - target coordinate system
     * @throws Cannot project to specified crs.
     */
    projectTo(newCrs: Crs): Point {
        const projection = this.crs.projectionTo(newCrs);
        if (projection) {
            return new Point(projection(this.position), newCrs);
        } else {
            throw new Error("Cannot project point to crs: " + newCrs.toString());
        }
    }

    /**
     * Returns a copy of the point
     * @returns {sGis.Point}
     */
    clone() {
        return new Point(this.position, this.crs);
    }

    /**
     * Getter returns clone of this point. Setter set point position.
     */
    get point() { return this.clone(); }
    set point(point) { this.position = point.projectTo(this.crs).position; }

    /**
     * X coordinate of this point
     */
    get x() { return this.position[0]; }
    set x(x) { this.position[0] = x; }

    /**
     * Y coordinate of this point
     */
    get y() { return this.position[1]; }
    set y(y) { this.position[1] = y; }

    /**
     * Returns true if the target point has the same position and crs as the current one
     * @param {sGis.Point} point - target point for comparison
     * @returns {boolean}
     */
    equals(point: Point) {
        return softEquals(point.x, this.x) && softEquals(point.y, this.y) && point.crs.equals(this.crs);
    }

    /**
     * Coordinates / position of this point
     */
    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }
    set coordinates(position: Coordinates) { this.position = [position[0], position[1]]; }
}
