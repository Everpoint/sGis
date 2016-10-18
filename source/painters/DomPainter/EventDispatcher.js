sGis.module('painter.domPainter.EventDispatcher', [
    'event',
    'utils'
], (ev, utils) => {

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
            this._touchHandler = {dragPrevPosition: {}};
        }
        
        _dispatchEvent(name, data) {
            var sGisEvent;

            var topObject = this._master.map;
            if (data.position) {
                var layerRenderers = this._master.layerRenderers;
                for (var i = layerRenderers.length - 1; i >= 0; i--) {
                    var details = {};
                    var targetObject = layerRenderers[i].getEventCatcher(name, [data.position.x, data.position.y], details);
                    if (targetObject) {
                        data.intersectionType = details.intersectionType;
                        sGisEvent = targetObject.fire(name, data);
                        topObject = targetObject;
                        if (sGisEvent && sGisEvent.isCanceled()) return sGisEvent;
                        break;
                    }
                }
            }

            if (name === 'mousemove' && topObject !== this._hoverObject) {
                if (this._hoverObject && this._hoverObject !== this._master.map) {
                    this._hoverObject.fire('mouseout', data);
                }

                topObject.fire('mouseover', data);
                this._hoverObject = topObject;
            }
                
            if (sGisEvent) {
                this._master.map.forwardEvent(sGisEvent);
                return sGisEvent;
            } else {
                return this._master.map.fire(name, data);
            }
        }

        _setListeners(baseNode) {
            ev.add(baseNode, 'mousedown', this._onmousedown.bind(this));
            ev.add(baseNode, 'wheel', this._onwheel.bind(this));
            ev.add(baseNode, 'click', this._onclick.bind(this));
            ev.add(baseNode, 'dblclick', this._ondblclick.bind(this));
            ev.add(baseNode, 'mousemove', this._onmousemove.bind(this));
            ev.add(baseNode, 'mouseout', this._onmouseout.bind(this));
            ev.add(baseNode, 'contextmenu', this._oncontextmenu.bind(this));

            ev.add(baseNode, 'touchstart', this._ontouchstart.bind(this));
            ev.add(baseNode, 'touchmove', this._ontouchmove.bind(this));
            ev.add(baseNode, 'touchend', this._ontouchend.bind(this));
        }

        _onmousedown(event) {
            if (!isFormElement(event.target)) {
                this._clickCatcher = true;
                if (event.which === 1) {
                    this._dragPosition = ev.getMouseOffset(event.currentTarget, event);

                    ev.add(document, 'mousemove', this._onDocumentMousemove);
                    ev.add(document, 'mouseup', this._onDocumentMouseup);

                    document.ondragstart = function() {return false;};
                    document.body.onselectstart = function() {return false;};
                }
                return false;
            }
        }

        _onDocumentMousemove(event) {
            var map = this._master.map;
            var mousePosition = ev.getMouseOffset(this._master.wrapper, event);
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
                this._draggingObject.fire('drag', {map: map, mouseOffset: mousePosition, position: position, point: point, ctrlKey: event.ctrlKey, offset: {xPx: dxPx, yPx: dyPx, x: this._lastDrag.x, y: this._lastDrag.y}, browserEvent: event});
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
            ev.remove(document, 'mousemove', this._onDocumentMousemove);
            ev.remove(document, 'mouseup', this._onDocumentMouseup);
            document.ondragstart = null;
            document.body.onselectstart = null;
        }

        _onwheel(event) {
            var time = Date.now();
            if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
                this._wheelTimer = time;
                var map = this._master.map;
                var wheelDirection = ev.getWheelDirection(event);
                var mouseOffset = ev.getMouseOffset(event.currentTarget, event);

                map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
            }
            event.preventDefault();
            return false;
        }

        _getMouseEventDescription(event) {
            var map = this._master.map;
            var mouseOffset = ev.getMouseOffset(event.currentTarget, event);
            var point = this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y);
            var position = {x: point.x / map.resolution, y: - point.y / map.resolution};
            return {map: map, mouseOffset: mouseOffset, ctrlKey: event.ctrlKey, point: point, position: position, browserEvent: event};
        }

        _onclick(event) {
            if (this._clickCatcher && !isFormElement(event.target)) {
                this._dispatchEvent('click', this._getMouseEventDescription(event));
            }
        }

        _ondblclick(event) {
            if (!isFormElement(event.target)) {
                this._clickCatcher = null;
                this._dispatchEvent('dblclick', this._getMouseEventDescription(event));
            }
        }

        _onmousemove(event) {
            this._dispatchEvent('mousemove', this._getMouseEventDescription(event));
        }

        _onmouseout(event) {
            this._dispatchEvent('mouseout', this._getMouseEventDescription(event));
        }

        _oncontextmenu(event) {
            this._dispatchEvent('contextmenu', this._getMouseEventDescription(event));
        }

        _ontouchstart(event) {
            for (var i = 0; i < event.changedTouches.length; i++) {
                var touch = event.changedTouches[i];
                this._touchHandler.dragPrevPosition[touch.identifier] = {x: touch.pageX, y: touch.pageY};
                this._touchHandler.lastDrag = {x: 0, y: 0};
            }
        }

        _ontouchmove(event) {
            var map = this._master.map;
            if (event.touches.length === 1 && this._touchHandler.lastDrag) {
                var touch = event.targetTouches[0];
                var dxPx = this._touchHandler.dragPrevPosition[touch.identifier].x - touch.pageX;
                var dyPx = this._touchHandler.dragPrevPosition[touch.identifier].y - touch.pageY;
                var resolution = map.resolution;
                var touchOffset = ev.getMouseOffset(event.currentTarget, touch);
                var point = this._master.getPointFromPxPosition(touchOffset.x, touchOffset.y);
                var position = {x: point.x / resolution, y: 0 - point.y / resolution};

                if (this._touchHandler.lastDrag.x === 0 && this._touchHandler.lastDrag.y === 0) {
                    var sGisEvent = this._dispatchEvent('dragStart', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});
                    this._draggingObject = sGisEvent.draggingObject || map;
                }

                this._touchHandler.lastDrag = {x: dxPx * resolution, y: 0 - dyPx * resolution};
                this._draggingObject.fire('drag', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});

                this._touchHandler.dragPrevPosition[touch.identifier].x = touch.pageX;
                this._touchHandler.dragPrevPosition[touch.identifier].y = touch.pageY;
            } else if (event.touches.length > 1) {
                this._master.forbidUpdate();
                this._touchHandler.lastDrag = null;
                this._touchHandler.scaleChanged = true;

                var touch1 = event.touches[0];
                var touch2 = event.touches[1];

                touch1.prevPosition = this._touchHandler.dragPrevPosition[touch1.identifier];
                touch2.prevPosition = this._touchHandler.dragPrevPosition[touch2.identifier];

                var x11 = touch1.prevPosition.x;
                var x12 = touch1.pageX;
                var x21 = touch2.prevPosition.x;
                var x22 = touch2.pageX;
                var baseX = (x11 - x12 - x21 + x22) === 0 ? (x11 + x21) / 2 : (x11*x22 - x12*x21) / (x11 - x12 - x21 + x22);
                var y11 = touch1.prevPosition.y;
                var y12 = touch1.pageY;
                var y21 = touch2.prevPosition.y;
                var y22 = touch2.pageY;
                var baseY = (y11 - y12 - y21 + y22) === 0 ? (y11 + y21) / 2 : (y11*y22 - y12*y21) / (y11 - y12 - y21 + y22);
                var len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2));
                var len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));

                map.changeScale(len1/len2, this._master.getPointFromPxPosition(baseX, baseY), true);

                this._touchHandler.dragPrevPosition[touch1.identifier].x = touch1.pageX;
                this._touchHandler.dragPrevPosition[touch1.identifier].y = touch1.pageY;
                this._touchHandler.dragPrevPosition[touch2.identifier].x = touch2.pageX;
                this._touchHandler.dragPrevPosition[touch2.identifier].y = touch2.pageY;
            }
            event.preventDefault();
        }

        _ontouchend(event) {
            for (var i = 0; i < event.changedTouches.length; i++) {
                delete this._touchHandler.dragPrevPosition[event.changedTouches[i].identifier];
            }

            this._touchHandler.lastDrag = null;

            var map = this._master.map;
            if (this._touchHandler.scaleChanged) {
                map.adjustResolution();
                this._touchHandler.scaleChanged = false;
                this._master.allowUpdate();
            } else {
                if (this._draggingObject) {
                    this._draggingObject.fire('dragEnd');
                    this._draggingObject = null;
                }
            }
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