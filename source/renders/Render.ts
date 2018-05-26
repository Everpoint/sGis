import {Coordinates} from "../baseTypes";
import {sGisMouseEvent} from "../commonEvents";
import {Bbox} from "../Bbox";
import {MouseEventFlags} from "../EventHandler";
import {Feature} from "../features/Feature";

export type RenderEventHandler = (event: sGisMouseEvent) => void;

export abstract class Render {
    /**
     * Returns true if 'position' is inside the render.
     * @param position in the rendered (px) coordinates in {x: X, y: Y} format.
     */
    abstract contains(position: Coordinates): boolean;

    private _listensFor: MouseEventFlags = MouseEventFlags.None;
    private _eventHandler?: RenderEventHandler = null;

    contourIndex: number = -1;
    pointIndex: number = -1;

    get listensFor(): MouseEventFlags { return this._listensFor; }

    triggerEvent(event: sGisMouseEvent): void {
        if (this._eventHandler) this._eventHandler(event);
    }

    listenFor(eventFlags: MouseEventFlags, handler: RenderEventHandler): void {
        this._eventHandler = handler;
        this._listensFor = eventFlags;
    }
}

export abstract class StaticRender extends Render {
}

export abstract class VectorRender extends StaticRender {
}

export type UpdateMethod = (bbox?: Bbox, resolution?: number) => void;
export type RedrawMethod = (feature: Feature) => void;

export interface DynamicRenderParams {
    node: HTMLElement;
    update: UpdateMethod;
    redraw: RedrawMethod;
    onRender?: () => void;
}

export class DynamicRender extends Render {
    contains(position: Coordinates): boolean {
        return false;
    }

    readonly node: HTMLElement;
    readonly update: UpdateMethod;
    readonly redraw: RedrawMethod;
    readonly onRender?: () => void;

    constructor({node, update, redraw, onRender}: DynamicRenderParams) {
        super();

        this.node = node;
        this.update = update;
        this.onRender = onRender;
        this.redraw = redraw;
    }
}

