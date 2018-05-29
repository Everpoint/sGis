import {VectorRender} from "./Render";
import {contains} from "../geotools";
import {Coordinates} from "../baseTypes";

export enum FillStyle {
    None,
    Color,
    Image
}

export interface PolyRenderConstructorParams {
    /** @see [[PolyRender.enclosed]] */
    enclosed?: boolean,
    /** @see [[PolyRender.fillStyle]] */
    fillStyle?: FillStyle
    /** @see [[PolyRender.strokeColor]] */
    strokeColor?: string,
    /** @see [[PolyRender.strokeWidth]] */
    strokeWidth?: number,
    /** @see [[PolyRender.fillColor]] */
    fillColor?: string,
    /** @see [[PolyRender.ignoreEvents]] */
    ignoreEvents?: boolean,
    /** @see [[PolyRender.lineContainsTolerance]] */
    lineContainsTolerance?: number,
    /** @see [[PolyRender.lineDash]] */
    lineDash?: number[],
    /** @see [[PolyRender.fillImage]] */
    fillImage?: HTMLImageElement
}

/**
 * Rendered polygon
 * @alias sGis.render.Poly
 */
export class PolyRender extends VectorRender {
    coordinates: Coordinates[][];

    /** Whether the first and the last points should be connected. */
    enclosed: boolean = false;

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
    constructor(coordinates, options: PolyRenderConstructorParams = {}) {
        super();

        Object.assign(this, options);
        this.coordinates = coordinates;
    }

    get isVector() { return true; }

    contains(position: Coordinates): boolean {
        let polygonContains = contains(this.coordinates, position, this.strokeWidth / 2 + this.lineContainsTolerance);
        if (this.enclosed) return !!polygonContains;
        return Array.isArray(polygonContains) && polygonContains[1] !== this.coordinates[polygonContains[0]].length - 1;
    }
}
