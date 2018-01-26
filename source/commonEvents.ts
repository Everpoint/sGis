import {Point} from "./Point";
import {EventHandler, sGisEvent} from "./EventHandler";
import {Offset} from "./baseTypes";

export enum MouseEventFlags {
    None = 0,
    MouseDown = 1 << 1,
    MouseUp = 1 << 2,
    MouseClick = 1 << 3,
    MouseMove = 1 << 4,
    MouseOver = 1 << 5,
    MouseOut = 1 << 6,
    DoubleClick = 1 << 7,
    DragStart = 1 << 8,
    Drag = 1 << 9,
    DragEnd = 1 << 10,
}

export interface sGisMouseEventParams {
    point: Point,
    browserEvent: MouseEvent,
    contourIndex?: number | null,
    pointIndex?: number | null
}

export abstract class sGisMouseEvent extends sGisEvent {
    abstract readonly eventFlag: MouseEventFlags;

    readonly point: Point;
    readonly browserEvent: MouseEvent;
    contourIndex: number | null;
    pointIndex: number | null;

    constructor(eventType: string, {point, browserEvent, contourIndex = null, pointIndex = null}: sGisMouseEventParams) {
        super(eventType);
        this.point = point;
        this.browserEvent = browserEvent;
        this.contourIndex = contourIndex;
        this.pointIndex = pointIndex;
    }
}

export class sGisClickEvent extends sGisMouseEvent {
    static type: string = 'click';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.MouseClick;

    constructor(params: sGisMouseEventParams) {
        super(sGisClickEvent.type, params);
    }
}

export class sGisDoubleClickEvent extends sGisMouseEvent {
    static type: string = 'dblclick';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.DoubleClick;

    constructor(params: sGisMouseEventParams) {
        super(sGisDoubleClickEvent.type, params);
    }
}

export class sGisMouseMoveEvent extends sGisMouseEvent {
    static type: string = 'mousemove';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.MouseMove;

    constructor(params: sGisMouseEventParams) {
        super(sGisMouseMoveEvent.type, params);
    }
}

export class sGisMouseOutEvent extends sGisMouseEvent {
    static type: string = 'mouseout';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.MouseOut;

    constructor(params: sGisMouseEventParams) {
        super(sGisMouseOutEvent.type, params);
    }
}

export class sGisMouseOverEvent extends sGisMouseEvent {
    static type: string = 'mouseover';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.MouseOver;

    constructor(params: sGisMouseEventParams) {
        super(sGisMouseOverEvent.type, params);
    }
}

export class DragStartEvent extends sGisMouseEvent {
    static type: string = 'dragStart';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.DragStart;

    draggingObject: EventHandler;

    constructor(draggingObject: EventHandler, params: sGisMouseEventParams) {
        super(DragStartEvent.type, params);
        this.draggingObject = draggingObject;
    }
}

export interface DragEventParams extends sGisMouseEventParams {
    offset: Offset,
    pxOffset: Offset
}

export class DragEvent extends sGisMouseEvent {
    static type: string = 'drag';

    readonly eventFlag: MouseEventFlags = MouseEventFlags.Drag;
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

    readonly eventFlag: MouseEventFlags = MouseEventFlags.DragEnd;

    constructor(params: sGisMouseEventParams) {
        super(DragEndEvent.type, params);
    }
}