import {FeatureGroup} from "../../features/FeatureGroup";
import {Bbox} from "../../Bbox";
import {Feature} from "../../features/Feature";

export interface IClusterProvider {
    getClusters(bbox: Bbox, resolution: number): FeatureGroup[];
    add(features: Feature | Feature[]): void;
    remove(features: Feature | Feature[]): void;
    has(feature: Feature): boolean;
}

export type MutableGrid = { [key: string]: Feature[] } | { [key: string]: FeatureGroup };

export type OnChangeGrid = (features: FeatureGroup[]) => void;

export type ClusterProviderParams = {
    size?: number,
    distance?: number,
    onChangeGrid?: OnChangeGrid
}
