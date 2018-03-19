import {Symbol} from "../Symbol";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {HorizontalAlignment, VectorLabel, VerticalAlignment} from "../../renders/VectorLabel";
import {Coordinates, Offset} from "../../baseTypes";
import {LabelFeature} from "../../features/Label";

export interface StaticLabelSymbolParams {
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    offset?: Offset;

    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;
}

/**
 * @example symbols/Label_Symbols
 */
export class StaticLabelSymbol extends Symbol<LabelFeature> {
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;

    strokeColor?: string;
    strokeWidth?: number;
    fillColor?: string;

    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
    isFilled: boolean;
    offset: Offset;

    constructor({
        fontSize,
        fontFamily,
        fontStyle,
        horizontalAlignment,
        verticalAlignment,
        offset = [5, 0],
        strokeColor,
        strokeWidth,
        fillColor
    }: StaticLabelSymbolParams = {}) {
        super();

        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.fontStyle = fontStyle;
        this.horizontalAlignment = horizontalAlignment;
        this.verticalAlignment = verticalAlignment;
        this.offset = offset;
        this.strokeColor = strokeColor;
        this.strokeWidth = strokeWidth;
        this.fillColor = fillColor;
    }

    renderFunction(feature: LabelFeature, resolution: number, crs: Crs): Render[] {
        if (!feature.crs.canProjectTo(crs)) return [];

        let position = feature.projectTo(crs).position;
        let pxPosition: Coordinates = [position[0] / resolution + (this.offset[0] || 0), - position[1] / resolution + (this.offset[1] || 0)];

        return [new VectorLabel({
            position: pxPosition,
            text: feature.content,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontStyle: this.fontStyle,
            verticalAlignment: this.verticalAlignment,
            horizontalAlignment: this.horizontalAlignment,
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth
        })];
    }
}