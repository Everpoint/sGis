import {ISnappingProvider} from "./ISnappingProvider";
import {Map} from "../../Map";
import {
    axisSnapping, lineSnapping, midPointSnapping, orthogonalSnapping, SnappingData, SnappingMethod,
    vertexSnapping
} from "./SnappingMethods";
import {Contour, Coordinates} from "../../baseTypes";

export interface SnappingProviderBaseConstructorParams {
    snappingDistance?: number,
    snappingMethods?: SnappingMethod[]
}

export abstract class SnappingProviderBase implements ISnappingProvider {
    protected readonly _map: Map;

    snappingDistance: number;
    snappingMethods: SnappingMethod[];

    constructor(map: Map, {
        snappingDistance = 7,
        snappingMethods = [vertexSnapping, midPointSnapping, lineSnapping, orthogonalSnapping, axisSnapping]
    }: SnappingProviderBaseConstructorParams = {}) {
        this._map = map;

        this.snappingDistance = snappingDistance;
        this.snappingMethods = snappingMethods;
    }

    getSnappingPoint(point: Coordinates, activeContour?: Contour, activeIndex?: number, isPolygon?: boolean): Coordinates | null {
        const data = this._getSnappingData(point);
        const distance = this.snappingDistance * this._map.resolution;

        for (let i = 0; i < this.snappingMethods.length; i++) {
            const snappingPoint = this.snappingMethods[i](point, data, distance, activeContour, activeIndex, isPolygon);
            if (snappingPoint) return snappingPoint;
        }

        return null;
    }

    protected abstract _getSnappingData(point: Coordinates): SnappingData;
    abstract clone(): ISnappingProvider;
}