import {Feature, FeatureParams} from './Feature'
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {PointSymbol} from "../symbols/point/Point";
import {Crs} from "../Crs";
import {PointFeature} from "./PointFeature";
import {Bbox} from "../Bbox";

export class FeatureGroup extends Feature implements IPoint {
    private _features: Feature[];
    private _position: Coordinates;

    constructor(features, { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._features = features;
    }

    projectTo(crs: Crs): PointFeature {
        let projected = Point.prototype.projectTo.call(this, crs);
        return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
    }

    centreOfMass() {
        const [x, y] = this._features.reduce((prev: Coordinates, curr: any) =>
            [prev[0] + curr.x, prev[1] + curr.y], [0, 0]);

        return [x / this._features.length, y / this._features.length];
    };

    features(): Feature[] {
        return this._features;
    }

    get position(): Coordinates {
        const [ x, y ] = this.centreOfMass();
        return [x, y]
    }
    set position(position: Coordinates) {
        this._position = position;
        this.redraw();
    }

    get bbox(): Bbox {
        const [ x, y ] = this.centreOfMass();
        return new Bbox([x, y], [x, y], this.crs);
    }

    get point(): Point { return new Point(this.position, this.crs); }
    set point(point: Point) { this.position = point.projectTo(this.crs).position; }

    get x(): number { return this.centreOfMass()[0]; }
    set x(x: number) {
        this._position[0] = x;
        this.redraw();
    }

    get y(): number { return this.centreOfMass()[1]; }
    set y(y: number) {
        this._position[1] = y;
        this.redraw();
    }

    get centroid(): Coordinates { return this.position; }
}
