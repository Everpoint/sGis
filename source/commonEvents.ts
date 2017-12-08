import {Point} from "./Point";
import {EventHandler, sGisEvent} from "./EventHandler";
import {Offset} from "./baseTypes";

export interface sGisMouseEventParams {
    point: Point,
    browserEvent: MouseEvent,
    contourIndex?: number | null,
    pointIndex?: number | null
}

export class sGisMouseEvent extends sGisEvent {
    readonly point: Point;
    readonly browserEvent: MouseEvent;
    readonly contourIndex: number | null;
    readonly pointIndex: number | null;

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

    constructor(params: sGisMouseEventParams) {
        super(sGisClickEvent.type, params);
    }
}

export class sGisDoubleClickEvent extends sGisMouseEvent {
    static type: string = 'dblclick';

    constructor(params: sGisMouseEventParams) {
        super(sGisDoubleClickEvent.type, params);
    }
}

export class sGisMouseMoveEvent extends sGisMouseEvent {
    static type: string = 'mousemove';

    constructor(params: sGisMouseEventParams) {
        super(sGisMouseMoveEvent.type, params);
    }
}

export class sGisMouseOutEvent extends sGisMouseEvent {
    static type: string = 'mouseout';

    constructor(params: sGisMouseMoveEvent) {
        super(sGisMouseOutEvent.type, params);
    }
}

export class DragStartEvent extends sGisMouseEvent {
    static type: string = 'dragStart';

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