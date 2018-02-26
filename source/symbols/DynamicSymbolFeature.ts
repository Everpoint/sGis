import {PointFeature} from "../features/PointFeature";
import {IPoint} from "../Point";
import {DynamicRender} from "../renders/Render";

export abstract class DynamicSymbolFeature extends PointFeature implements IPoint {
    __dynamicSymbolRender: DynamicRender = null;
}