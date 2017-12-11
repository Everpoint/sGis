import {ISnappingProvider} from "./ISnappingProvider";
import {Contour, Coordinates} from "../../baseTypes";

export class CombinedSnappingProvider implements ISnappingProvider{
    providers: ISnappingProvider[];

    constructor(providers: ISnappingProvider[]) {
        this.providers = providers;
    }

    getSnappingPoint(point: Coordinates, activeContour?: Contour, activeIndex?: number, isPolygon?: boolean): Coordinates | null {
        for (let i = 0; i < this.providers.length; i++) {
            const snappingPoint = this.providers[i].getSnappingPoint(point, activeContour, activeIndex, isPolygon);
            if (snappingPoint !== null) return snappingPoint;
        }
    }

    clone(): ISnappingProvider {
        let children = this.providers.map(x => x.clone());
        return new CombinedSnappingProvider(children);
    }
}