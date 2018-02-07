import {DynamicPointSymbol, DynamicPointSymbolParams} from "./Symbol";
import {Feature} from "../features/Feature";
import {setStyleNode} from "../utils/utils";
import {Balloon} from "../features/Balloon";
import {MapHtmlElement} from "../painters/DomPainter/EventDispatcher";

setStyleNode(`
    .sGis-balloon {
        border: 3px solid rgba(0, 0, 0, 0.3);
        border-radius: 7px;
        transform: translate(-50%, -100%);
    }
    
    .sGis-balloon:before {
        content: " ";
        position: absolute;
        background: white;
        border: 3px solid rgba(0, 0, 0, 0.3);
        width: 10px;
        height: 10px;
        margin-left: 0;
        transform: translate(-50%, -50%) rotate(45deg);
        left: 50%;
        top: 100%;
    }
    
    .sGis-balloon > div {
        border-radius: 5px;
        background: white;
        position: relative;
        min-height: 40px;
        min-width: 40px;
        overflow: hidden;
        padding: 5px;
    }
`);

export class BalloonSymbol extends DynamicPointSymbol {
    constructor({onRender, offset = [0, -7]}: DynamicPointSymbolParams = {}) {
        super({offset, onRender});
    }

    protected _getFeatureNode(feature: Feature): HTMLElement {
        let balloonFeature = <Balloon>feature;

        let node = document.createElement('div');
        node.className = 'sGis-balloon';

        let container = document.createElement('div');
        if (balloonFeature.content) container.appendChild(balloonFeature.content);

        node.appendChild(container);

        let mapNode = <any>node as MapHtmlElement;
        mapNode.doNotBubbleToMap = true;

        return node;
    }
}