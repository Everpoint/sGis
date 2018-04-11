import {DynamicPointSymbol} from './Symbol';
import {setCssClasses} from '../utils/utils';
import {Offset} from "../baseTypes";
import {FeatureGroup} from "../features/FeatureGroup";

const DEFAULT_CLASS_NAME = 'sGis-dynamicCluster';
const DEFAULT_STYLE = `
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
    border-radius: 50%;
    box-sizing: border-box;
`;
setCssClasses({[DEFAULT_CLASS_NAME]: DEFAULT_STYLE});

export interface DynamicClusterSymbolParams {
    cssClassName?: string;
    font?: string;
    outlineWidth?: number;
    size?: number;
    fill?: string;
    borderWidth?: number;
    borderColor?: string;
    offset?: Offset;
}

export class ClusterSymbol extends DynamicPointSymbol {
    cssClassName: string;
    font: string;
    outlineWidth: number;
    size: number;
    fill: string;
    borderWidth: number;
    borderColor: string;

    constructor(
        {
            cssClassName = DEFAULT_CLASS_NAME,
            font = '13px Times New Roman, sans-serif',
            outlineWidth = 2,
            size = 44 - outlineWidth,
            fill = '#fff',
            borderWidth = 6,
            borderColor = '#89CCF1',
            offset = [-size / 2, -size / 2],
        }: DynamicClusterSymbolParams = {},
    ) {
        super({offset});

        this.cssClassName = cssClassName;
        this.font = font;
        this.size = size;
        this.outlineWidth = outlineWidth;
        this.fill = fill;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }

    protected _getFeatureNode(feature: FeatureGroup): HTMLElement {
        const node = document.createElement('div');
        const size = this.size;

        if (this.cssClassName) node.className = this.cssClassName;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.backgroundColor = this.fill;
        node.style.border = `${this.borderWidth}px solid ${this.borderColor}`;
        node.style.font = this.font;
        if(this.outlineWidth) node.style.boxShadow = `0 0 0 ${this.outlineWidth}px ${this.fill},
            0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
        node.innerText = feature._features.length.toString();

        return node;
    }
}