import {Feature, FeatureParams} from './Feature'
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {PointSymbol} from "../symbols/point/Point";
import {Crs} from "../Crs";
import {PointFeature} from "./PointFeature";
import {Bbox} from "../Bbox";

export class FeatureGroup extends Feature implements IPoint {
    private _position: Coordinates;
    private _features: Feature[];
    private _bbox: Bbox;

    constructor(features, { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._features = features;
    }

    projectTo(crs: Crs): PointFeature {
        let projected = Point.prototype.projectTo.call(this, crs);
        return new PointFeature(projected.position, { crs: crs, symbol: this.symbol });
    }

    features(): Feature[] {
        return this._features;
    }

    get position(): Coordinates {
        const coordinates = [0, 0];

        for (let i = 0; i < this._features.length; i++) {
            coordinates[0] += this._features[i].centroid[0];
            coordinates[1] += this._features[i].centroid[1];
        }

        return [coordinates[0] / this._features.length, coordinates[1] / this._features.length];
    }
    set position(position: Coordinates) {
        this._position = [position[0], position[1]];
    }

    get bbox(): Bbox {
        if (this._bbox) return this._bbox;
        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = Number.MIN_VALUE;
        let yMax = Number.MIN_VALUE;

        this._features.forEach(feature => {
            xMin = Math.min(xMin, feature.centroid[0]);
            yMin = Math.min(yMin, feature.centroid[1]);
            xMax = Math.max(xMax, feature.centroid[0]);
            yMax = Math.max(yMax, feature.centroid[1]);
        });

        this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
        return this._bbox;
    }

    get point(): Point { return new Point(this.position, this.crs); }

    get x(): number { return this.position[0]; }
    set x(x: number) {
        this.position[0] = x;
        this.redraw();
    }

    get y(): number { return this.position[1]; }
    set y(y: number) {
        this.position[1] = y;
        this.redraw();
    }

    /**
     * @deprecated
     */
    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }
    set coordinates(position: Coordinates) { this.position = [position[0], position[1]]; }

    get centroid(): Coordinates { return this.position; }
}
