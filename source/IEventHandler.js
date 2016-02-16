'use strict';

(function() {

    /**
     * Provides methods for handling events.
     * @mixin
     */
    sGis.IEventHandler = {
        /**
         * Triggers event with the given parameters. It is supposed to be used to transfer event from one object to another (for example, from layer to a feature).
         * @param {Object} sGisEvent - event object of the original event
         */
        forwardEvent: function(sGisEvent) {
            if (this._prohibitedEvents && this._prohibitedEvents.indexOf(sGisEvent.eventType) !== -1) return;
            var eventType = sGisEvent.eventType;
            if (this._eventHandlers && this._eventHandlers[eventType]) {
                var handlerList = utils.copyArray(this._eventHandlers[eventType]); //This is needed in case one of the handlers is deleted in the process of handling
                for (var i = 0, len = handlerList.length; i < len; i++) {
                    if (handlerList[i].oneTime) {
                        var currentIndex = this._eventHandlers[eventType].indexOf(handlerList[i]);
                        this._eventHandlers[eventType].splice(currentIndex, 1);
                    }
                    handlerList[i].handler.call(this, sGisEvent);
                    if (sGisEvent._cancelPropagation) break;
                }
            }

            if (sGisEvent._cancelDefault) {
                if (sGisEvent.browserEvent) {
                    sGisEvent.browserEvent.preventDefault();
                }
                return;
            }

            if (this._defaultHandlers && this._defaultHandlers[eventType] !== undefined) {
                this._defaultHandlers[eventType].call(this, sGisEvent);
            }
        },

        /**
         * Triggers the event of the given type. Each handler will be triggered one by one in the order they were added.
         * @param {String} eventType - exact name of the event to be triggered.
         * @param {Object} [parameters] - parameters to be transferred to the event object.
         */
        fire: function(eventType, parameters) {
            if (this._prohibitedEvents && this._prohibitedEvents.indexOf(eventType) !== -1) return;

            var sGisEvent = {};
            if (parameters) utils.mixin(sGisEvent, parameters);

            var types = getTypes(eventType);
            if (types.length !== 1) utils.error('Exactly on type of event can be fired at a time, but ' + types.length + ' is given');

            sGisEvent.sourceObject = this;
            sGisEvent.eventType = types[0];
            sGisEvent.stopPropagation = function() {sGisEvent._cancelPropagation = true;};
            sGisEvent.preventDefault = function() {sGisEvent._cancelDefault = true;};
            sGisEvent.isCanceled = function() { return sGisEvent._cancelPropagation === true; };

            this.forwardEvent(sGisEvent);
        },

        /**
         * Sets a listener for the given event type.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either..
         * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
         */
        addListener: function(description, handler) {
            if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
            if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

            var types = getTypes(description);
            if (types.length < 1) utils.error('No event type is specified');

            var namespaces = getNamespaces(description);

            if (!this._eventHandlers) this._setHandlerList();

            for (var i = 0; i < types.length; i++) {
                if (!this._eventHandlers[types[i]]) this._eventHandlers[types[i]] = [];
                this._eventHandlers[types[i]].push({handler: handler, namespaces: namespaces});
            }
        },

        /**
         * Sets a one time handler for the given event. This handler is removed from the list of handlers just before it is called.
         * @param {String} description - description of the event. Can contain <s>ONLY ONE EVENT TYPE</s> and any number of namespaces (namespaces start with .).
         * @param {Function} handler - handler to be executed. The handler is called in the event source object context.
         */
        once: function(description, handler) {
            if (!(handler instanceof Function)) utils.error('Function is expected but got ' + handler + ' instead');
            if (!utils.isString(description)) utils.error('String is expected but got ' + description + ' instead');

            var types = getTypes(description);
            if (types.length !== 1) utils.error('Only one event type can be specified with .once() method');
            var namespaces = getNamespaces(description);

            if (!this._eventHandlers) this._setHandlerList();
            if (!this._eventHandlers[types[0]]) this._eventHandlers[types[0]] = [];
            this._eventHandlers[types[0]].push({handler: handler, namespaces: namespaces, oneTime: true});
        },

        /**
         * Removes the given handlers from the event listener list.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces, but must have at least one of either.
         * @param {Function} [handler] - handler to be removed. If no handler is specified, all handlers from the given namespaces will be removed. If no handler and namespace are specified, error will be thrown.
         */
        removeListener: function(description, handler) {
            if (!utils.isString(description)) utils.error('Expected the name of the event and handler function, but got (' + description + ', ' + handler + ') instead');

            var types = getTypes(description);
            var namespaces = getNamespaces(description);

            if (namespaces.length === 0) {
                if (types.length === 0) utils.error('At least one event type or namespace must be specified');
                if (!handler) utils.error('To remove all listeners of the given type use the .removeAllListeners() method');
            }

            if (!this._eventHandlers) return;
            if (types.length === 0) types = Object.keys(this._eventHandlers);

            for (var i = 0; i < types.length; i++) {
                if (this._eventHandlers[types[i]]) {
                    for (var j = this._eventHandlers[types[i]].length-1; j >=0; j--) {
                        if ((namespaces === null || namespaces.length === 0 || utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) &&
                            (!handler || this._eventHandlers[types[i]][j].handler === handler)) {
                            this._eventHandlers[types[i]].splice(j, 1);
                        }
                    }
                }
            }
        },

        /**
         * Sets the given handlers for the events.
         * @param {Object} handlers - handlers list in format { eventDescription : handlerFunction, ... }
         */
        addListeners: function(handlers) {
            var types = Object.keys(handlers);
            for (var i = 0; i < types.length; i++) {
                this.addListener(types[i], handlers[types[i]]);
            }
        },

        /**
         * Prohibits triggering of the event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work.
         * @param {String} type - name of the event to be prohibited.
         */
        prohibitEvent: function(type) {
            if (!this._prohibitedEvents) this._prohibitedEvents = [];
            this._prohibitedEvents.push(type);
        },

        /**
         * Allows a previously prohibited event. The prohibitions are stacked - if the same event is prohibited N times, you need to allow it N times to make it work. If no prohibitions were set for the event, the operation is ignored.
         * @param {String} type - name of the event to be allowed.
         */
        allowEvent: function(type) {
            if (!this._prohibitedEvents) return;
            var index = this._prohibitedEvents.indexOf(type);
            if (index !== -1) this._prohibitedEvents.splice(index, 1);
        },

        /**
         * Checks if the object has the handler for the given event type.
         * @param {String} type - name of the event.
         * @param {Function} handler - handler to be checked
         * @returns {boolean}
         */
        hasListener: function(type, handler) {
            if (!utils.isString(type) || !utils.isFunction(handler)) utils.error('Expected the name of the event and handler function, but got (' + type + ', ' + handler + ') instead');

            if (this._eventHandlers && this._eventHandlers[type]) {
                for (var i = 0; i < this._eventHandlers[type].length; i++) {
                    if (this._eventHandlers[type][i].handler === handler) return true;
                }
            }

            return false;
        },

        /**
         * Checks if the object has any handlers corresponding to the following description.
         * @param {String} description - description of the event. Can contain any number of type names and namespaces (namespaces start with .), but must have at least one of either.
         * @returns {boolean} - true if the object has at least one handler of the given types with the given namespaces. If no event type is given, checks if there are any handlers in the given namespaces exist. If no namespace is given, the namespace check is ignored.
         */
        hasListeners: function(description) {
            if (!utils.isString(description)) utils.error('Expected the name of the event, but got ' + description + ' instead');
            if (!this._eventHandlers) return false;

            var types = getTypes(description);
            var namespaces = getNamespaces(description);

            if (types.length === 0) types = Object.keys(this._eventHandlers);

            for (var i = 0; i < types.length; i++) {
                if (this._eventHandlers[types[i]] && this._eventHandlers[types[i]].length > 0) {
                    if (namespaces.length > 0) {
                        for (var j = 0; j < this._eventHandlers[types[i]].length; j++) {
                            if (utils.arrayIntersect(this._eventHandlers[types[i]][j].namespaces, namespaces)) {
                                return true;
                            }
                        }
                    } else {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Returns the list of the event handler description in format { handler: Func, namespaces: ['.ns1, ...], oneTime: ifTheHandlerOneTimeHandler }.
         * @param {String} type - name of the event.
         * @returns {Array}
         */
        getHandlers: function(type) {
            if (!utils.isString(type)) utils.error('Expected the name of the e*vent, but got ' + type + ' instead');
            if (this._eventHandlers && this._eventHandlers[type]) {
                return utils.copyObject(this._eventHandlers[type]);
            }
            return [];
        },

        /**
         * Removes all event listeners from the object.
         */
        removeAllListeners: function() {
            delete this._eventHandlers;
        },

        _setHandlerList: function() {
            Object.defineProperty(this, '_eventHandlers', { value: {}, configurable: true });
        }
    };

    /**
     * @alias sGis.IEventHandler.prototype.addListener
     */
    sGis.IEventHandler.on = sGis.IEventHandler.addListener;

    /**
     * @alias sGis.IEventHandler.prototype.removeListener
     */
    sGis.IEventHandler.off = sGis.IEventHandler.removeListener;


    // Deprecated names
    sGis.IEventHandler.addListner = sGis.IEventHandler.addListener;
    sGis.IEventHandler.addListners = sGis.IEventHandler.addListeners;
    sGis.IEventHandler.removeListner = sGis.IEventHandler.removeListener;
    sGis.IEventHandler.hasListner = sGis.IEventHandler.hasListener;
    sGis.IEventHandler.hasListners = sGis.IEventHandler.hasListeners;


    function getTypes(string) {
        return string.replace(/\.[A-Za-z0-9_-]+/g, '').match(/[A-Za-z0-9_-]+/g) || [];
    }

    function getNamespaces(string) {
        return string.match(/\.[A-Za-z0-9_-]+/g) || [];
    }

})();