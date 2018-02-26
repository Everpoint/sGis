import {FeatureParams} from "./Feature";
import {BalloonSymbol} from "../symbols/BalloonSymbol";
import {PointFeature} from "./PointFeature";
import {Coordinates} from "../baseTypes";

export interface BalloonParams extends FeatureParams {
    /**
     * The content of the balloon. If an DOM element is given, it will be inserted into the balloon without modifications.
     * It means that if multiple balloons have the same DOM element as their 'content', opening another one will remove
     * the contents of the first one (for one DOM element can exist only in one place of DOM tree at the same time).
     * If you need multiple balloons with the same content, set the content as HTML string.
     * <br>
     * If the 'content' property is given as string, it is used to create content DOM element. <b>Pay attention, that
     * HTML content is not escaped, so use only safe HTML strings as the content property</b>.
     */
    content: HTMLElement | string;
}

/**
 * This feature lets you put a custom html blocks on the map in the form of balloons over the map. The position of the balloon
 * is set as geographic coordinates of a point.
 * @alias sGis.feature.Balloon
 * @example controls/Balloon_Control
 */
export class Balloon extends PointFeature {
    private readonly _content: HTMLElement;

    constructor(position: Coordinates, {content, symbol = new BalloonSymbol(), persistOnMap = true, ...params}: BalloonParams) {
        super(position, {symbol, persistOnMap, ...params});

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

    get content(): HTMLElement { return this._content; }
}