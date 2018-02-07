import {Coordinates} from "../baseTypes";
import {sGisMouseEvent} from "../commonEvents";
import {Bbox} from "../Bbox";
import {MouseEventFlags} from "../EventHandler";

export type IntersectionType = boolean | [number, number];

export type RenderEventHandler = (event: sGisMouseEvent) => void;

export abstract class Render {
    /**
     * Returns true if 'position' is inside the render.
     * @param position in the rendered (px) coordinates in {x: X, y: Y} format.
     */
    abstract contains(position: Coordinates): IntersectionType;

    private _listensFor: MouseEventFlags = MouseEventFlags.None;
    private _eventHandler?: RenderEventHandler = null;

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

export type UpdateMethod = (bbox: Bbox, resolution: number) => void;

export interface DynamicRenderParams {
    node: HTMLElement;
    update: UpdateMethod;
    onRender?: () => void;
}

export class DynamicRender extends Render {
    contains(position: Coordinates): IntersectionType {
        return false;
    }

    readonly node: HTMLElement;
    readonly update: UpdateMethod;
    readonly onRender?: () => void;

    constructor({node, update, onRender}: DynamicRenderParams) {
        super();

        this.node = node;
        this.update = update;
        this.onRender = onRender;
    }
}

