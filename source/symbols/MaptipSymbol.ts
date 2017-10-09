import {setStyleNode} from "../utils/utils";
import {HtmlElement} from "../renders/HtmlElement";
import {Symbol} from "./Symbol";

/**
 * Balloon over a map with html content.
 * @alias sGis.symbol.maptip.Simple
 * @extends sGis.Symbol
 */
export class MaptipSymbol extends Symbol {
    /**
     * @constructor
     * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);
    }

    renderFunction(feature, resolution, crs) {
        let position = feature.point.projectTo(crs).position;
        let pxPosition = [position[0]/resolution, position[1]/resolution];
        let render = new HtmlElement(`<div class="sGis-maptip-outerContainer"><div class="sGis-maptip-innerContainer">${feature.content}</div></div>`, pxPosition);

        return [render];
    }
}

setStyleNode(`

    .sGis-maptip-outerContainer {
        transform: translate(-50%, -100%);
    }
    
    .sGis-maptip-innerContainer {
        background-color: white;
        transform: translate(0, -16px);
        padding: 8px;
        border-radius: 5px;
        position: relative;
        box-shadow: 0 0 6px #B2B2B2;
    }
    
    .sGis-maptip-innerContainer:after {
        content: ' ';
        position: absolute;
        display: block;
        background: white;
        top: 100%;
        left: 50%;
        height: 20px;
        width: 20px;
        transform: translate(-50%, -10px) rotate(45deg);
        box-shadow: 2px 2px 2px 0 rgba( 178, 178, 178, .4 );
    }

`);
