import {FeatureGroup} from "../../features/FeatureGroup";
import {Bbox} from "../../Bbox";
import {Feature} from "../../features/Feature";
import {error} from "../../utils/utils";
import {distance} from "../../geotools";

export interface IClusterProvider {
    getClusters(bbox: Bbox, resolution: number): FeatureGroup[];
    add(features: Feature | Feature[]): void;
    remove(features: Feature | Feature[]): void;
    has(feature: Feature): boolean;
}

type MutableGrid = { [key: string]: Feature[] } | { [key: string]: FeatureGroup };

export class GridClusterProvider implements IClusterProvider {
    readonly _features: Feature[];
    readonly _size: number;
    readonly _distance?: number;
    private _resolution: number;
    private _cache: FeatureGroup[];
    readonly _onFeatures: (features: FeatureGroup[]) => void;

    constructor({size = 88, distance, onFeatures }: { size?: number, distance?: number, onFeatures?: (features: FeatureGroup[]) => void }) {
        this._features = [];
        this._size = size;
        this._resolution = 0;
        this._cache = [];
        this._distance = distance;
        this._onFeatures = onFeatures;
    }

    private getDistanceGrid(grid: MutableGrid, bbox: Bbox, resolution: number): FeatureGroup[] {
        for (const group in grid) {
            const gridPosition = group.split("-");
            const x = +gridPosition[0];
            const y = +gridPosition[1];
            const nearest = [
                `${x + 1}-${y}`,
                `${x + 1}-${y + 1}`,
                `${x}-${y + 1}`,
                `${x - 1}-${y + 1}`,
                `${x - 1}-${y}`,
                `${x - 1}-${y - 1}`,
                `${x}-${y - 1}`,
                `${x + 1}-${y - 1}`
            ];

            grid[group] = new FeatureGroup(grid[group] as Feature[], { crs: bbox.crs });

            for (const nearestGridKey of nearest) {
                const currGroups = grid[group] as FeatureGroup;
                const nearestGroups =  grid[nearestGridKey];

                if (nearestGroups) {
                    const nearestFeatureGroup = nearestGroups instanceof FeatureGroup ? nearestGroups : new FeatureGroup(nearestGroups, { crs: bbox.crs });

                    if (distance(grid[group] as FeatureGroup, nearestFeatureGroup) / resolution < this._distance) {
                        const features = [...currGroups.features, ...nearestFeatureGroup.features];

                        grid[group] = new FeatureGroup(features, { crs: bbox.crs });
                        delete grid[nearestGridKey];
                    }
                }
            }
        }

        return Object.values(grid) as FeatureGroup[];
    }

    getClusters(bbox: Bbox, resolution: number): FeatureGroup[] {
        if (this._resolution !== resolution || this._cache.length === 0) {
            this._cache = [];
            this._resolution = resolution;
            const size = this._size * resolution;

            const grid: { [key: string]: Feature[] } = {};

            for (let i = 0; i < this._features.length; i++) {
                const point = this._features[i].projectTo(bbox.crs);
                const indexX = Math.floor(point.centroid[0] / size);
                const indexY = Math.floor(point.centroid[1] / size);

                if (grid[`${indexX}-${indexY}`]) {
                    grid[`${indexX}-${indexY}`].push(this._features[i]);
                } else {
                    grid[`${indexX}-${indexY}`] = [this._features[i]]
                };
            }

            if (this._distance) {
                this._cache = this.getDistanceGrid(grid, bbox, resolution);
            } else {
                this._cache = Object.keys(grid).map(
                    group => new FeatureGroup(grid[group], { crs: bbox.crs }),
                );
            }

            this._onFeatures && this._onFeatures(this._cache);
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
            const index = this._features.indexOf(f);
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
