import {Feature, FeatureParams} from './Feature'
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {PointSymbol} from "../symbols/point/Point";
import {Crs} from "../Crs";
import {Bbox} from "../Bbox";
import {PointFeature} from "./PointFeature";

export class FeatureGroup extends Feature implements IPoint {
    private _features: Feature[];
    private _bbox: Bbox;

    constructor(features, { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._features = features.map(feature => {
            if (this.crs.equals(feature.crs)) return feature;
            else {
                let projected = feature.projectTo(this.crs);
                return new PointFeature(projected.position, { crs: this.crs, symbol: this.symbol });
            }
        });
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone() {
        return new FeatureGroup(this._features, {crs: this.crs, symbol: this.symbol});
    }

    projectTo(crs: Crs): FeatureGroup {
        return new FeatureGroup(this._features, { crs, symbol: this.symbol });
    }

    features(): Feature[] {
        return this._features;
    }

    get position(): Coordinates {
        let x:number = 0;
        let y:number = 0 ;

        for (let i = 0; i < this._features.length; i++) {
            x += this._features[i].centroid[0];
            y += this._features[i].centroid[1];
        }

        return [x / this._features.length, y / this._features.length];
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

    get y(): number { return this.position[1]; }

    /**
     * @deprecated
     */
    get coordinates(): Coordinates { return [this.position[0], this.position[1]]; }

    get centroid(): Coordinates { return this.position; }
}
