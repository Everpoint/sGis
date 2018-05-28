import {Layer, LayerConstructorParams} from './Layer';
import {Feature} from '../features/Feature';
import {GridClusterProvider} from '../layers/clusterProviders/GridClusterProvider';
import {Symbol} from '../symbols/Symbol';
import {Bbox} from '../Bbox';
import {Render} from '../renders/Render';
import {StaticImageRender} from '../renders/StaticImageRender';
import {ClusterSymbol} from '../symbols/ClusterSymbol';
import {FeatureGroup} from '../features/FeatureGroup';

export interface ClusterLayerConstructorParams extends LayerConstructorParams {
    clusterSymbol?: Symbol<Feature>;
    gridClusterProvider?: GridClusterProvider;
}

/**
 * A layer that contains arbitrary set of features.
 * @alias sGis.FeatureLayer
 */
export class ClusterLayer extends Layer {
    private _clusterSymbol: Symbol<Feature>;
    private _gridClusterProvider: GridClusterProvider;

    /**
     * @param __namedParameters - properties to be set to the corresponding fields.
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance.
     */
    constructor(
        {
            delayedUpdate = true,
            clusterSymbol = new ClusterSymbol(),
            gridClusterProvider = new GridClusterProvider(),
            ...layerParams,
        }: ClusterLayerConstructorParams = {},
        extensions?: Object,
    ) {
        super({ delayedUpdate, ...layerParams }, extensions);
        this._clusterSymbol = clusterSymbol;
        this._gridClusterProvider = gridClusterProvider;
    }

    getRenders(bbox: Bbox, resolution: number): Render[] {
        let renders: Array<Render> = [];

        this.getFeatures(bbox, resolution).forEach((feature: FeatureGroup) => {
            if (
                feature.features.length === 1 &&
                feature.symbol !== feature.features[0].symbol
            ) {
                feature.symbol = feature.features[0].symbol;
            } else if (
                feature.features.length > 1 &&
                feature.symbol !== this._clusterSymbol
            ) {
                feature.symbol = this._clusterSymbol;
            }
            renders = renders.concat(feature.render(resolution, bbox.crs));
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

    add(features: Feature | Feature[]): void {
        this._gridClusterProvider.add(features);
    }

    remove(features: Feature | Feature[]): void {
        this._gridClusterProvider.remove(features);
    }

    has(feature: Feature): boolean {
        return this._gridClusterProvider.has(feature);
    }
}
