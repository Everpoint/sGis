'use strict';

var Event = (function() {

    var guid = 0;

    function fixEvent(event) {
        event = event || window.event;

        if ( event.isFixed ) {
            return event;
        }
        event.isFixed = true;

        event.preventDefault = event.preventDefault || function(){this.returnValue = false;};
        event.stopPropagation = event.stopPropagation || function(){this.cancelBubble = true;};

        if (!event.target) {
            event.target = event.srcElement;
        }

        if (!event.currentTarget) {
            event.currentTarget = event.srcElement;
        }

        if (event.relatedTarget === undefined && event.fromElement) {
            event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
        }

        if ( event.pageX == null && event.clientX != null ) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if ( !event.which && event.button ) {
            event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
        }

        return event;
    }

    /* Вызывается в контексте элемента всегда this = element */
    function commonHandle(event) {
        event = fixEvent(event);

        var handlers = this.events[event.type];

        for ( var g in handlers ) {
            var handler = handlers[g];

            var ret = handler.call(this, event);
            if ( ret === false ) {
                event.preventDefault();
                event.stopPropagation();
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

    return {
        add: function(elem, type, handler) {
            if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {
                elem = window;
            }

            if (type === 'wheel') type = getWheelEventType();

            if (!handler.guid) {
                handler.guid = ++guid;
            }

            if (!elem.events) {
                elem.events = {};
                elem.handle = function(event) {
                    if (typeof Event !== "undefined") {
                        return commonHandle.call(elem, event);
                    }
                };
            }

            if (!elem.events[type]) {
                elem.events[type] = {};

                if (elem.addEventListener) {
                    elem.addEventListener(type, elem.handle, false);
                } else if (elem.attachEvent) {
                    elem.attachEvent("on" + type, elem.handle);
                }
            }

            elem.events[type][handler.guid] = handler;

            return handler;
        },

        remove: function(elem, type, handler) {
            var handlers = elem.events && elem.events[type];

            if (!handlers) return;

            if (!handler) {
                for ( var handle in handlers ) {
                    delete elem.events[type][handle];
                }
                return;
            }


            delete handlers[handler.guid];

            for(var any in handlers) return
            if (elem.removeEventListener) {
                elem.removeEventListener(type, elem.handle, false);
            } else if (elem.detachEvent) {
                elem.detachEvent("on" + type, elem.handle);
            }

            delete elem.events[type];


            for (var any in elem.events) return;
            try {
                delete elem.handle;
                delete elem.events ;
            } catch(e) { // IE
                elem.removeAttribute("handle");
                elem.removeAttribute("events");
            }
        }
    };
}());

function getWheelDirection(e) {
    var wheelData = (e.detail ? e.detail *  -1 : e.wheelDelta / 40) || (e.deltaY * -1);
    if (wheelData > 0) {
        wheelData = 1;
    } else if (wheelData < 0){
        wheelData = -1;
    }
    return wheelData;
}

function getMouseOffset(target, e) {
    var docPos = getPosition(target);
    return {x: e.pageX - docPos.x, y: e.pageY - docPos.y};
}

function getPosition(e) {
    var clientRect = e.getBoundingClientRect(),
        x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
        y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    return {x: clientRect.left + x, y: clientRect.top + y};
}