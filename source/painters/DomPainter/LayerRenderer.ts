import {Canvas} from "./Canvas";
import {Bbox} from "../../Bbox";
import {Container} from "./Container";
import {Layer} from "../../layers/Layer";
import {Coordinates} from "../../baseTypes";
import {DynamicRender, IntersectionType, Render, StaticRender, VectorRender} from "../../renders/Render";
import {StaticVectorImageRender} from "../../renders/StaticVectorImageRender";
import {StaticImageRender} from "../../renders/StaticImageRender";
import {StaticHtmlImageRender} from "../../renders/StaticHtmlImageRender";
import {MouseEventFlags} from "../../EventHandler";
import {listenDomEvent} from "../../utils/domEvent";

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
        MouseEventFlags.MouseUp,
        MouseEventFlags.DragStart
    ];

    private _canvas: Canvas;
    private _useCanvas: boolean;
    private _layer: Layer;
    private _renders: Render[] = [];
    private _master: any;
    private _eventCatchers: {[key: string]: Map<Render, Render>};
    private _index: number;
    private _zIndex: number;

    updateNeeded: boolean;
    private _canvasContainer: any;
    private _updateTimer: any;
    private _currentContainer: Container;


    /**
     * @constructor
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

        this._resetEventCatcherMaps();

        this._setListeners();
        this.setIndex(index);

        this._forceUpdate();
    }

    get layer(): Layer {
        return this._layer;
    }

    private _setListeners(): void {
        this._layer.on('propertyChange', () => {
            this._forceUpdate();
        });
    }

    private _resetEventCatcherMaps(): void {
        this._eventCatchers = {};
        this.listensFor.forEach(eventName => {
            this._eventCatchers[eventName] = new Map<Render, Render>();
        });
    }

    private _forceUpdate(): void {
        this.updateNeeded = true;
    }

    setIndex(index: number): void {
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

    clear(): void {
        for (let render of this._renders) {
            this._removeRender(render);
        }

        this._renders = [];
        this._resetEventCatcherMaps();

        if (this._canvasContainer) this._canvasContainer.removeNode(this._canvas.node);
        if (this._updateTimer) clearTimeout(this._updateTimer);
    }

    update(): void {
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

    private _removeOutdatedRenders(newRenders: Render[]): void {
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

    private _rerender(): void {
        let bbox = this._master.bbox;
        let renders = this._layer.getRenders(bbox, this._master.map.resolution);
        if (this._layer.updateProhibited) return;

        if (this.currentContainer !== this._master.currContainer) this.moveToLastContainer();
        this._resetCanvas(bbox);

        this._removeCanvas();

        this._removeOutdatedRenders(renders);

        this._draw(renders);

        if (!this._canvas.isEmpty) {
            this._addCanvasToDom(bbox);
        }

        this._renders = renders;
    }

    private _draw(renders: Render[]): void {
        for (let render of renders) {
            if (render instanceof StaticVectorImageRender || render instanceof VectorRender || this._renders.indexOf(render) < 0) {
                this._drawRender(render);
            }
        }
    }

    private _drawRender(render: Render): void {
        if (render instanceof StaticRender) {
            this._drawStaticRender(render);
        } else if (render instanceof DynamicRender) {
            this._drawDynamicRender(render);
        }

        this._setRenderListeners(render);
    }

    private _setRenderListeners(render: Render): void {
        this.listensFor.forEach(eventFlag => {
            if (render.listensFor & eventFlag) this._eventCatchers[eventFlag].set(render, render);
        });
    }

    private _removeRenderListeners(render: Render): void {
        this.listensFor.forEach(eventFlag => {
            if (render.listensFor & eventFlag) this._eventCatchers[eventFlag].delete(render);
        });
    }

    private _drawStaticRender(render: StaticRender) {
        if (render instanceof StaticHtmlImageRender) {
            this._drawImageRender(render);
        } else if (render instanceof VectorRender) {
            this._drawVectorRender(render);
        } else if (render instanceof StaticVectorImageRender) {
            this._drawAfterLoad(render);
        }
    }

    private _drawImageRender(render: StaticHtmlImageRender) {
        render.node.style.zIndex = this._zIndex.toString();
        this._currentContainer.addNode(render.node, render.width, render.height, render.bbox);
        if (render.onDisplayed) render.onDisplayed();
    }

    private _drawAfterLoad(render: StaticVectorImageRender) {
        let image = render.node;

        if (image instanceof HTMLImageElement) {
            if (image.complete) return this._drawVectorRender(render);

            listenDomEvent(image, 'load', () => {
                if (this._renders.indexOf(render) >= 0) {
                    this._drawVectorRender(render);
                    if (!this._canvas.node.parentNode) this._addCanvasToDom(this._master.bbox);
                }
            });
        } else {
            this._drawVectorRender(render);
        }
    }

    private _drawVectorRender(render: RenderForCanvas) {
        this._canvas.draw(render);
    }

    private _drawDynamicRender(render: DynamicRender) {
        render.update(this._master.bbox, this._master.map.resolution);
        this._master.dynamicContainer.appendChild(render.node);
        this._renders.push(render);

        if (render.onRender) render.onRender();
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
        if ((render instanceof StaticImageRender || render instanceof DynamicRender) && render.node.parentNode) {
            render.node.parentNode.removeChild(render.node);
            if (render instanceof StaticHtmlImageRender && render.onRemoved) render.onRemoved();
        }

        this._removeRenderListeners(render);
    }

    moveToLastContainer(): void {
        this._moveRendersToLastContainer();

        if (this._canvas.node.parentNode) {
            this._canvasContainer.removeNode(this._canvas.node);
            this._master.currContainer.addNode(this._canvas.node, this._canvas.width, this._canvas.height, this._canvas.bbox);
            this._canvasContainer = this._master.currContainer;
        }

        this.currentContainer = this._master.currContainer;
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

        let keys = Array.from(this._eventCatchers[eventFlag].keys());
        for (let i = keys.length - 1; i >= 0; i--) {
            let render = keys[i];
            let intersectionType = render.contains && render.contains(position);
            if (intersectionType) {
                return [render, intersectionType];
            }
        }

        return [null, null];
    }
}
