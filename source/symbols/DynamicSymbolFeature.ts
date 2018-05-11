import {PointFeature} from "../features/PointFeature";
import {IPoint} from "../Point";
import {DynamicRender} from "../renders/Render";
import {Bbox} from "../Bbox";

export abstract class DynamicSymbolFeature extends PointFeature implements IPoint {
    __dynamicSymbolRender: DynamicRender = null;
    __lastBbox: Bbox = null;
    __lastResolution: number = null;
}