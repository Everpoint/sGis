import {DynamicPointSymbol} from "../Symbol";
import {Feature} from "../../features/Feature";
import {LabelFeature} from "../../features/Label";
import {setCssClasses} from "../../utils/utils";

const DEFAULT_CLASS_NAME = 'sGis-dynamicLabel';
const DEFAULT_STYLE = `
    transform: translate(-50%, 100%);
    font: 14px arial;
`;

setCssClasses({[DEFAULT_CLASS_NAME]: DEFAULT_STYLE});

export interface DynamicLabelSymbolParams {
    cssClassName?: string;
}

export class DynamicLabelSymbol extends DynamicPointSymbol {
    cssClassName: string;

    constructor({cssClassName = DEFAULT_CLASS_NAME}: DynamicLabelSymbolParams = {}) {
        super();

        this.cssClassName = cssClassName;
    }

    protected _getFeatureNode(feature: Feature): HTMLElement {
        let labelFeature = <LabelFeature>feature;

        let node = document.createElement('span');
        node.innerText = labelFeature.content;
        if (this.cssClassName) node.className = this.cssClassName;

        return node;
    }
}