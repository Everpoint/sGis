import {FeatureGroup} from '../../features/FeatureGroup';
import {geo, Crs} from '../../Crs'
import {Feature} from "../../features/Feature";
import {copyArray} from '../../utils/utils';

export interface IClusterProvider {
    features?: Feature[];
    size?: number;
    resolution?: number;
    crs?: Crs;
}

export interface FeatureCluster extends Feature {
    indexX?: number;
    indexY?: number;
}

export class GridClusterProvider {
    private _features: Feature[];
    private _size: number;
    private _crs: Crs;

    constructor({ features = [], size = 44, resolution = 9444, crs = geo }: IClusterProvider = {}) {
        this._features = features;
        this._size = size * resolution;
        this._crs = crs;
    }

    private _groupByIndex(features: Feature[]): FeatureGroup[] {
        const groups: { [key: string]: FeatureCluster[] } = {};
        const f = (feature: FeatureCluster) => [feature.indexX, feature.indexY];

        features.forEach((feature: FeatureCluster) => {
            const group = JSON.stringify(f(feature));
            groups[group] = groups[group] || [];
            groups[group].push(feature);
        });

        return Object.keys(groups).map( (group) => {
            return new FeatureGroup(groups[group], { crs: this._crs });
        })
    }

    private _pythagoras(p1: FeatureGroup, p2: FeatureGroup): number {
        return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
    }

    private _compareGroupsByDistance(featureGroups: FeatureGroup[]): FeatureGroup[] {
        const groups = copyArray(featureGroups);
        const clusters: FeatureGroup[] = [];

        for (let i = 0; i < groups.length; i++) {
            let cluster: Feature[] = groups[i].features;
            for (let j = i + 1; j < groups.length; j++) {
                if (this._pythagoras(groups[i], groups[j]) < this._size) {
                    cluster = cluster.concat(groups[j].features);
                    groups.splice(j, 1);
                }
            }

            if (
                clusters.length > 0 &&
                this._pythagoras(
                    clusters[clusters.length - 1],
                    new FeatureGroup(cluster, { crs: this._crs }),
                ) < this._size
            ) {
                clusters[clusters.length - 1] = new FeatureGroup(
                    clusters[clusters.length - 1].features.concat(cluster),
                    { crs: this._crs },
                );
            } else clusters.push(new FeatureGroup(cluster, { crs: this._crs }));
        }
        return clusters;
    }

    private _checkDistance(groups: FeatureGroup[]): boolean {
        let flag: boolean = false;

        for (let i = 0; i < groups.length; i++) {
            if(flag) break;
            for (let j = i + 1; j < groups.length; j++) {
                if(flag) break;
                if (this._pythagoras(groups[i], groups[j]) < this._size) flag = true;
            }
        }
        return flag;
    }

    getClusters(): FeatureGroup[] {
        const indexedFeatures = this._features.map(feature => {
            const point = feature.projectTo(this._crs);
            const indexX = Math.round(point.centroid[0] / this._size);
            const indexY = Math.round(point.centroid[1] / this._size);
            return Object.assign(feature, { indexX, indexY });
        });

        let flag: boolean = true;
        let clusters: FeatureGroup[] = this._groupByIndex(indexedFeatures);

        while (flag) {
            const comparedClusters = this._compareGroupsByDistance(clusters);
            clusters = comparedClusters;
            flag = this._checkDistance(comparedClusters);
        }

        return clusters;
    }
}
