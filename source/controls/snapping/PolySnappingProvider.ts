import {SnappingProviderBase, SnappingProviderBaseParams} from "./SnappingProviderBase";
import {Map} from "../../Map";
import {SnappingData} from "./SnappingMethods";
import {Coordinates} from "../../baseTypes";
import {Poly} from "../../features/Poly";
import {FeatureLayerSnappingProvider} from "./FeatureLayerSnappingProvider";
import {ISnappingProvider} from "./ISnappingProvider";

export interface PolySnappingProviderParams extends SnappingProviderBaseParams {
    /** @see [[PolySnappingProvider.feature]] */
    feature?: Poly;
}

/**
 * This provider allows to find snapping points on a single polygon or polyline.
 */
export class PolySnappingProvider extends SnappingProviderBase {
    /**
     * Feature to find snapping point at. If set to null, the snapping is skipped (always returns null).
     */
    feature: Poly | null;

    /**
     * @param map - working map of the control that uses snapping.
     * @param options - snapping parameters.
     */
    constructor(map: Map, {feature = null, ...params}: PolySnappingProviderParams = {}) {
        super(map, params);
        this.feature = feature;
    }

    protected _getSnappingData(point: Coordinates): SnappingData {
        let snappingData: SnappingData = {points: [], lines: []};
        if (this.feature) FeatureLayerSnappingProvider.setPolyData(this.feature, snappingData);

        return snappingData;
    }

    clone(): ISnappingProvider {
        const result = new PolySnappingProvider(this._map, {snappingDistance: this.snappingDistance, snappingMethods: this.snappingMethods});
        result.feature = this.feature;
        return result;
    }
}
