import {FeatureParams} from "./Feature";
import {Coordinates} from "../baseTypes";
import {StaticLabelSymbol} from "../symbols/label/StaticLabelSymbol";
import {PointFeature} from "./PointFeature";

export interface LabelFeatureParams extends FeatureParams{
    content?: string
}

const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol();

/**
 * @example symbols/Label_Symbols
 */
export class LabelFeature extends PointFeature {
    private _content: string;

    constructor(position: Coordinates, {crs, content = '', symbol = DEFAULT_LABEL_SYMBOL}: LabelFeatureParams) {
        super(position, {crs, symbol});
        this._content = content;
    }

    get content(): string { return this._content; }
    set content(value: string) {
        this._content = value;
        this.redraw();
    }
}