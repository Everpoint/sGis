import {HtmlElement} from "../renders/HtmlElement";
import {setCssClasses} from "../utils/utils";
import {Symbol} from "./Symbol";
import {Feature} from "../features/Feature";
import {Crs} from "../Crs";
import {IRender} from "../interfaces/IRender";
import {Label} from "../features/Label";

export interface LabelSymbolConstructorParams {
    /** @see [[LabelSymbol.css]] */
    css?: string
}

/**
 * Symbol of simple html text label.
 * @alias sGis.symbol.label.Label
 */
export class LabelSymbol extends Symbol {
    /** Css class to be added to the label node. */
    css: string = 'sGis-symbol-label-center-top';

    /**
     * @param options - key-value list of the properties to be assigned to the instance.
     */
    constructor(options: LabelSymbolConstructorParams = {}) {
        super();
        Object.assign(this, options);
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[] {
        if (!(feature instanceof Label)) return [];

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
