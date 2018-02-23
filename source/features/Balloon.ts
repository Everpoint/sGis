import {FeatureParams} from "./Feature";
import {Coordinates} from "../baseTypes";
import {BalloonSymbol} from "../symbols/BalloonSymbol";
import {PointFeature} from "./Point";

export interface BalloonParams extends FeatureParams {
    position: Coordinates;
    content: HTMLElement | string;
}

export class Balloon extends PointFeature {
    private _content: HTMLElement;

    constructor({position, content, crs, symbol = new BalloonSymbol(), persistOnMap = true}: BalloonParams) {
        super(position, {crs, symbol, persistOnMap});

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
}