import {Feature, FeatureParams} from "./Feature";
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";
import {PointSymbol} from "../symbols/point/Point";

/**
 * Simple geographical point.
 * @alias sGis.feature.Point
 * @example symbols/Point_Symbols
 */
export class PointFeature extends Feature implements IPoint {
    private _position: Coordinates;

    constructor(position: Coordinates, { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._position = position;
    }

    projectTo(crs: Crs): PointFeature {
        let projected = Point.prototype.projectTo.call(this, crs);
        return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
    }

    /**
     * Returns a copy of the feature.
     */
    clone(): PointFeature {
        return this.projectTo(this.crs);
    }

    get bbox(): Bbox { return new Bbox(this._position, this._position, this.crs); }

    /**
     * Geographical coordinates of the point, given in the feature crs.
     */
    get position(): Coordinates { return [this._position[0], this._position[1]]; }
    set position(position: Coordinates) {
        this._position = position;
        this.redraw();
    }

    /**
     * Point object corresponding to the feature position. This is the same as position property, but also
     * includes the information about coordinate system. If set, the point will first be projected to the feature
     * crs, and then the projected coordinates will be set to the feature.
     */
    get point(): Point { return new Point(this.position, this.crs); }
    set point(point: Point) { this.position = point.projectTo(this.crs).position; }

    get x(): number { return this._position[0]; }
    set x(x: number) {
        this._position[0] = x;
        this.redraw();
    }

    get y(): number { return this._position[1]; }
    set y(y: number) {
        this._position[1] = y;
        this.redraw();
    }

    /**
     * @deprecated
     */
    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }
    set coordinates(position: Coordinates) { this.position = [position[0], position[1]]; }

    get centroid(): Coordinates { return this.position; }
}
