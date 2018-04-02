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

    constructor(position: Coordinates, { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._position = position;
    }

    projectTo(crs: Crs): PointFeature {
        let projected = Point.prototype.projectTo.call(this, crs);
        return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
    }

    get features(): Feature[] {
        return this._features;
    }

    get bbox(): Bbox { return new Bbox(this._position, this._position, this.crs); }

    get position(): Coordinates { return [this._position[0], this._position[1]]; }

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

    get centroid(): Coordinates { return this.position; }
}
