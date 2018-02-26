import {SnappingProviderBase, SnappingProviderBaseParams} from "./SnappingProviderBase";
import {FeatureLayer} from "../../layers/FeatureLayer";
import {Map} from "../../Map";
import {SnappingData} from "./SnappingMethods";
import {Bbox} from "../../Bbox";
import {Point} from "../../Point";
import {Coordinates} from "../../baseTypes";
import {PointFeature} from "../../features/PointFeature";
import {Poly} from "../../features/Poly";
import {Polygon} from "../../features/Polygon";
import {ISnappingProvider} from "./ISnappingProvider";

/**
 * Provides snapping to points, lines and polygons in a [[FeatureLayer]].
 */
export class FeatureLayerSnappingProvider extends SnappingProviderBase {
    private readonly _layer: FeatureLayer;

    /**
     * @param map - working map of the control that uses snapping.
     * @param layer - the layer that contains the features to be snapped to.
     * @param params - snapping parameters.
     */
    constructor(map: Map, layer: FeatureLayer, params: SnappingProviderBaseParams = {}) {
        super(map, params);

        this._layer = layer;
    }

    protected _getSnappingData(point: Coordinates): SnappingData {
        let bbox = Bbox.fromPoint(new Point(point, this._map.crs), this.snappingDistance * this._map.resolution);
        let features = this._layer.getFeatures(bbox, this._map.resolution);

        let snappingData: SnappingData = {points: [], lines: []};
        features.forEach(feature => {
            if (feature instanceof PointFeature) {
                snappingData.points.push(feature.position);
            } else if (feature instanceof Poly) {
                FeatureLayerSnappingProvider.setPolyData(feature, snappingData);
            }
        });

        return snappingData
    }

    /**
     * For the given snapping data object, it adds the snapping lines
     * @param poly - line or polygon to be snapped to
     * @param data - snapping data to modify
     */
    static setPolyData(poly: Poly, data: SnappingData) {
        const isPolygon = poly instanceof Polygon;
        poly.rings.forEach(ring => {
            ring.forEach(point => {
                data.points.push(point);
            });

            for (let i = 1; i < ring.length; i++) {
                data.lines.push([ring[i - 1], ring[i]]);
            }

            if (isPolygon) data.lines.push([ring[ring.length - 1], ring[0]]);
        });
    }

    clone(): ISnappingProvider {
        return new FeatureLayerSnappingProvider(this._map, this._layer, {snappingDistance: this.snappingDistance, snappingMethods: this.snappingMethods});
    }

}
