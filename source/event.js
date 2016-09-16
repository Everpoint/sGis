sGis.module('event', [], function() {
    
    'use strict';

    let id = 0;

    let ev = {
        add: function (element, type, handler) {
            if (type === 'wheel') type = getWheelEventType();
            if (!handler.guid) handler.guid = ++id;

            if (!element.events) {
                element.events = {};
                element.handle = event => {
                    return commonHandle.call(element, event);
                };
            }

            if (!element.events[type]) {
                element.events[type] = {};

                if (element.addEventListener) {
                    element.addEventListener(type, element.handle, false);
                } else if (element.attachEvent) {
                    element.attachEvent("on" + type, element.handle);
                }
            }

            element.events[type][handler.guid] = handler;

            return handler;
        },

        remove: function (element, type, handler) {
            var handlers = element.events && element.events[type];
            if (!handlers) return;

            if (!handler) {
                Object.keys(handlers).forEach(key => {
                    delete handlers[key];
                });
            } else {
                delete handlers[handler.guid];
            }

            if (Object.keys(handlers).length > 0) return;

            if (element.removeEventListener) {
                element.removeEventListener(type, element.handle, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, element.handle);
            }

            delete element.events[type];

            if (Object.keys(element.events).length > 0) return;

            try {
                delete element.handle;
                delete element.events;
            } catch (e) { // IE
                element.removeAttribute("handle");
                element.removeAttribute("events");
            }
        }
    };

    function fixEvent(event) {
        event = event || window.event;

        if (event.isFixed) {
            return event;
        }
        event.isFixed = true;

        event.preventDefault = event.preventDefault || function () {
                this.returnValue = false;
            };
        event.stopPropagation = event.stopPropagation || function () {
                this.cancelBubble = true;
            };

        if (!event.target) {
            event.target = event.srcElement;
        }

        if (!event.currentTarget) {
            event.currentTarget = event.srcElement;
        }

        if (event.relatedTarget === undefined && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }

        if (event.pageX == null && event.clientX != null) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if (!event.which && event.button) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }

        return event;
    }

    function commonHandle(event) {
        event = fixEvent(event);

        var handlers = this.events[event.type];
        let keys = Object.keys(handlers);
        for (let i = 0; i < keys.length; i++) {
            let ret = handlers[keys[i]].call(this, event);
            if (ret === false) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
    }

    function getWheelEventType() {
        if (document.addEventListener) {
            if ('onwheel' in document) {
                return 'wheel';
            } else if ('onmousewheel' in document) {
                return 'mousewheel';
            } else {
                return 'MozMousePixelScroll';
            }
        }
    }


    ev.getWheelDirection = function (e) {
        var wheelData = (e.detail ? e.detail * -1 : e.wheelDelta / 40) || (e.deltaY * -1);
        if (wheelData > 0) {
            wheelData = 1;
        } else if (wheelData < 0) {
            wheelData = -1;
        }
        return wheelData;
    };

    ev.getMouseOffset = function (target, e) {
        var docPos = ev.getPosition(target);
        return {x: e.pageX - docPos.x, y: e.pageY - docPos.y};
    };

    ev.getPosition = function (e) {
        var clientRect = e.getBoundingClientRect(),
            x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return {x: clientRect.left + x, y: clientRect.top + y};
    };

    return ev;
});