import {Canvas} from "./Canvas";
import {Bbox} from "../../Bbox";
import {Container} from "./Container";
import {Layer} from "../../layers/Layer";
import {MouseEventFlags} from "../../commonEvents";
import {Coordinates} from "../../baseTypes";
import {DynamicRender, IntersectionType, Render, StaticRender, VectorRender} from "../../renders/Render";
import {StaticVectorImageRender} from "../../renders/StaticVectorImageRender";
import {StaticImageRender} from "../../renders/StaticImageRender";
import {StaticHtmlImageRender} from "../../renders/StaticHtmlImageRender";

export type RenderForCanvas = VectorRender | StaticVectorImageRender;

/**
 * @alias sGis.painter.domPainter.LayerRenderer
 * @ignore
 */
export class LayerRenderer {
    delayedUpdateTime = 500;
    listensFor: MouseEventFlags[] = [
        MouseEventFlags.MouseClick,
        MouseEventFlags.DoubleClick,
        MouseEventFlags.MouseDown,
        MouseEventFlags.MouseMove,
        MouseEventFlags.MouseOut,
        MouseEventFlags.MouseOver,
        MouseEventFlags.MouseUp
    ];

    private _canvas: Canvas;
    private _useCanvas: boolean;
    private _layer: Layer;
    private _renders: Render[] = [];
    private _master: any;
    private _eventCatchers: any;
    private _index: number;
    private _zIndex: number;

    updateNeeded: boolean;
    private _canvasContainer: any;
    private _updateTimer: any;
    private _currentContainer: Container;


    /**
     * @constructor
     * @alias sGis.renderers.domRenderer.LayerRenderer.constructor
     * @param master
     * @param layer
     * @param index
     * @param useCanvas
     */
    constructor(master, layer, index, useCanvas = true) {
        this._master = master;
        this._layer = layer;
        this._useCanvas = useCanvas;
        this._canvas = new Canvas();

        this._setEventCatcherMaps();

        this._setListeners();
        this.setIndex(index);

        this._forceUpdate();
    }

    get layer() {
        return this._layer;
    }

    _setListeners() {
        this._layer.on('propertyChange', () => {
            this._forceUpdate();
        });
    }

    _setEventCatcherMaps() {
        this._eventCatchers = {};
        this.listensFor.forEach(eventName => {
            this._eventCatchers[eventName] = [];
        });
    }

    _forceUpdate() {
        this.updateNeeded = true;
    }

    setIndex(index) {
        if (index === this._index) return;

        let zIndex = index * 2 + 1;

        for (let render of this._renders) {
            if (render instanceof StaticImageRender || render instanceof DynamicRender) {
                render.node.style.zIndex = zIndex.toString();
            }
        }

        this._canvas.setIndex(index * 2);

        this._index = index;
        this._zIndex = zIndex;
    }

    clear() {
        for (let render of this._renders) {
            this._removeRender(render);
        }

        this._renders = [];

        if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
        if (this._updateTimer) clearTimeout(this._updateTimer);
    }

    update() {
        if (this._layer.delayedUpdate) {
            if (this._updateTimer) clearTimeout(this._updateTimer);

            if (this.updateNeeded) {
                this._rerender();
            } else {
                this._updateTimer = setTimeout(() => {
                    this._rerender();
                }, this.delayedUpdateTime);
            }
        } else {
            this._rerender();
        }

        this.updateNeeded = false;
    }

    updateDynamic(): void {
        this._renders.forEach(render => {
            if (render instanceof DynamicRender) render.update(this._master.bbox, this._master.map.resolution);
        });
    }

    private _removeOutdatedRenders(newRenders: Render[]) {
        for (let i = this._renders.length - 1; i >= 0; i--) {
            if (newRenders.indexOf(this._renders[i]) < 0) {
                this._removeRender(this._renders[i]);
            }
        }
    }

    private _removeCanvas(): void {
        if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
    }

    private _addCanvasToDom(bbox: Bbox): void {
        this._canvasContainer = this.currentContainer;
        this._canvasContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, bbox);
    }

    private _resetCanvas(bbox: Bbox): void {
        this._removeCanvas();
        this._canvas.reset(bbox, this._master.map.resolution, this._master.width, this._master.height);
    }

    private _rerender() {
        if (this._layer.updateProhibited) return;

        this.currentContainer = this._master.currContainer;
        let bbox = this._master.bbox;
        this._resetCanvas(bbox);

        this._removeCanvas();

        let renders = this._layer.getRenders(bbox, this._master.map.resolution);

        this._removeOutdatedRenders(renders);
        this._redrawCanvasRenders();
        this._draw(renders);

        if (!this._canvas.isEmpty) {
            this._addCanvasToDom(bbox);
        }

        this._renders = renders;
    }

    private _redrawCanvasRenders() {
        for (let render of this._renders) {
            if (render instanceof StaticVectorImageRender || render instanceof VectorRender) {
                this._drawVectorRender(render);
            }
        }
    }

    private _draw(renders: Render[]) {
        for (let render of renders) {
            if (this._renders.indexOf(render) < 0) {
                this._drawRender(render);
            }
        }
    }

    private _drawRender(render: Render) {
        if (render instanceof StaticRender) {
            this._drawStaticRender(render);
        } else if (render instanceof DynamicRender) {
            this._drawDynamicRender(render);
        }

        this._setRenderListeners(render);
    }

    private _setRenderListeners(render: Render) {
        this.listensFor.forEach(eventFlag => {
            if (render.listensFor & eventFlag) this._eventCatchers[eventFlag].push(render);
        })
    }

    private _drawStaticRender(render: StaticRender) {
        if (render instanceof StaticHtmlImageRender) {
            this._drawImageRender(render);
        } else if (render instanceof VectorRender || render instanceof StaticVectorImageRender) {
            this._drawVectorRender(render);
        }
    }

    private _drawImageRender(render: StaticHtmlImageRender) {
        render.node.style.zIndex = this._zIndex.toString();
        this._currentContainer.addNode(render.node, render.width, render.height, render.bbox);
        if (render.onDisplayed) render.onDisplayed();
    }

    private _drawVectorRender(render: RenderForCanvas) {
        this._canvas.draw(render);
    }

    private _drawDynamicRender(render: DynamicRender) {
        render.update(this._master.bbox, this._master.map.resolution);
        this._master.dynamicContainer.appendChild(render.node);
        this._renders.push(render);
    }

    get currentContainer() {
        return this._currentContainer;
    }

    set currentContainer(container) {
        if (this._currentContainer !== container) {
            this._currentContainer = container;
            this._master.resolveLayerOverlay();
        }
    }

    private _removeRender(render: Render) {
        if (render instanceof StaticImageRender || render instanceof DynamicRender) {
            if (!render.node.parentNode) return;
            render.node.parentNode.removeChild(render.node);
            if (render instanceof StaticHtmlImageRender && render.onRemoved) render.onRemoved();
        }
    }

    moveToLastContainer(): void {
        this._moveRendersToLastContainer();

        if (this._canvas.node.parentNode) {
            this._canvasContainer.removeNode(this._canvas.node);
            this._master.currContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, this._canvas.bbox);
            this._canvasContainer = this._master.currContainer;
        }

        this._currentContainer = this._master.currContainer;
    }

    private _moveRendersToLastContainer(): void {
        let container = this._master.currContainer;
        for (let render of this._renders) {
            if (render instanceof StaticHtmlImageRender) {
                container.addNode(render.node, render.width, render.height, render.bbox);
            }
        }
    }

    getEventCatcher(eventFlag: MouseEventFlags, position: Coordinates): [Render, IntersectionType] {
        if (!this._eventCatchers[eventFlag]) return [null, null];

        for (let render of this._eventCatchers[eventFlag]) {
            let intersectionType = render.contains && render.contains(position);
            if (intersectionType) {
                return [render, intersectionType];
            }
        }

        return [null, null];
    }
}
