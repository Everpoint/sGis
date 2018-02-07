import {Feature, FeatureParams} from "./Feature";
import {IPoint, Point} from "../Point";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";
import {Coordinates} from "../baseTypes";
import {BalloonSymbol} from "../symbols/BalloonSymbol";

export interface BalloonParams extends FeatureParams {
    position: Coordinates;
    content: HTMLElement | string;
}

export class Balloon extends Feature implements IPoint {
    private _position: Coordinates;
    private _content: HTMLElement;

    constructor({position, content, crs, symbol = new BalloonSymbol(), persistOnMap = true}: BalloonParams) {
        super({crs, symbol, persistOnMap});

        this._position = position;

        if (content instanceof HTMLElement) {
            this._content = content;
        } else {
            this._content = this._getNode(content);
        }
    }

    private _getNode(htmlString: string): HTMLElement {
        let div = document.createElement('div');
        div.innerHTML = htmlString;
        if (div.children.length === 1) {
            return <HTMLElement>div.firstChild;
        } else {
            return div;
        }
    }

    get content() { return this._content; }

    get position(): Coordinates { return this._position; }
    set position(value: Coordinates) {
        this._position = value;
        this.redraw();
    }

    get x(): number { return this._position[0]; }
    get y(): number { return this._position[1]; }

    projectTo(newCrs: Crs): IPoint {
        let projected = <Point>Point.prototype.projectTo.call(this, newCrs);
        return new Balloon({position: projected.position, content: this._content, crs: newCrs, symbol: this.symbol});
    }

    get bbox(): Bbox {
        return new Bbox(this._position, this._position, this.crs);
    }
}