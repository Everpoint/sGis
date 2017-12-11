import {SnappingProviderBase, SnappingProviderBaseConstructorParams} from "./SnappingProviderBase";
import {Map} from "../../Map";
import {SnappingData} from "./SnappingMethods";
import {Coordinates} from "../../baseTypes";
import {Poly} from "../../features/Poly";
import {FeatureLayerSnappingProvider} from "./FeatureLayerSnappingProvider";
import {ISnappingProvider} from "./ISnappingProvider";

export class PolySnappingProvider extends SnappingProviderBase {
    feature: Poly | null;

    constructor(map: Map, options: SnappingProviderBaseConstructorParams = {}) {
        super(map, options);
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
