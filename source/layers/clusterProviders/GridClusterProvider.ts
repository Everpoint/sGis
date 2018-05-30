import {FeatureGroup} from "../../features/FeatureGroup";
import {Bbox} from "../../Bbox";
import {Feature} from "../../features/Feature";
import {error} from "../../utils/utils";

export interface IClusterProvider {
    getClusters(bbox: Bbox, resolution: number): FeatureGroup[];
    add(features: Feature | Feature[]): void;
    remove(features: Feature | Feature[]): void;
    has(feature: Feature): boolean;
}

export class GridClusterProvider implements IClusterProvider {
    readonly _features: Feature[];
    readonly _size: number;
    private _resolution: number;
    private _cache: FeatureGroup[];

    constructor(size = 88) {
        this._features = [];
        this._size = size;
        this._resolution = 0;
        this._cache = [];
    }

    getClusters(bbox: Bbox, resolution: number): FeatureGroup[] {
        if (this._resolution !== resolution) {
            this._cache = [];
            this._resolution = resolution;
            const size = this._size * resolution;

            const groups: { [key: string]: Feature[] } = {};

            for (let i = 0; i < this._features.length; i++) {
                const point = this._features[i].projectTo(bbox.crs);
                const indexX = Math.floor(point.centroid[0] / size);
                const indexY = Math.floor(point.centroid[1] / size);
                if (groups[`${indexX}-${indexY}`]) {
                    groups[`${indexX}-${indexY}`].push(this._features[i]);
                } else groups[`${indexX}-${indexY}`] = [this._features[i]];
            }

            this._cache = Object.keys(groups).map(
                group => new FeatureGroup(groups[group], { crs: bbox.crs }),
            );
        }

        return this._cache.filter(
            feature =>
                feature.crs.canProjectTo(bbox.crs) &&
                (feature.persistOnMap || feature.bbox.intersects(bbox)),
        );
    }

    add(features: Feature | Feature[]): void {
        this._cache = [];

        const toAdd = Array.isArray(features) ? features : [features];
        if (toAdd.length === 0) return;
        toAdd.forEach(f => {
            if (this._features.indexOf(f) !== -1)
                error(
                    new Error(
                        `Feature ${f} is already in the GridClusterProvider`,
                    ),
                );
        });
        this._features.push(...toAdd);
    }

    remove(features: Feature | Feature[]): void {
        this._cache = [];

        const toRemove = Array.isArray(features) ? features : [features];
        if (toRemove.length === 0) return;
        toRemove.forEach(f => {
            let index = this._features.indexOf(f);
            if (index === -1)
                error(
                    new Error(`Feature ${f} is not in the GridClusterProvider`),
                );
            this._features.splice(index, 1);
        });
    }

    has(feature: Feature): boolean {
        return this._features.indexOf(feature) !== -1;
    }
}
