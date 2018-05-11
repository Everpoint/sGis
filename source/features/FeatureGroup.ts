import {Feature, FeatureParams} from "./Feature"
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {PointSymbol} from "../symbols/point/Point";
import {Crs} from "../Crs";
import {Bbox} from "../Bbox";

/**
 * Represents a group or a cluster of geographic features.
 */
export class FeatureGroup extends Feature implements IPoint {
    private _features: Feature[];
    private _bbox?: Bbox;

    /**
     * When the group is created, all the features given in constructor are projected into the group crs. It means that
     * the group might not have the original features, but their copies in the projected CRS. If features are changed
     * after the group is created, a new group must be created to reflect the changes.
     * @param features - list of features to be added to the group
     * @param __namedParameters
     */
    constructor(features: Feature[], { symbol = new PointSymbol(), ...params }: FeatureParams = {}) {
        super({symbol, ...params});
        this._features = features.map(feature => {
            if (this.crs.equals(feature.crs)) return feature;
            else {
                const projected = feature.projectTo(this.crs);
                const assigned  = Object.assign(feature, projected);
                return assigned;
            }
        });
    }

    clone() {
        return new FeatureGroup(this._features, {crs: this.crs, symbol: this.symbol});
    }

    /**
     * Projects the group and all the features in it to the given CRS, returning a copy of the group containing
     * copies of the features.
     * @param crs
     */
    projectTo(crs: Crs): FeatureGroup {
        return new FeatureGroup(this._features, { crs, symbol: this.symbol });
    }

    /**
     * The list of features in the group. Position and bbox of the group will be calculated based on the position and
     * bboxes of all the features in the group.
     */
    get features(): Feature[] {
        return this._features;
    }

    get centroid(): Coordinates { return this.position; }

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
            xMin = Math.min(xMin, feature.bbox.xMin);
            yMin = Math.min(yMin, feature.bbox.yMin);
            xMax = Math.max(xMax, feature.bbox.xMax);
            yMax = Math.max(yMax, feature.bbox.yMax);
        });

        this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
        return this._bbox;
    }

    get point(): Point { return new Point(this.position, this.crs); }

    get x(): number { return this.position[0]; }

    get y(): number { return this.position[1]; }
}
