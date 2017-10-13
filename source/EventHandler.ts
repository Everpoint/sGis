import {copyArray, arrayIntersect, error} from "./utils/utils";

/**
 * Base of all sGis library events
 * @name sGisEvent
 * @mixin
 * @type {Object}
 * @prop {String} eventType - name of the event
 * @prop {Object} sourceObject - object that triggered the event
 * @prop {Function} stopPropagation - prevents event to be handled by any further handlers
 * @prop {Function} isCanceled - returns true if the .stopPropagation() method was called
 */

export class sGisEvent {
    private _cancelPropagation: boolean = false;

    readonly type: string;
    sourceObject: EventHandler;

    constructor(type: string, parameters?: Object) {
        this.type = type;
        if (parameters) Object.assign(this, parameters);
    }

    stopPropagation(): void {
        this._cancelPropagation = true;
    }

    get isCanceled(): boolean { return this._cancelPropagation; }
}

export type Handler = (sGisEvent) => void;

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
    private _prohibitedEvents: string[];
    private _eventHandlers: { [eventType: string]: HandlerDescription[] };

    constructor() {
        // This initialization makes the properties not enumerable and guaranties a valid value is there at all times
        Object.defineProperty(this, '_eventHandlers', { value: {} });
        Object.defineProperty(this, '_prohibitedEvents', { value: [] });
    }

    /**
     * Triggers event with the given parameters. It is supposed to be used to transfer event from one object to another (for example, from layer to a feature).
     * @param {Object} event - event object of the original event
     */
    forwardEvent(event: sGisEvent) {
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
     * Triggers the event of the given type. Each handler will be triggered one by one in the order they were added.
     * TODO: Remove string overload
     * @param event - exact name of the event to be triggered.
     * @param {Object} [parameters] - parameters to be transferred to the event object.
     * @returns {Object} - event object
     */
    fire(event: sGisEvent|string, parameters?: Object) {
        if (typeof event === 'string') {
            event = new sGisEvent(event, parameters);
        }

        if (this._prohibitedEvents.indexOf(event.type) !== -1) return null;
        this.forwardEvent(event);

        return event;
    }

    /**
     * Sets a listener for the given event type.
     * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either..
     * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
     * @param {boolean} [oneTime=false] - if set to true, the event will be triggered only once.
     */
    addListener(description: string, handler: Handler, oneTime: boolean = false): void {
        let types = getTypes(description);
        let namespaces = getNamespaces(description);

        if (types.length === 0) error('No event types are specified.');
        if (!handler) error('No handler is given.');

        for (let i = 0; i < types.length; i++) {
            if (!this._eventHandlers[types[i]]) this._eventHandlers[types[i]] = [];
            this._eventHandlers[types[i]].push({ handler: handler, namespaces: namespaces, oneTime });
        }
    }

    /**
     * Sets a one time handler for the given event. This handler is removed from the list of handlers just before it is called.
     * @param {String} description - description of the event. Can contain <u>ONLY ONE EVENT TYPE</u> and any number of namespaces (namespaces start with .).
     * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
     */
    once(description: string, handler: Handler): void {
        this.addListener(description, handler, true);
    }

    /**
     * Removes the given handlers from the event listener list.
     * @param {String} description - description of the event. Can contain any number of type names and namespaces, but must have at least one of either.
     * @param {Function} [handler] - handler to be removed. If no handler is specified, all handlers from the given namespaces will be removed. If no handler and namespace are specified, error will be thrown.
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
            }
        }
    }

    /**
     * Prohibits triggering of the event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work.
     * @param {String} type - name of the event to be prohibited.
     */
    prohibitEvent(type: string): void {
        this._prohibitedEvents.push(type);
    }

    /**
     * Allows a previously prohibited event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work. If no prohibitions were set for the event, the operation is ignored.
     * @param {String} type - name of the event to be allowed.
     */
    allowEvent(type: string): void {
        let index = this._prohibitedEvents.indexOf(type);
        if (index !== -1) this._prohibitedEvents.splice(index, 1);
    }

    /**
     * Checks if the object has the handler for the given event type.
     * @param {String} type - name of the event.
     * @param {Function} handler - handler to be checked
     * @returns {boolean}
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
     * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either.
     * @returns {boolean} - true if the object has at least one handler of the given types with the given namespaces. If no event type is given, checks if there are any handlers in the given namespaces exist. If no namespace is given, the namespace check is ignored.
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
     * @see sGis.EventHandler#addListener
     */
    on(description: string, handler: Handler, oneTime: boolean = false) { this.addListener.apply(this, arguments); }
    /**
     * @see sGis.EventHandler#removeListener
     */
    off(description: string, handler?: Handler) { this.removeListener.apply(this, arguments); }
}

function getTypes(string) {
    return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
}

function getNamespaces(/** String */ string) {
    return string.match(/\.[A-Za-z0-9_-]+/g) || [];
}
