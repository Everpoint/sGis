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
     * First coordinate of this point
     */
    x: number;
    /**
     * Second coordinate of this point
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
 */
export class Point implements IPoint {
    readonly crs: Crs;
    position: Coordinates;

    /**
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
            return error(new Error("Cannot project point to crs: " + newCrs.toString()));
        }
    }

    /**
     * Returns a copy of the point
     */
    clone(): Point {
        return new Point(this.position, this.crs);
    }

    /**
     * Getter returns clone of this point. Setter set point position.
     */
    get point(): Point { return this.clone(); }
    set point(point) { this.position = point.projectTo(this.crs).position; }

    get x(): number { return this.position[0]; }
    set x(x) { this.position[0] = x; }

    get y(): number { return this.position[1]; }
    set y(y) { this.position[1] = y; }

    /**
     * Returns true if the target point has the same position and crs as the current one
     * @param point - target point for comparison
     */
    equals(point: Point): boolean {
        return softEquals(point.x, this.x) && softEquals(point.y, this.y) && point.crs.equals(this.crs);
    }

    /**
     * Coordinates / position of this point
     */
    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }
    set coordinates(position: Coordinates) { this.position = [position[0], position[1]]; }
}
