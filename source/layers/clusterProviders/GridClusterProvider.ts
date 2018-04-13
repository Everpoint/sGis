import {FeatureGroup} from '../../features/FeatureGroup';
import {Bbox} from "../../Bbox";
import {Feature} from "../../features/Feature";
import {copyArray} from '../../utils/utils';

export interface IClusterProvider {
    features?: Feature[];
    width?: number;
    height?: number;
}

export interface FeatureCluster extends Feature {
    indexX?: number;
    indexY?: number;
}

export class GridClusterProvider {
    private _features: Feature[];
    private _width: number;
    private _height: number;

    constructor({ features = [], width = 44, height = 44 }: IClusterProvider = {}) {
        this._features = features;
        this._width = width;
        this._height = height;
    }

    private _groupByIndex(features: Feature[], bbox: Bbox): FeatureGroup[] {
        const groups: { [key: string]: FeatureCluster[] } = {};
        const f = (feature: FeatureCluster) => [feature.indexX, feature.indexY];

        features.forEach((feature: FeatureCluster) => {
            const group = JSON.stringify(f(feature));
            groups[group] = groups[group] || [];
            groups[group].push(feature);
        });

        return Object.keys(groups).map( (group) => {
            return new FeatureGroup(groups[group], { crs: bbox.crs });
        })
    }

    private _pythagoras(p1: FeatureGroup, p2: FeatureGroup): number {
        return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
    }


    private _compareGroupsByDistance(featureGroups: FeatureGroup[], bbox: Bbox, size: number): FeatureGroup[] {
        const groups = copyArray(featureGroups);
        const clusters: FeatureGroup[] = [];

        for (let i = 0; i < groups.length; i++) {
            let cluster: Feature[] = groups[i].features;
            for (let j = i + 1; j < groups.length; j++) {
                if (this._pythagoras(groups[i], groups[j]) < size) {
                    cluster = cluster.concat(groups[j].features);
                    groups.splice(j, 1);
                }
            }

            if (
                clusters.length > 0 &&
                this._pythagoras(
                    clusters[clusters.length - 1],
                    new FeatureGroup(cluster, { crs: bbox.crs }),
                ) < size
            ) {
                clusters[clusters.length - 1] = new FeatureGroup(
                    clusters[clusters.length - 1].features.concat(cluster),
                    { crs: bbox.crs },
                );
            } else clusters.push(new FeatureGroup(cluster, { crs: bbox.crs }));
        }
        return clusters;
    }

    private _checkDistance(groups: FeatureGroup[], size: number): boolean {
        let flag: boolean = false;
        for (let i = 0; i < groups.length; i++) {
            if(flag) break;
            for (let j = i + 1; j < groups.length; j++) {
                if(flag) break;
                if (this._pythagoras(groups[i], groups[j]) < size) flag = true;
            }
        }
        return flag;
    }

    getClusters(bbox: Bbox, resolution: number): FeatureGroup[] {
        const size = this._width > this._height ? this._width : this._height * resolution;

        const indexedFeatures = this._features.map(feature => {
            const point = feature.projectTo(bbox.crs);
            const indexX = Math.round(point.centroid[0] / size);
            const indexY = Math.round(point.centroid[1] / size);
            return Object.assign(feature, { indexX, indexY });
        });

        let flag: boolean = true;
        let clusters: FeatureGroup[] = this._groupByIndex(indexedFeatures, bbox);

        while (flag) {
            const comparedClusters = this._compareGroupsByDistance(clusters, bbox, size);
            clusters = comparedClusters;
            flag = this._checkDistance(comparedClusters, size);
        }

        return clusters;
    }
}
