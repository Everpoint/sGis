import {StaticImageRender, StaticImageRenderParams} from "./StaticImageRender";
import {Bbox} from "../Bbox";
import {Coordinates} from "../baseTypes";
import {Point} from "../Point";

export interface HtmlImageRenderParams extends StaticImageRenderParams {
    bbox: Bbox,
    onDisplayed?: () => void,
    onRemoved?: () => void,
}

export class StaticHtmlImageRender extends StaticImageRender {
    node: HTMLImageElement;
    bbox: Bbox;

    onDisplayed?: () => void;
    onRemoved?: () => void;

    constructor({src, bbox, width, height, opacity, onLoad, onDisplayed = undefined, onRemoved = undefined}: HtmlImageRenderParams) {
        super({src, width, height, opacity, onLoad});
        this.bbox = bbox;
        this.onDisplayed = onDisplayed;
        this.onRemoved = onRemoved;
    }

    contains(position: Coordinates): boolean {
        let resolution = this.bbox.width / this.width;
        return this.bbox.contains(new Point([position[0] * resolution, -position[1] * resolution], this.bbox.crs));
    }
}