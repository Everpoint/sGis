import {Layer, LayerConstructorParams} from './Layer';
import {Feature} from '../features/Feature';
import {GridClusterProvider} from '../layers/clusterProviders/GridClusterProvider';
import {Symbol} from '../symbols/Symbol';
import {Bbox} from '../Bbox';
import {Render} from '../renders/Render';
import {StaticImageRender} from '../renders/StaticImageRender';
import {ClusterSymbol} from '../symbols/ClusterSymbol';
import {FeatureGroup} from '../features/FeatureGroup';
import {FeaturesAddEvent, FeaturesRemoveEvent} from './FeatureLayer';
import {error} from '../utils/utils';

export interface ClusterLayerConstructorParams extends LayerConstructorParams {
    features?: Feature[];
    clusterSymbol?: Symbol<Feature>;
    symbol?: Symbol<Feature>;
    size?: number;
}

/**
 * A layer that contains arbitrary set of features.
 * @alias sGis.FeatureLayer
 */
export class ClusterLayer extends Layer {
    private _features: Feature[];
    private _clusterSymbol: Symbol<Feature>;
    private _gridClusterProvider: GridClusterProvider;
    private _symbol: Symbol<Feature>;

    /**
     * @param __namedParameters - properties to be set to the corresponding fields.
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance.
     */
    constructor(
        {
            delayedUpdate = true,
            features = [],
            clusterSymbol = new ClusterSymbol(),
            symbol = new ClusterSymbol(),
            size,
            ...layerParams,
        }: ClusterLayerConstructorParams = {},
        extensions?: Object,
    ) {
        clusterSymbol;
        super({ delayedUpdate, ...layerParams }, extensions);
        this._features = features;
        this._clusterSymbol = clusterSymbol;
        this._symbol = symbol;
        this._gridClusterProvider = new GridClusterProvider({
            size,
        });
    }

    getRenders(bbox: Bbox, resolution: number): Render[] {
        let renders: Array<Render> = [];

        this.getFeatures(bbox, resolution).forEach((feature: FeatureGroup) => {
            if (feature.features.length === 1) {
                feature.symbol = this._symbol;
            } else {
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
        const toAdd = Array.isArray(features) ? features : [features];
        if (toAdd.length === 0) return;
        toAdd.forEach(f => {
            if (this._features.indexOf(f) !== -1)
                error(new Error(`Feature ${f} is already in the layer`));
        });
        this._features = this._features.concat(toAdd);
        this.fire(new FeaturesAddEvent(toAdd));
        this.redraw();
        this._gridClusterProvider.add(toAdd);
    }

    remove(features: Feature | Feature[]): void {
        const toRemove = Array.isArray(features) ? features : [features];
        if (toRemove.length === 0) return;
        toRemove.forEach(f => {
            let index = this._features.indexOf(f);
            if (index === -1)
                error(new Error(`Feature ${f} is not in the layer`));
            this._features.splice(index, 1);
        });
        this.fire(new FeaturesRemoveEvent(toRemove));
        this.redraw();
        this._gridClusterProvider.remove(toRemove);
    }

    has(feature: Feature): boolean {
        return this._features.indexOf(feature) !== -1;
    }

    get features(): Feature[] {
        return this._features;
    }

    set features(features: Feature[]) {
        const currFeatures = this._features;
        this._features = [];
        this.fire(new FeaturesRemoveEvent(currFeatures));
        this.add(features);

        this.redraw();
    }
}
