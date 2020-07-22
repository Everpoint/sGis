import {Layer, LayerConstructorParams} from './Layer';
import {Feature} from '../features/Feature';
import {Symbol} from '../symbols/Symbol';
import {Bbox} from '../Bbox';
import {Render} from '../renders/Render';
import {StaticImageRender} from '../renders/StaticImageRender';
import {ClusterSymbol} from '../symbols/ClusterSymbol';
import {FeatureGroup} from '../features/FeatureGroup';
import {IClusterProvider, GridClusterProvider} from "./clusterProviders/GridClusterProvider";
import {FeaturesAddEvent, FeaturesRemoveEvent} from "./FeatureLayer";

export interface ClusterLayerConstructorParams extends LayerConstructorParams {
    clusterSymbol?: Symbol<Feature>;
    gridClusterProvider?: IClusterProvider;
}

/**
 * @alias sGis.ClusterLayer
 */
export class ClusterLayer extends Layer {
    private _clusterSymbol: Symbol<Feature>;
    private _gridClusterProvider: IClusterProvider;

    /**
     * @param __namedParameters - properties to be set to the corresponding fields.
     */
    constructor(
        {
            delayedUpdate = true,
            clusterSymbol = new ClusterSymbol(),
            gridClusterProvider = new GridClusterProvider(),
            ...layerParams
        }: ClusterLayerConstructorParams = {},
    ) {
        super({ delayedUpdate, ...layerParams });
        this._clusterSymbol = clusterSymbol;
        this._gridClusterProvider = gridClusterProvider;
    }

    getRenders(bbox: Bbox, resolution: number): Render[] {
        let renders: Array<Render> = [];

        this.getFeatures(bbox, resolution).forEach((cluster: FeatureGroup) => {
            if (cluster.symbol !== this._clusterSymbol) {
                cluster.symbol = this._clusterSymbol;
            }

            if (cluster.features.length === 1) {
                renders = renders.concat(
                    cluster.features[0].render(resolution, bbox.crs),
                );
            } else {
                renders = renders.concat(cluster.render(resolution, bbox.crs));
            }

            renders.forEach(render => {
                if (render instanceof StaticImageRender) {
                    render.onLoad = () => {
                        this.redraw();
                    };
                }
            });
        });

        return renders;
    }

    getFeatures(bbox: Bbox, resolution: number): FeatureGroup[] {
        if (!this.checkVisibility(resolution)) return [];
        return this._gridClusterProvider.getClusters(bbox, resolution);
    }

    /**
     * Adds a feature or an array of features to the layer.
     * @param features - features to add.
     * @throws if one of the features is already in the layer.
     * @fires FeaturesAddEvent
     */
    add(features: Feature | Feature[]): void {
        const toAdd = Array.isArray(features) ? features : [features];
        if (toAdd.length === 0) return;
        this.fire(new FeaturesAddEvent(toAdd));
        this._gridClusterProvider.add(toAdd);
        this.redraw();
    }

    /**
     * Removes a feature or an array of features from the layer.
     * @param features - feature or features to be removed.
     * @throws if the one of the features is not in the layer.
     * @fires [[FeaturesRemoveEvent]]
     */
    remove(features: Feature | Feature[]): void {
        const toRemove = Array.isArray(features) ? features : [features];
        if (toRemove.length === 0) return;
        this.fire(new FeaturesRemoveEvent(toRemove));
        this._gridClusterProvider.remove(toRemove);
        this.redraw();
    }

    /**
     * Returns true if the given feature is in the layer.
     * @param feature
     */
    has(feature: Feature): boolean {
        return this._gridClusterProvider.has(feature);
    }
}
