import {Point} from "./Point";
import {sGisEvent} from "./EventHandler";
import {Offset} from "./baseTypes";

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