import {FeatureGroup} from '../../features/FeatureGroup';
import {Bbox} from "../../Bbox";
import {Feature} from "../../features/Feature";

export interface IClusterProvider {
    features?: Feature[];
    size?: number;
}

export interface FeatureCluster extends Feature {
    indexX?: number;
    indexY?: number;
}

export class GridClusterProvider {
    private _features: Feature[];
    private _size: number;

    constructor({ features = [], size = 44 }: IClusterProvider = {}) {
        this._features = features;
        this._size = size;
    }

    private groupByIndex(features: Feature[], bbox: Bbox): FeatureGroup[] {
        const groups: { [key: string]: FeatureCluster[] } = {};
        const f = (feature: FeatureCluster) => [feature.indexX, feature.indexY];

        features.forEach((o: FeatureCluster) => {
            const group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });

        return Object.keys(groups).map( (group) => {
            return new FeatureGroup(groups[group], { crs: bbox.crs })
        })
    }

    getClusters(bbox: Bbox, resolution: number): Feature[] {
        const indexedFeatures = this._features.map(feature => {
            const point = feature.projectTo(bbox.crs);
            const size =  resolution * this._size;
            const indexX = Math.round(point.centroid[0] / size);
            const indexY = Math.round(point.centroid[1] / size);
            return Object.assign(feature, { indexX, indexY });
        })

        return this.groupByIndex(indexedFeatures, bbox);
    }
}
