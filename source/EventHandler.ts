import {copyArray, arrayIntersect, error} from "./utils/utils";

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

export const mouseEvents: {[key: string]: {type: string, flag: MouseEventFlags}} = {
    click: {type: 'click', flag: MouseEventFlags.MouseClick},
    doubleClick: {type: 'dblclick', flag: MouseEventFlags.DoubleClick},
    mouseDown: {type: 'mousedown', flag: MouseEventFlags.MouseDown},
    mouseUp: {type: 'mouseup', flag: MouseEventFlags.MouseUp},
    mouseOver: {type: 'mouseover', flag: MouseEventFlags.MouseOver},
    mouseOut: {type: 'mouseout', flag: MouseEventFlags.MouseOut},
    mouseMove: {type: 'mousemove', flag: MouseEventFlags.MouseMove},
    dragStart: {type: 'dragStart', flag: MouseEventFlags.DragStart},
    drag: {type: 'drag', flag: MouseEventFlags.Drag},
    dragEnd: {type: 'dragEnd', flag: MouseEventFlags.DragEnd}
};

const eventTypeFlags: {[key: string]: MouseEventFlags} = {};
Object.keys(mouseEvents).forEach(eventName => {
    eventTypeFlags[mouseEvents[eventName].type] = mouseEvents[eventName].flag;
});

/**
 * Base of all sGis library events
 */
export class sGisEvent {
    private _cancelPropagation: boolean = false;

    /**
     * Name of the event.
     */
    readonly type: string;

    /**
     * Original object that triggered the event. If the event is forwarded to another object, the original source object
     * will be set in this parameter.
     */
    sourceObject?: EventHandler;

    /**
     * @param type - name of the event
     */
    constructor(type: string) {
        this.type = type;
    }

    /**
     * Prevents any further event handlers to be called for this event.
     */
    stopPropagation(): void {
        this._cancelPropagation = true;
    }

    /**
     * Whether the .stopPropagation() method has been called for this event.
     */
    get isCanceled(): boolean { return this._cancelPropagation; }
}

/**
 * Callback method for event.
 */
export type Handler = (event: sGisEvent) => void;

type HandlerDescription = {
    handler: Handler;
    namespaces: string[];
    oneTime?: boolean;
}

/**
 * Provides methods for handling events.
 * @alias sGis.EventHandler
 */
export abstract class EventHandler {
    private _prohibitedEvents!: string[];
    private _eventHandlers!: { [eventType: string]: HandlerDescription[] };

    eventFlags!: MouseEventFlags;

    constructor() {
        // This initialization makes the properties not enumerable and guaranties a valid value is there at all times
        Object.defineProperty(this, '_eventHandlers', { value: {} });
        Object.defineProperty(this, '_prohibitedEvents', { value: [] });
        Object.defineProperty(this, 'eventFlags', { value: MouseEventFlags.None, writable: true });
    }

    /**
     * Triggers event with the given parameters. It is supposed to be used to transfer event from one object to another (for example, from layer to a feature).
     * @param event - event object of the original event
     */
    forwardEvent(event: sGisEvent): void {
        if (this._prohibitedEvents && this._prohibitedEvents.indexOf(event.type) !== -1) return;
        let eventType = event.type;
        if (this._eventHandlers && this._eventHandlers[eventType]) {
            let handlerList = copyArray(this._eventHandlers[eventType]); //This is needed in case one of the handlers is deleted in the process of handling

            for (let i = 0; i < handlerList.length; i++) {
                if (handlerList[i].oneTime) {
                    let currentIndex = this._eventHandlers[eventType].indexOf(handlerList[i]);
                    this._eventHandlers[eventType].splice(currentIndex, 1);
                }

                handlerList[i].handler.call(this, event);
                if (event.isCanceled) break;
            }
        }
    }

    /**
     * Triggers the event of the given type. Each handler will be triggered one by one in the order they were added. Returns
     * the event object, or null in case the event was not triggered (if it is prohibited).
     * @param event - event object or exact name of the event to be triggered.
     * @param parameters - [JS ONLY] parameters to be transferred to the event object. Applied only if the first argument is string.
     */
    fire(event: sGisEvent|string, parameters?: Object): sGisEvent | null {
        if (typeof event === 'string') {
            event = new sGisEvent(event);
            if (parameters) Object.assign(event, parameters);
            event.sourceObject = this;
        }

        if (this._prohibitedEvents.indexOf(event.type) !== -1) return null;
        this.forwardEvent(event);

        return event;
    }

    /**
     * Sets a listener for the given event type.
     * @param description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either..
     * @param handler - handler to be executed. The handler is called in the event source object context.
     * @param oneTime - if set to true, the event will be triggered only once.
     */
    addListener(description: string, handler: Handler, oneTime: boolean = false): void {
        let types = getTypes(description);
        let namespaces = getNamespaces(description);

        if (types.length === 0) error('No event types are specified.');
        if (!handler) error('No handler is given.');

        for (let i = 0; i < types.length; i++) {
            if (!this._eventHandlers[types[i]]) this._eventHandlers[types[i]] = [];
            this._eventHandlers[types[i]].push({ handler: handler, namespaces: namespaces, oneTime });
            if (eventTypeFlags[types[i]]) this.eventFlags = this.eventFlags | eventTypeFlags[types[i]];
        }
    }

    /**
     * Sets a one time handler for the given event. This handler is removed from the list of handlers just before it is called.
     * @param description - description of the event. Can contain <u>ONLY ONE EVENT TYPE</u> and any number of namespaces (namespaces start with .).
     * @param handler - handler to be executed. The handler is called in the event source object context.
     */
    once(description: string, handler: Handler): void {
        this.addListener(description, handler, true);
    }

    /**
     * Removes the given handlers from the event listener list.
     * @param description - description of the event. Can contain any number of type names and namespaces, but must have at least one of either.
     * @param handler - handler to be removed. If no handler is specified, all handlers from the given namespaces will be removed. If no handler and namespace are specified, error will be thrown.
     */
    removeListener(description: string, handler?: Handler): void {
        let types = getTypes(description);
        let namespaces = getNamespaces(description);

        if (types.length === 0) types = Object.keys(this._eventHandlers);

        for (let i = 0; i < types.length; i++) {
            if (this._eventHandlers[types[i]]) {
                for (let j = this._eventHandlers[types[i]].length-1; j >= 0; j--) {
                    if ((namespaces === null || namespaces.length === 0 || arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) &&
                        (!handler || this._eventHandlers[types[i]][j].handler === handler)) {
                        this._eventHandlers[types[i]].splice(j, 1);
                    }
                }
                if (this._eventHandlers[types[i]].length === 0 && eventTypeFlags[types[i]]) {
                    this.eventFlags = this.eventFlags & ~eventTypeFlags[types[i]];
                }
            }
        }
    }

    /**
     * Prohibits triggering of the event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work.
     * @param type - name of the event to be prohibited.
     */
    prohibitEvent(type: string): void {
        this._prohibitedEvents.push(type);
    }

    /**
     * Allows a previously prohibited event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work. If no prohibitions were set for the event, the operation is ignored.
     * @param type - name of the event to be allowed.
     */
    allowEvent(type: string): void {
        let index = this._prohibitedEvents.indexOf(type);
        if (index !== -1) this._prohibitedEvents.splice(index, 1);
    }

    /**
     * Checks if the object has the handler for the given event type.
     * @param type - name of the event.
     * @param handler - handler to be checked
     */
    hasListener(type: string, handler: Handler): boolean {
        if (this._eventHandlers[type]) {
            for (let i = 0; i < this._eventHandlers[type].length; i++) {
                if (this._eventHandlers[type][i].handler === handler) return true;
            }
        }

        return false;
    }

    /**
     * Checks if the object has any handlers corresponding to the following description.
     * @param description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either.
     * @returns true if the object has at least one handler of the given types with the given namespaces. If no event type is given, checks if there are any handlers in the given namespaces exist. If no namespace is given, the namespace check is ignored.
     */
    hasListeners(description: string): boolean {
        let types = getTypes(description);
        let namespaces = getNamespaces(description);

        if (types.length === 0) types = Object.keys(this._eventHandlers);

        for (let i = 0; i < types.length; i++) {
            if (this._eventHandlers[types[i]] && this._eventHandlers[types[i]].length > 0) {
                if (namespaces.length > 0) {
                    for (let j = 0; j < this._eventHandlers[types[i]].length; j++) {
                        if (arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) {
                            return true;
                        }
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Removes all event listeners from the object.
     */
    removeAllListeners(): void {
        Object.keys(this._eventHandlers).forEach(key => delete this._eventHandlers[key]);
    }

    /**
     * @see EventHandler#addListener
     */
    on(description: string, handler: Handler, oneTime: boolean = false) { this.addListener.apply(this, arguments); }

    /**
     * @see EventHandler#removeListener
     */
    off(description: string, handler?: Handler) { this.removeListener.apply(this, arguments); }
}

function getTypes(string: string): string[] {
    return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
}

function getNamespaces(string: string): string[] {
    return string.match(/\.[A-Za-z0-9_-]+/g) || [];
}
