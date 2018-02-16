import {ISnappingProvider} from "./ISnappingProvider";
import {Map} from "../../Map";
import {
    axisSnapping, lineSnapping, midPointSnapping, orthogonalSnapping, SnappingData, SnappingMethod,
    vertexSnapping
} from "./SnappingMethods";
import {Contour, Coordinates} from "../../baseTypes";

export interface SnappingProviderBaseParams {
    /** @see [[SnappingProviderBase.snappingDistance]] */
    snappingDistance?: number;
    /** @see [[SnappingProviderBase.snappingMethods]] */
    snappingMethods?: SnappingMethod[];
}

/**
 * Base functionality for snapping based on selected [[SnappingMethod]]s and snapping distance.
 */
export abstract class SnappingProviderBase implements ISnappingProvider {
    protected readonly _map: Map;

    /**
     * Maximum distance the snapping point can be from the base point in the coordinates of the base point.
     */
    snappingDistance: number;

    /**
     * List of snapping methods to be used for finding the snapping point. The methods are applied in the order of this list.
     * So the snapping point from first method to return a value other then null will be used for snapping.
     */
    snappingMethods: SnappingMethod[];

    /**
     * @param map - working map of the control that uses snapping.
     * @param __namedParams - snapping parameters.
     */
    constructor(map: Map, {
        snappingDistance = 7,
        snappingMethods = [vertexSnapping, midPointSnapping, lineSnapping, orthogonalSnapping, axisSnapping]
    }: SnappingProviderBaseParams = {}) {
        this._map = map;

        this.snappingDistance = snappingDistance;
        this.snappingMethods = snappingMethods;
    }

    getSnappingPoint(position: Coordinates, activeContour?: Contour, activeIndex?: number, isEnclosed?: boolean): Coordinates | null {
        const data = this._getSnappingData(position);
        const snappingDistance = this.snappingDistance * this._map.resolution;

        for (let i = 0; i < this.snappingMethods.length; i++) {
            const snappingPoint = this.snappingMethods[i]({position, data, snappingDistance, activeContour, activeIndex, isEnclosed});
            if (snappingPoint) return snappingPoint;
        }

        return null;
    }

    /**
     * Returns the relevant points and lines to snap to.
     * @param point - base point for snapping, in the vicinity of which the snapping is performed.
     */
    protected abstract _getSnappingData(point: Coordinates): SnappingData;
    abstract clone(): ISnappingProvider;
}