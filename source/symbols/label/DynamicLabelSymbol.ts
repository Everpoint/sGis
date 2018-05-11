import {DynamicPointSymbol} from "../Symbol";
import {Feature} from "../../features/Feature";
import {LabelFeature} from "../../features/Label";
import {setCssClasses} from "../../utils/utils";
import {Offset} from "../../baseTypes";

const DEFAULT_CLASS_NAME = 'sGis-dynamicLabel';
const DEFAULT_STYLE = `
    transform: translate(0, -50%);
    font: 14px arial;
    color: black;
    text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white; 
`;

setCssClasses({[DEFAULT_CLASS_NAME]: DEFAULT_STYLE});

export interface DynamicLabelSymbolParams {
    cssClassName?: string;
    offset?: Offset;
}

/**
 * @example symbols/Label_Symbols
 */
export class DynamicLabelSymbol extends DynamicPointSymbol {
    cssClassName: string;

    constructor({cssClassName = DEFAULT_CLASS_NAME, offset}: DynamicLabelSymbolParams = {}) {
        super({offset});

        this.cssClassName = cssClassName;
    }

    protected _getFeatureNode(feature: Feature): HTMLElement {
        let labelFeature = <LabelFeature>feature;

        let node = document.createElement('span');
        node.innerText = labelFeature.content;
        if (this.cssClassName) node.className = this.cssClassName;

        return node;
    }

    protected _updateFeatureNode(feature: LabelFeature): void {
        let node = this.getNode(feature);
        node.innerText = feature.content;
    }
}