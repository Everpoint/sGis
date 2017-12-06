import {getMouseOffset, getWheelDirection, listenDomEvent, removeDomEventListener} from "../../utils/domEvent";

const MIN_WHEEL_DELAY = 50;

/**
 * @alias sGis.painter.domPainter.EventDispatcher
 */
export class EventDispatcher {
    objectEvents = ['click', 'dblclick', 'dragStart', 'mousemove'];

    private _master: any;
    private _wheelTimer: number;
    private _touchHandler: any;
    private _hoverObject: any;
    private _clickCatcher: boolean;
    private _dragPosition: { x: number; y: number };
    private _lastDrag: { x: number; y: number };
    private _draggingObject: any;
    private _touches: any;

    constructor(baseNode, master) {
        this._master = master;
        this._setListeners(baseNode);

        this._onDocumentMousemove = this._onDocumentMousemove.bind(this);
        this._onDocumentMouseup = this._onDocumentMouseup.bind(this);

        this._wheelTimer = 0;
        this._touchHandler = {dragPrevPosition: []};
    }

    _dispatchEvent(name, data) {
        var sGisEvent;

        var topObject = this._master.map;
        if (data.position) {
            var layerRenderers = this._master.layerRenderers;
            for (var i = layerRenderers.length - 1; i >= 0; i--) {
                var details = <any>{};
                var targetObject = layerRenderers[i].getEventCatcher(name, [data.position.x, data.position.y], details);

                if (name === 'mousemove' && !targetObject) {
                    targetObject = layerRenderers[i].getEventCatcher('mouseover', [data.position.x, data.position.y], details);
                }

                if (targetObject) {
                    if (Array.isArray(details.intersectionType)) {
                        data.contourIndex = details.intersectionType[0];
                        data.pointIndex = details.intersectionType[1];
                    } else {
                        data.contourIndex = null;
                        data.pointIndex = null;
                    }

                    data.intersectionType = details.intersectionType;
                    sGisEvent = targetObject.fire(name, data);
                    topObject = targetObject;
                    if (sGisEvent && sGisEvent.isCanceled) return sGisEvent;
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
        listenDomEvent(baseNode, 'mousedown', this._onmousedown.bind(this));
        listenDomEvent(baseNode, 'wheel', this._onwheel.bind(this));
        listenDomEvent(baseNode, 'click', this._onclick.bind(this));
        listenDomEvent(baseNode, 'dblclick', this._ondblclick.bind(this));
        listenDomEvent(baseNode, 'mousemove', this._onmousemove.bind(this));
        listenDomEvent(baseNode, 'mouseout', this._onmouseout.bind(this));
        listenDomEvent(baseNode, 'contextmenu', this._oncontextmenu.bind(this));

        listenDomEvent(baseNode, 'touchstart', this._ontouchstart.bind(this));
        listenDomEvent(baseNode, 'touchmove', this._ontouchmove.bind(this));
        listenDomEvent(baseNode, 'touchend', this._ontouchend.bind(this));
    }

    _onmousedown(event) {
        if (!isFormElement(event.target)) {
            this._clickCatcher = true;
            if (event.which === 1) {
                this._dragPosition = getMouseOffset(event.currentTarget, event);

                listenDomEvent(document, 'mousemove', this._onDocumentMousemove);
                listenDomEvent(document, 'mouseup', this._onDocumentMouseup);

                document.ondragstart = function() {return false;};
                document.body.onselectstart = function() {return false;};
            }
            return false;
        }
    }

    _onDocumentMousemove(event) {
        var map = this._master.map;
        var mousePosition = getMouseOffset(this._master.wrapper, event);
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
            this._draggingObject.fire('drag', {map: map, mouseOffset: mousePosition, position: position, point: point, ctrlKey: event.ctrlKey, offset: [this._lastDrag.x, this._lastDrag.y], pxOffset: [dxPx, dyPx], browserEvent: event});
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
        removeDomEventListener(document, 'mousemove', this._onDocumentMousemove);
        removeDomEventListener(document, 'mouseup', this._onDocumentMouseup);
        document.ondragstart = null;
        document.body.onselectstart = null;
    }

    _onwheel(event) {
        var time = Date.now();
        if (time - this._wheelTimer > MIN_WHEEL_DELAY) {
            this._wheelTimer = time;
            var map = this._master.map;
            var wheelDirection = getWheelDirection(event);
            var mouseOffset = getMouseOffset(event.currentTarget, event);

            map.zoom(wheelDirection, this._master.getPointFromPxPosition(mouseOffset.x, mouseOffset.y));
        }
        event.preventDefault();
        return false;
    }

    _getMouseEventDescription(event) {
        var map = this._master.map;
        var mouseOffset = getMouseOffset(event.currentTarget, event);
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
        if (!this._touches) this._touches = [];

        for (let  i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            if (!this._touches.some(t => t.id === touch.identifier)) this._touches.push({ id: touch.identifier, position: [touch.pageX, touch.pageY] });
        }

        this._touchHandler.lastDrag = {x: 0, y: 0};

        if (event.touches.length > 1) event.preventDefault();
    }

    _ontouchmove(event) {
        this._clearTouches(event);
        let touches = Array.prototype.slice.apply(event.touches);

        let map = this._master.map;
        if (touches.length === 1 && this._touchHandler.lastDrag) {
            let touch = event.targetTouches[0];
            let [prevX, prevY] = this._touches[0].position;
            let dxPx = prevX - touch.pageX;
            let dyPx = prevY - touch.pageY;
            let resolution = map.resolution;
            let touchOffset = getMouseOffset(event.currentTarget, touch);
            let point = this._master.getPointFromPxPosition(touchOffset.x, touchOffset.y);
            let position = {x: point.x / resolution, y: 0 - point.y / resolution};

            if (this._touchHandler.lastDrag.x === 0 && this._touchHandler.lastDrag.y === 0) {
                let sGisEvent = this._dispatchEvent('dragStart', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});
                this._draggingObject = sGisEvent.draggingObject || map;
            }

            this._touchHandler.lastDrag = {x: dxPx * resolution, y: 0 - dyPx * resolution};
            this._draggingObject.fire('drag', {point: point, position: position, offset: {xPx: dxPx, yPx: dyPx, x: this._touchHandler.lastDrag.x, y: this._touchHandler.lastDrag.y}});

            this._touches[0].position = [touch.pageX, touch.pageY];
        } else if (touches.length > 1) {
            this._master.forbidUpdate();
            this._touchHandler.lastDrag = null;
            this._touchHandler.scaleChanged = true;

            let t1 = touches.find(t => t.identifier === this._touches[0].id);
            let t2 = touches.find(t => t.identifier === this._touches[1].id);

            let [x11, y11] = this._touches[0].position;
            let [x12, y12] = [t1.pageX, t1.pageY];
            let [x21, y21] = this._touches[1].position;
            let [x22, y22] = [t2.pageX, t2.pageY];

            let c1 = [(x11 + x21) / 2, (y11 + y21) / 2];
            let c2 = [(x12 + x22) / 2, (y12 + y22) / 2];

            let base = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];

            let len1 = Math.sqrt(Math.pow(x11 - x21, 2) + Math.pow(y11 - y21, 2));
            let len2 = Math.sqrt(Math.pow(x12 - x22, 2) + Math.pow(y12 - y22, 2));

            let basePoint = this._master.getPointFromPxPosition(base[0], base[1]);
            let dc = [c1[0] - c2[0], c2[1] - c1[1]];

            let zoomK = len1 / len2;
            if (len1 !== len2 && len2 !== 0) map.changeScale(zoomK, basePoint, true);
            map.move(dc[0]*map.resolution, dc[1]*map.resolution);

            this._touches[0].position = [x12, y12];
            this._touches[1].position = [x22, y22];

            this._touchHandler.lastZoomDirection = zoomK < 1;
        }
        event.preventDefault();
    }

    _ontouchend(event) {
        this._clearTouches(event);

        for (let i = 0; i < event.changedTouches.length; i++) {
            let index = this._touches.findIndex(touch => touch.id === event.changedTouches[i].identifier);
            if (index >= 0) this._touches.splice(index, 1);
        }

        this._touchHandler.lastDrag = null;


        if (this._touchHandler.scaleChanged) {
            this._master.allowUpdate();
            this._master.map.adjustResolution(this._touchHandler.lastZoomDirection);
            this._touchHandler.scaleChanged = false;
        } else {
            if (this._draggingObject) {
                this._draggingObject.fire('dragEnd');
                this._draggingObject = null;
            }
        }
    }

    _clearTouches(event) {
        let touches = Array.prototype.slice.apply(event.touches);

        for (let i = this._touches.length - 1; i >= 0; i--) {
            if (!touches.some(touch => touch.identifier === this._touches[i].id)) this._touches.splice(i, 1);
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
