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
    font?: string;
    outlineWidth?: number;
    size?: number;
    fillColor?: string;
    fontColor?: string;
    borderWidth?: number;
    borderColor?: string;
    offset?: Offset;
}

export class ClusterSymbol extends DynamicPointSymbol {
    font: string;
    outlineWidth: number;
    size: number;
    fillColor: string;
    fontColor: string;
    borderWidth: number;
    borderColor: string;

    constructor(
        {
            font = '13px Times New Roman, sans-serif',
            outlineWidth = 2,
            size = 44,
            fillColor = '#fff',
            fontColor = '#000',
            borderWidth = 6,
            borderColor = '#89CCF1',
            offset = [-size / 2, -size / 2],
        }: DynamicClusterSymbolParams = {},
    ) {
        super({offset});

        this.font = font;
        this.size = size;
        this.outlineWidth = outlineWidth;
        this.fillColor = fillColor;
        this.fontColor = fontColor;
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }

    protected _getFeatureNode(feature: FeatureGroup): HTMLElement {
        const node = document.createElement('div');
        const size = this.size - this.outlineWidth * 2;

        node.className = DEFAULT_CLASS_NAME;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.color = this.fontColor;
        node.style.backgroundColor = this.fillColor;
        node.style.border = `${this.borderWidth}px solid ${this.borderColor}`;
        node.style.font = this.font;
        node.style.boxShadow = `0 0 0 ${this.outlineWidth}px ${this.fillColor},
            0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`;
        node.innerText = feature.features.length.toString();

        return node;
    }
}