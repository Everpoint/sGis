import {Feature, IFeatureConstructorArgs} from "./Feature";
import {Point} from "../Point";
import {LabelSymbol} from "../symbols/LabelSymbol";
import {Coordinates} from "../baseTypes";
import {Bbox} from "../Bbox";

export interface ILabelConstructorArgs extends IFeatureConstructorArgs {
    symbol?: LabelSymbol,
    content?: string
}

/**
 * Text label on the map.
 * @alias sGis.feature.Label
 * @extends sGis.Feature
 */
export class Label extends Feature {
    private _content: string;
    private _position: Coordinates;

    protected _symbol: LabelSymbol;

    /**
     * @constructor
     * @param {Number[]|sGis.Point} position - anchor point of the label. Array is in [x,y] format.
     * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
     */
    constructor(position, { symbol = new LabelSymbol(), content = '', crs }: ILabelConstructorArgs = {}, extension?: Object) {
        super({ symbol, crs }, extension);
        this.content = content;
        this.coordinates = position;
    }

    get position() { return this._position; }
    set position(position) {
        this._position = position;
        this.redraw();
    }

    /**
     * Position of the label
     * @type {sGis.Point}
     */
    get point() { return new Point(this.position, this.crs); }
    set point(/** sGis.Point */ point) {
        this.position = point.projectTo(this.crs).position;
    }

    /**
     * Position of the label
     */
    get coordinates() { return this._position.slice(); }
    set coordinates(point) {
        this.position = [point[0], point[1]];
    }

    /**
     * Text of the label. Can be any html string.
     * @type String
     */
    get content() { return this._content; }
    set content(/** String */ content) {
        this._content = content;
        this.redraw();
    }

    get bbox() {
        return new Bbox(this.position, this.position, this.crs);
    }
}
