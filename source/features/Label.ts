import {FeatureParams} from "./Feature";
import {Coordinates} from "../baseTypes";
import {StaticLabelSymbol} from "../symbols/label/StaticLabelSymbol";
import {PointFeature} from "./PointFeature";
import {Crs} from "../Crs";
import {Point} from "../Point";

export interface LabelFeatureParams extends FeatureParams{
    content?: string
}

const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol();

/**
 * Text label on the map.
 * @example symbols/Label_Symbols
 */
export class LabelFeature extends PointFeature {
    private _content: string;

    constructor(position: Coordinates, {content = '', symbol = DEFAULT_LABEL_SYMBOL, ...params}: LabelFeatureParams) {
        super(position, {symbol, ...params});
        this._content = content;
    }

    /**
     * The text of the label.
     */
    get content(): string { return this._content; }
    set content(value: string) {
        this._content = value;
        this.redraw();
    }

    clone(): LabelFeature {
        return new LabelFeature(this.position, {crs: this.crs, symbol: this.symbol, content: this.content, persistOnMap: this.persistOnMap});
    }

    projectTo(crs: Crs): LabelFeature {
        let projected = Point.prototype.projectTo.call(this, crs).position;
        return new LabelFeature(projected, {crs, symbol: this.symbol, content: this.content, persistOnMap: this.persistOnMap});
    }
}