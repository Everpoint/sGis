import {sGisEvent} from "./EventHandler";
import {Point} from "./Point";

/**
 * A pair of coordinates, usually [x, y] or [lon, lat].
 */
export type Coordinates = [number, number];

/**
 * Offset set as [dx, dy].
 */
export type Offset = [number, number];

/**
 * A set of coordinate pairs that represent a set of points (form multipoint features), a polyline or a contour of a polygon.
 */
export type Contour = Coordinates[];

/**
 * Minimum and maximum resolutions respectively at which a layer (or a set of layers) should be displayed.
 * If either value is negative (usually -1) that limit is not applied. Second value, if positive, must always be
 * greater than the first one.
 */
export type ResolutionLimits = [number, number];

/**
 * A set of coordinates that represent a rectangular area in the format [xmin, ymin, xmax, ymax].
 */
export type RectCoordinates = [number, number, number, number];

/**
 * HTML element that can be rendered to DOM or canvas as an image.
 */
export type HTMLRasterElement = HTMLImageElement | HTMLCanvasElement;


export interface sGisMouseEventParams {
    point: Point,
    browserEvent: MouseEvent
}

export class sGisMouseEvent extends sGisEvent {
    readonly point: Point;
    readonly browserEvent: MouseEvent;

    constructor(eventType: string, {point, browserEvent}: sGisMouseEventParams) {
        super(eventType);
        this.point = point;
        this.browserEvent = browserEvent;
    }
}

export class DragStartEvent extends sGisMouseEvent {
    static type: string = 'dragStart';

    constructor(params: sGisMouseEventParams) {
        super(DragStartEvent.type, params);
    }
}

export interface DragEventParams extends sGisMouseEventParams {
    offset: Offset,
    pxOffset: Offset
}

export class DragEvent extends sGisMouseEvent {
    static type: string = 'drag';

    readonly offset: Offset;
    readonly pxOffset: Offset;

    constructor({point, browserEvent, offset, pxOffset}: DragEventParams) {
        super(DragEvent.type, {point, browserEvent});
        this.offset = offset;
        this.pxOffset = pxOffset;
    }
}

export class DragEndEvent extends sGisMouseEvent {
    static type: string = 'dragEnd';

    constructor(params: sGisMouseEventParams) {
        super(DragEndEvent.type, params);
    }
}