import {MultiPoint} from "../features/MultiPoint";
import {PointFeature} from "../features/PointFeature";
import {Symbol} from "./Symbol";
import {Crs} from "../Crs";
import {Render} from "../renders/Render";

export class MultiPointSymbol extends Symbol<MultiPoint> {
    baseSymbol: Symbol<PointFeature>;

    constructor(baseSymbol: Symbol<PointFeature>) {
        super();
        this.baseSymbol = baseSymbol;
    }

    renderFunction(feature: MultiPoint, resolution: number, crs: Crs): Render[] {
        if (!(feature instanceof MultiPoint)) return [];
        let renders: Render[] = [];
        feature.points.forEach(point => {
            let f = new PointFeature(point, {crs: feature.crs, symbol: this.baseSymbol});
            renders = renders.concat(f.render(resolution, crs));
        });
        return renders;
    }
}