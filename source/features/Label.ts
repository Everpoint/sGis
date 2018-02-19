import {Feature, FeatureParams} from "./Feature";
import {IPoint, Point} from "../Point";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";
import {Coordinates} from "../baseTypes";
import {StaticLabelSymbol} from "../symbols/label/StaticLabelSymbol";

export interface LabelFeatureParams extends FeatureParams{
    content?: string
}

const DEFAULT_LABEL_SYMBOL = new StaticLabelSymbol();

/**
 * @example symbols/Label_Symbols
 */
export class LabelFeature extends Feature implements IPoint {
    private _position: Coordinates;
    private _content: string;

    constructor(position: Coordinates, {crs, content = '', symbol = DEFAULT_LABEL_SYMBOL}: LabelFeatureParams) {
        super({crs, symbol});

        this._position = position;
        this._content = content;
    }

    get content(): string { return this._content; }
    set content(value: string) {
        this._content = value;
        this.redraw();
    }

    get bbox(): Bbox {
        return new Bbox(this._position, this._position, this.crs);
    }

    get position(): Coordinates { return this._position; }
    set position(value: Coordinates) {
        this._position = value;
        this.redraw();
    }

    get x(): number { return this._position[0]; }
    get y(): number { return this._position[1]; }

    projectTo(newCrs: Crs): LabelFeature {
        let projected = <Point>Point.prototype.projectTo.call(this, newCrs);
        return new LabelFeature(projected.position, {crs: newCrs, symbol: this.symbol, content: this.content});
    }
}