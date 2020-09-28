import {VectorRender} from "./Render";
import {contains} from "../geotools";
import {Coordinates, Shadow} from "../baseTypes";

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
    /** @see [[PolyRender.shadow]] */
    shadow?: Shadow
    /** @see [[PolyRender.lineCap]] */
    lineCap?: "butt" | "round" | "square";
    /** @see [[PolyRender.lineJoin]] */
    lineJoin?: "bevel" | "miter" | "round";
    /** @see [[PolyRender.miterLimit]] */
    miterLimit?: number;
    /** @see [[PolyRender.angle]] */
    angle?: number;
}

/**
 * Rendered polygon
 * @alias sGis.render.Poly
 */
export class PolyRender extends VectorRender implements PolyRenderConstructorParams {
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

    /** Drop shadow of the polygon {offsetX, offsetY, blur, color}. */
    shadow?: Shadow = null;
    /** 
     * Property of the Canvas 2D API determines the shape used to draw the end points of lines.  
     *
     * - `"butt"`
     *      The ends of lines are squared off at the endpoints.
     * - `"round"`
     *      The ends of lines are rounded.
     * - `"square"`
     *      The ends of lines are squared off by adding a box with an equal width and half the height of the line's thickness.
     */
    lineCap: "butt" | "round" | "square" = "round";

    /** 
     * Property of the Canvas 2D API determines the shape used to join two line segments where they meet.  
     *
     * - `"bevel"`
     *      Fills an additional triangular area between the common endpoint of connected segments, and the separate outside rectangular corners of each segment.
     * - `"round"`
     *      Rounds off the corners of a shape by filling an additional sector of disc centered at the common endpoint of connected segments. The radius for these rounded corners is equal to the line width.
     * - `"miter"`
     *      Connected segments are joined by extending their outside edges to connect at a single point, with the effect of filling an additional lozenge-shaped area. This setting is affected by the miterLimit property
     */
    lineJoin: "bevel" | "miter" | "round" = "round";

    /**
     * Property of the Canvas 2D API sets the miter limit ratio.  
     * @docs https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/miterLimit  
     */
    miterLimit: number = 10;

    /**
     * Clockwise rotation of the Poly in radians.
     */
    angle: number = 0;

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
