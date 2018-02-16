import {Contour, Coordinates} from "../../baseTypes";

/**
 * Snapping providers are used by feature creation/editing controls to snap to some relevant points.
 */
export interface ISnappingProvider {
    /**
     * This method is called by a control to find a snapping point close to the given point. If a relevant snapping point
     * not found, the method must return null.
     * @param point - this is usually where the mouse cursor is at the current moment. So snapping point should be in
     *                vicinity of this point.
     * @param activeContour - in case of editing a polygon or polyline, this argument will contain the contour (set of points)
     *                        that is being edited at the moment.
     * @param activeIndex - in case of editing a polygon or polyline, this argument will be an index of the point in 'contour'
     *                      that is being edited at the moment.
     * @param isPolygon - specifies if the feature being edited should be considered enclosed.
     */
    getSnappingPoint(point: Coordinates, activeContour?: Contour, activeIndex?: number, isPolygon?: boolean): Coordinates | null;

    /**
     * Returns a copy of the given provider. This method is needed to create complex snapping providers, consisting
     * of several other providers.
     */
    clone(): ISnappingProvider;
}