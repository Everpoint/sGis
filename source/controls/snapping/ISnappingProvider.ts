import {Contour, Coordinates} from "../../baseTypes";

export interface ISnappingProvider {
    getSnappingPoint(point: Coordinates, activeContour?: Contour, activeIndex?: number, isPolygon?: boolean): Coordinates | null;
    clone(): ISnappingProvider;
}