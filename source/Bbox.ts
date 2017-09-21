import {Coordinates} from "./baseTypes";
import {Crs, geo} from "./Crs";
import {IPoint, Point} from "./Point";
import {softEquals} from "./utils/math";
import {error} from "./utils/utils";

/**
 * Object representing a rectangular area on a map between two point.
 * @alias sGis.Bbox
 */
export default class Bbox {
    private _crs: Crs;
    private _p: [number, number, number, number];

    /**
     * @constructor
     * @param {Position} point1 - first corner point of rectangle
     * @param {Position} point2 - second corner point of rectangle
     * @param {sGis.Crs} [crs=sGis.CRS.geo] - coordinate system of the point coordinates
     */
    constructor(point1: Coordinates, point2: Coordinates, crs: Crs = geo)
    {
        this._crs = crs;
        this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
    }

    /**
     * Returns a new Bbox in the specified coordinate system.
     * @param {sGis.Crs} crs - target coordinate system
     * @throws If the instance coordinates cannot be projected into the target crs.
     * @returns {sGis.Bbox}
     */
    projectTo(crs: Crs): Bbox {
        let projected1 = new Point([this._p[0], this._p[1]], this._crs).projectTo(crs).position;
        let projected2 = new Point([this._p[2], this._p[3]], this._crs).projectTo(crs).position;
        return new Bbox(projected1, projected2, crs);
    }

    /**
     * Center point of the bounding box
     * @type sGis.Point
     * @readonly
     */
    get center(): Point { return new Point([(this.xMax + this.xMin)/2, (this.yMax + this.yMin)/2], this.crs); }

    /**
     * Returns a copy of the bbox
     * @returns {sGis.Bbox}
     */
    clone(): Bbox {
        return this.projectTo(this._crs);
    }

    /**
     * Returns true if the given bbox is equal (geographically) to the target bbox. It will return false if the target
     * bbox is set in different coordinate system or if any of the 4 coordinates are different by more then 0.0001%.
     * @param {sGis.Bbox} bbox - target bbox
     * @returns {boolean}
     */
    equals(bbox: Bbox): boolean {
        let target = bbox.coordinates;
        for (let i = 0; i < 4; i++) if (!softEquals(this._p[i], target[i])) return false;
        return this._crs.equals(bbox.crs);
    }

    intersect(bbox: Bbox): Bbox {
        bbox = bbox.crs === this.crs ? bbox : bbox.projectTo(this.crs);
        return new Bbox([Math.min(this.xMin, bbox.xMin), Math.min(this.yMin, bbox.yMin)], [Math.max(this.xMax, bbox.xMax), Math.max(this.yMax, bbox.yMax)], this.crs);
    }

    /**
     * Returns true if at list one point of the given bbox lies inside the target bbox. NOTE that this method will return true
     * if on of the bboxes is completely inside the other. It will return false if bboxes are adjustened, e.g. a side of one bbox
     * touches a side of another one.
     * @param {sGis.Bbox} bbox - target bbox
     * @returns {boolean}>
     */
    intersects(bbox: Bbox): boolean {
        let projected = bbox.projectTo(this._crs);
        return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
    }

    /**
     * Returns true, if the target point is inside the bbox.
     * @param {sGis.Point} point
     * @returns {boolean}
     */
    contains(point: IPoint) {
        let projected = point.projectTo(this.crs);
        return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
    }

    /**
     * Coordinate system of the bbox.
     * @type sGis.Crs
     * @readonly
     */
    get crs(): Crs { return this._crs; }

    /**
     * Coordinate of the right border of the bbox. Cannot be assigned value less then xMin.
     * @type Number
     */
    get xMax() { return this._p[2] }
    set xMax(value: number) {
        if (value < this.xMin) error('Max value cannot be lower than the min value');
        this._p[2] = value;
    }

    /**
     * Coordinate of the top border of the bbox. Cannot be assigned value less then yMin.
     * @type Number
     */
    get yMax() { return this._p[3]; }
    set yMax(value: number) {
        if (value < this.yMin) error('Max value cannot be lower than the min value');
        this._p[3] = value;
    }

    /**
     * Coordinate of the left border of the bbox. Cannot be assigned value larger then xMax.
     * @type Number
     */
    get xMin() { return this._p[0]; }
    set xMin(value: number) {
        if (value > this.xMax) error('Min value cannot be higher than the max value');
        this._p[0] = value;
    }

    /**
     * Coordinate of the bottom border of the bbox. Cannot be assigned value larger then yMax.
     * @type Number
     */
    get yMin() { return this._p[1]; }
    set yMin(value: number) {
        if (value > this.yMax) error('Min value cannot be higher than the max value');
        this._p[1] = value;
    }

    /**
     * Width of the bbox.
     * @type Number
     * @readonly
     */
    get width(): number { return this.xMax - this.xMin; }

    /**
     * Height of the bbox.
     * @type number
     * @readonly
     */
    get height(): number { return this.yMax - this.yMin; }

    /**
     * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax].
     * @type number[]
     * @readonly
     */
    get coordinates(): number[]{ return this._p.slice(); }
}
