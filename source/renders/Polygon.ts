import {IRender} from "../interfaces/IRender";
import {contains} from "../geotools";
import {Coordinates} from "../baseTypes";

export enum FillStyle {
    Color,
    Image
}

export interface PolygonRenderConstructorParams {
    /** @see PolylineRender.fillStyle */
    fillStyle?: FillStyle
    /** @see PolylineRender.strokeColor */
    strokeColor?: string,
    /** @see PolylineRender.strokeWidth */
    strokeWidth?: number,
    /** @see PolylineRender.fillColor */
    fillColor?: string,
    /** @see PolylineRender.ignoreEvents */
    ignoreEvents?: boolean,
    /** @see PolylineRender.lineContainsTolerance */
    lineContainsTolerance?: number,
    /** @see PolylineRender.lineDash */
    lineDash?: number[],
    /** @see PolylineRender.fillImage */
    fillImage?: HTMLImageElement
}

/**
 * Rendered polygon
 * @alias sGis.render.Polygon
 */
export class PolygonRender implements IRender {
    coordinates: Coordinates[][];

    /** Fill style of the polygon. */
    fillStyle: FillStyle = FillStyle.Color;

    /** Stroke color of the polygon. Can be any valid css color string. */
    strokeColor: string = 'black';

    /** Fill color of the polygon. Can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Stroke width of the polyline. */
    strokeWidth: number = 1;

    /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /** The distance (px) from the drawn line inside which the event is still considered to be inside the line. */
    lineContainsTolerance: number = 4;

    /** Dash pattern for the line as specified in HTML CanvasRenderingContext2D.setLineDash() specification. */
    lineDash: number[] = [];

    /** Fill image of the polygon */
    fillImage: HTMLImageElement = null;

    /**
     * @param coordinates - the coordinates of the polygon.
     * @param options - properties to be assigned to the instance
     */
    constructor(coordinates, options: PolygonRenderConstructorParams = {}) {
        Object.assign(this, options);
        this.coordinates = coordinates;
    }

    get isVector() { return true; }

    contains(position: Coordinates): boolean | [number, number] {
        return contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
    }
}
