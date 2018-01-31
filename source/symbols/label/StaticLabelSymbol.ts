import {Symbol} from "../Symbol";
import {Feature} from "../../features/Feature";
import {Crs} from "../../Crs";
import {Render} from "../../renders/Render";
import {LabelFeature} from "../../features/Label";
import {HorizontalAlignment, VectorLabel, VerticalAlignment} from "../../renders/VectorLabel";
import {Coordinates, Offset} from "../../baseTypes";

export interface StaticLabelSymbolParams {
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    isFilled?: boolean;
    offset?: Offset;
}

export class StaticLabelSymbol extends Symbol {
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
    isFilled: boolean;
    offset: Offset;

    constructor({fontSize, fontFamily, fontStyle, horizontalAlignment = HorizontalAlignment.Center, verticalAlignment = VerticalAlignment.Bottom, isFilled = true, offset = [0, 3]}: StaticLabelSymbolParams = {}) {
        super();

        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.fontStyle = fontStyle;
        this.horizontalAlignment = horizontalAlignment;
        this.verticalAlignment = verticalAlignment;
        this.isFilled = isFilled;
        this.offset = offset;
    }

    renderFunction(feature: Feature, resolution: number, crs: Crs): Render[] {
        if (!feature.crs.canProjectTo(crs) || !(feature instanceof LabelFeature)) return [];

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
            isFilled: this.isFilled
        })];
    }
}