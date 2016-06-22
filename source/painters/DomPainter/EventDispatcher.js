sGis.module('painter.domPainter.EventDispatcher', [
    'Event',
    'utils'
], (Event, utils) => {

    'use strict';

    const MIN_WHEEL_DELAY = 50;

    var defaults = {
        objectEvents: ['click', 'dblclick', 'dragStart', 'mousemove']
    };
    
    class EventDispatcher {
        constructor(baseNode, master) {
            this._master = master;
            this._setListeners(baseNode);

            this._onDocumentMousemove = this._onDocumentMousemove.bind(this);
            this._onDocumentMouseup = this._onDocumentMouseup.bind(this);

            this._wheelTimer = 0;
        }
        
        _dispatchEvent(name, data) {
            
            
            return this._master.map.fire(name, data);
        }

        _setListeners(baseNode) {
            Event.add(baseNode, 'mousedown', this._onmousedown.bind(this));
            Event.add(baseNode, 'wheel', this._onwheel.bind(this));
            Event.add(baseNode, 'click', this._onclick.bind(this));
            // Event.add(baseNode, 'touchstart', ontouchstart);
            // Event.add(baseNode, 'touchmove', ontouchmove);
            // Event.add(baseNode, 'touchend', ontouchend);
            // Event.add(baseNode, 'dblclick', ondblclick);
            // Event.add(baseNode, 'mousemove', onmousemove);
            // Event.add(baseNode, 'mouseout', onmouseout);
            // Event.add(baseNode, 'contextmenu', oncontextmenu);
        }

        _onmousedown(event) {
            if (!isFormElement(event.target)) {
                this._clickCatcher = true;
                if (event.which === 1) {
                    this._dragPosition = Event.getMouseOffset(event.currentTarget, event);
                    this._activeObject = event.currentTarget.map;

                    Event.add(document, 'mousemove', this._onDocumentMousemove);
                    Event.add(document, 'mouseup', this._onDocumentMouseup);

                    document.ondragstart = function() {return false;};
                    document.body.onselectstart = function() {return false;};
                }
                return false;
            }
        }

        _onDocumentMousemove(event) {
            var map = this._master.map;
            var mousePosition = Event.getMouseOffset(this._master.wrapper, event);
            var dxPx = this._dragPosition.x - mousePosition.x;
            var dyPx = this._dragPosition.y - mousePosition.y;
            var resolution = map.resolution;
            var point = this._master.getPointFromPxPosition(mousePosition.x, mousePosition.y);
            var position = {x: point.x / resolution, y: - point.y / resolution}; // TODO: remove this property

            if (Math.abs(dxPx) > 2 || Math.abs(dyPx) > 2 || !this._clickCatcher) {
                this._lastDrag = {x: dxPx * resolution, y: -dyPx * resolution};

                if (this._clickCatcher) {
                    this._clickCatcher = null;
                    var originalPoint = this._master.getPointFromPxPosition(this._dragPosition.x, this._dragPosition.y);
                    var originalPosition = {x: originalPoint.x / resolution, y: - originalPoint.y / resolution};
                    var sGisEvent = this._dispatchEvent('dragStart', {map: map, mouseOffset: mousePosition, position: originalPosition, point: originalPoint, ctrlKey: event.ctrlKey, offset: {xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y}, browserEvent: event});
                    this._draggingObject = sGisEvent.draggingObject || this._master.map;
                }

                this._dragPosition = mousePosition;
                this._dispatchEvent('drag', {map: map, mouseOffset: mousePosition, position: position, point: point, ctrlKey: event.ctrlKey, offset: {xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y}, browserEvent: event});
            }
        }

        _onDocumentMouseup(event) {
            this._clearDocumentListeners();
            if (this._draggingObject) this._draggingObject.fire('dragEnd', {browserEvent: event});

            this._draggingObject = null;
            this._lastDrag = null;
        }

        remove() {
            this._clearDocumentListeners();
        }

        _clearDocumentListeners() {
            Event.remove(document, 'mousemove', this._onDocumentMousemove);
            Event.remove(document, 'mouseup', this._onDocumentMouseup);
            document.ondragstart = null;
            document.body.onselectstart = null;
        }

        _onwheel(event) {
            var time = Date.now();
            if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
                this._wheelTimer = time;
                var map = this._master.map;
                var wheelDirection = Event.getWheelDirection(event);
                var mouseOffset = Event.getMouseOffset(event.currentTarget, event);

                map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
            }
            event.preventDefault();
            return false;
        }

        _onclick(event) {
            if (this._clickCatcher && !isFormElement(event.target)) {
                var map = this._master.map;
                var mouseOffset = Event.getMouseOffset(event.currentTarget, event);
                var point = this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
                var position = {x: point.x / map.resolution, y: - point.y / map.resolution};
                this._dispatchEvent('click', {map: map, mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position, browserEvent: event});
            }
        }
    }

    function onmouseout(event) {
        var map = event.currentTarget.map,
            offset = sGis.Event.getMouseOffset(event.currentTarget, event),
            point = map.getPointFromPxPosition(offset.x, offset.y);

        event.currentTarget.map.fire('mouseout', {position: offset, point: point});
    }

    function onmousemove(event) {
        var mouseOffset = sGis.Event.getMouseOffset(event.currentTarget, event);
        var map = event.currentTarget.map;
        var point = map.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
        var resolution = map.resolution;
        var position = {x: point.x / resolution, y: -point.y / resolution};
        event.currentTarget.map.fire('mousemove', {map: map, mouseOffset: mouseOffset, point: point, position: position, ctrlKey: event.ctrlKey});
    }

    var touchHandler = {scaleChanged: false};

    function ontouchstart(event) {
        if (!event.currentTarget.dragPrevPosition) event.currentTarget.dragPrevPosition = {};
        for (var i in event.changedTouches) {
            var touch = event.changedTouches[i];
            event.currentTarget.dragPrevPosition[touch.identifier] = {x: touch.pageX, y: touch.pageY};
            event.currentTarget._lastDrag = {x: 0, y: 0};
        }
    }

    function ontouchmove(event) {
        var map = event.currentTarget.map;
        if (event.touches.length === 1 && event.currentTarget._lastDrag) {
            var touch = event.targetTouches[0],
                dxPx = event.currentTarget.dragPrevPosition[touch.identifier].x - touch.pageX,
                dyPx = event.currentTarget.dragPrevPosition[touch.identifier].y - touch.pageY,
                resolution = map.resolution,
                touchOffset = sGis.Event.getMouseOffset(event.currentTarget, touch),
                point = map.getPointFromPxPosition(touchOffset.x, touchOffset.y),
                position = {x: point.x / resolution, y: 0 - point.y / resolution};

            if (event.currentTarget._lastDrag.x === 0 && event.currentTarget._lastDrag.y === 0) {
                map.fire('dragStart', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: event.currentTarget._lastDrag.x, y: event.currentTarget._lastDrag.y}});
            }

            map._lastDrag = {x: dxPx * resolution, y: 0 - dyPx * resolution};
            map._draggingObject.fire('drag', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: map._lastDrag.x, y: map._lastDrag.y}});

            event.currentTarget.dragPrevPosition[touch.identifier].x = touch.pageX;
            event.currentTarget.dragPrevPosition[touch.identifier].y = touch.pageY;
        } else if (event.touches.length === 2) {
            map._painter.prohibitUpdate();
            map._lastDrag = null;
            touchHandler.scaleChanged = true;
            var touch1 = event.touches[0],
                touch2 = event.touches[1];

            touch1.prevPosition = event.currentTarget.dragPrevPosition[touch1.identifier];
            touch2.prevPosition = event.currentTarget.dragPrevPosition[touch2.identifier];

            var x11 = touch1.prevPosition.x,
                x12 = touch1.pageX,
                x21 = touch2.prevPosition.x,
                x22 = touch2.pageX,
                baseX = (x11 - x12 - x21 + x22) === 0 ? (x11 + x21) / 2 : (x11*x22 - x12*x21) / (x11 - x12 - x21 + x22),
                y11 = touch1.prevPosition.y,
                y12 = touch1.pageY,
                y21 = touch2.prevPosition.y,
                y22 = touch2.pageY,
                baseY = (y11 - y12 - y21 + y22) === 0 ? (y11 + y21) / 2 : (y11*y22 - y12*y21) / (y11 - y12 - y21 + y22),
                len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2)),
                len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));

            map.changeScale(len1/len2, map.getPointFromPxPosition(baseX, baseY), true);

            event.currentTarget.dragPrevPosition[touch1.identifier].x = touch1.pageX;
            event.currentTarget.dragPrevPosition[touch1.identifier].y = touch1.pageY;
            event.currentTarget.dragPrevPosition[touch2.identifier].x = touch2.pageX;
            event.currentTarget.dragPrevPosition[touch2.identifier].y = touch2.pageY;
        }
        event.preventDefault();
    }

    function ontouchend(event) {
        for (var i in event.changedTouches) {
            delete event.currentTarget.dragPrevPosition[event.changedTouches[i].identifier];
        }

        event.currentTarget._lastDrag = null;

        var map = event.currentTarget.map;
        if (touchHandler.scaleChanged) {
            map.adjustResolution();
            touchHandler.scaleChanged = false;
        } else {
            map.fire('dragEnd');
        }
    }

    function oncontextmenu(event) {
        var map = event.currentTarget.map,
            mouseOffset = sGis.Event.getMouseOffset(event.currentTarget, event),
            point = map.getPointFromPxPosition(mouseOffset.x, mouseOffset.y),
            position = { x: point.x / map.resolution, y: -point.y / map.resolution };
        map.fire('contextmenu', { mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position });
        //event.preventDefault();
    }

    function ondblclick(event) {
        if (!isFormElement(event.target)) {
            mouseHandler.clickCatcher = null;
            var map = event.currentTarget.map,
                mouseOffset = sGis.Event.getMouseOffset(event.currentTarget, event),
                point = map.getPointFromPxPosition(mouseOffset.x, mouseOffset.y),
                position = {x: point.x / map.resolution, y: - point.y / map.resolution};
            map.fire('dblclick', {map: map, mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position, browserEvent: event});
        }
    }

    function isFormElement(e) {
        var formElements = ['BUTTON', 'INPUT', 'LABEL', 'OPTION', 'SELECT', 'TEXTAREA'];
        for (var i = 0; i < formElements.length; i++) {
            if (e.tagName === formElements[i]) return true;
        }
        return false;
    }
    
    utils.extend(EventDispatcher.prototype, defaults);
    
    return EventDispatcher;

});