import {HtmlElement} from "../renders/HtmlElement";
import {setCssClasses} from "../utils/utils";
import {Symbol} from "./Symbol";

/**
 * Symbol of simple html text label.
 * @alias sGis.symbol.label.Label
 * @extends sGis.Symbol
 */
export class LabelSymbol extends Symbol {
    /** Css class to be added to the label node. */
    css: string = 'sGis-symbol-label-center-top';

    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();
        if (properties) Object.assign(this, properties);
    }

    renderFunction(/** sGis.feature.Label */ feature, resolution, crs) {
        let html = '<div' +  (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
        let point = feature.point.projectTo(crs);
        let position = [point.x / resolution, -point.y / resolution];

        return [new HtmlElement(html, position)];
    }
}

setCssClasses({
    'sGis-symbol-label-left-top': 'transform:translate(-120%,-120%);',
    'sGis-symbol-label-left-middle': 'transform:translate(-120%,-50%);',
    'sGis-symbol-label-left-bottom': 'transform:translate(-120%,20%);',
    'sGis-symbol-label-center-top': 'transform:translate(-50%,-120%);',
    'sGis-symbol-label-center-middle': 'transform:translate(-50%,-50%);',
    'sGis-symbol-label-center-bottom': 'transform:translate(-50%,20%);',
    'sGis-symbol-label-right-top': 'transform:translate(20%,-120%);',
    'sGis-symbol-label-right-middle': 'transform:translate(20%,-50%);',
    'sGis-symbol-label-right-bottom': 'transform:translate(20%,20%);'
});
