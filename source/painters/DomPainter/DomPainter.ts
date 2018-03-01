import {IPoint, Point} from "../../Point";
import {EventDispatcher} from "./EventDispatcher";
import {LayerRenderer} from "./LayerRenderer";
import {Container} from "./Container";
import {AnimationEndEvent, AnimationStartEvent, Map as sGisMap} from "../../Map";
import {Layer} from "../../layers/Layer";
import {Bbox} from "../../Bbox";
import {error, warn} from "../../utils/utils";
import {softEquals} from "../../utils/math";
import {Coordinates} from "../../baseTypes";
import {EventHandler} from "../../EventHandler";
import {ContentsChangeEvent} from "../../LayerGroup";
import {DragEvent, sGisDoubleClickEvent} from "../../commonEvents";

let innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
let layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';

export interface DomPainterParams {
    wrapper?: HTMLElement | string;
}

export class DomPainter extends EventHandler {
    private _map: sGisMap;
    private _layerRenderers: Map<Layer, LayerRenderer>;
    private _position: Coordinates;
    private _resolution: number;
    private _needUpdate: boolean;
    private _updateAllowed: boolean;
    private _containers: Container[];
    private _repaintBound: (number) => void;
    private _eventDispatcher: EventDispatcher;
    private _redrawNeeded: boolean;
    private _wrapper: HTMLElement;
    private _staticRendersContainer: HTMLElement;
    private _dynamicRendersContainer: HTMLElement;
    private _innerWrapper: HTMLElement;

    private _width: number;
    private _height: number;
    private _bboxWidth: number;
    private _bboxHeight: number;
    private _bbox: Bbox;

    /**
     * @param map - the map to be drawn.
     * @param options - key-value list of properties to be assigned to the instance.
     */
    constructor(map: sGisMap, {wrapper = null}: DomPainterParams = {}) {
        super();

        this._map = map;
        this.wrapper = wrapper;

        this._layerRenderers = new Map();
        this._containers = [];

        this._position = [Infinity, Infinity];
        this._resolution = Infinity;

        this._needUpdate = true;
        this._updateAllowed = true;

        this._updateLayerList();
        this._setEventListeners();

        this._repaintBound = this._repaint.bind(this);
        this._repaint();
    }

    /**
     * DOM element, inside of which the map will be drawn. If null is given, the map will not be drawn. If string is given, an element with given id will be searched.
     */
    get wrapper() { return this._wrapper; }
    set wrapper(wrapper: HTMLElement | string | null) {
        if (this._wrapper) this._clearDOM();
        if (wrapper) {
            this._initDOM(wrapper);
            this._eventDispatcher = new EventDispatcher(this._innerWrapper, this);
            this._needUpdate = true;
            this._redrawNeeded = true;
        }

        this.fire('wrapperChange');
    }

    get layerRenderers(): LayerRenderer[] { return Array.from(this._layerRenderers.values()); }

    /**
     * Sets position and resolution of the map to show the full bounding box in the center of the map
     * @param bbox
     * @param animate - if set to true, the position will be changed gradually with animation.
     * @returns the actual bbox of the map after the change.
     */
    show(bbox: Bbox, animate: boolean = true): Bbox {
        let projected = bbox.projectTo(this.map.crs);
        let xResolution = projected.width / this.width;
        let yResolution = projected.height / this.height;

        let method = animate ? 'animateTo' : 'setPosition';

        let center = projected.center;
        this.map[method](center, this.map.getAdjustedResolution(Math.max(xResolution, yResolution)));

        return new Bbox([center[0] - this.width * xResolution, center[1] - this.height * yResolution],
                        [center[0] + this.width * xResolution, center[1] + this.height * yResolution], this.map.crs);
    }

    private _updateLayerList(): void {
        let mapLayers = this._map.getLayers(true, true);
        for (let layer of this._layerRenderers.keys()) {
            if (mapLayers.indexOf(layer) < 0) this._removeLayer(layer);
        }

        mapLayers.forEach((layer, index) => {
            let renderer = this._layerRenderers.get(layer);
            if (renderer) {
                renderer.setIndex(index);
            } else {
                this._addLayer(layer, index);
            }
        });
    }

    private _addLayer(layer: Layer, index: number): void {
        this._layerRenderers.set(layer, new LayerRenderer(this, layer, index));
    }

    private _removeLayer(layer: Layer): void {
        this._layerRenderers.get(layer).clear();
        this._layerRenderers.delete(layer);
    }

    private _setEventListeners(): void {
        this._map.on(ContentsChangeEvent.type, this._updateLayerList.bind(this));
        this._map.on(DragEvent.type, this._onMapDrag.bind(this));
        this._map.on(sGisDoubleClickEvent.type, this._onMapDblClick.bind(this));
        this._map.on(AnimationStartEvent.type, this.forbidUpdate.bind(this));
        this._map.on(AnimationEndEvent.type, this.allowUpdate.bind(this));
    }

    /**
     * Prevents the map to be redrawn.
     */
    forbidUpdate(): void {
        this._updateAllowed = false;
    }

    /**
     * Allows redrawing of the map again after .forbidUpdate() has been called.
     */
    allowUpdate(): void {
        this._updateAllowed = true;
    }

    private _repaint(): void {
        this._updateSize();

        if (this.isDisplayed) {
            if (this._needUpdate && this._updateAllowed) {
                this._setNewContainer();
                this._needUpdate = false;
            }

            this._updateBbox();

            let layers = this._map.getLayers(true, true);

            let redrawNeeded = this._redrawNeeded;
            if (this._updateAllowed) {
                layers.reverse().forEach(layer => {
                    let renderer = this._layerRenderers.get(layer);
                    if (redrawNeeded || renderer.updateNeeded) {
                        try {
                            renderer.update();
                        } catch (e) {
                            warn(e);
                            renderer.updateNeeded = false;
                        }
                    }
                });

                this._redrawNeeded = false;
            }

            if (redrawNeeded) {
                layers.forEach(layer => {
                    let renderer = this._layerRenderers.get(layer);
                    renderer.updateDynamic();
                });
            }
        }

        window.requestAnimationFrame(this._repaintBound);
    }

    private _setNewContainer(): void {
        this._containers.push(new Container(this._staticRendersContainer, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
    }

    private _removeEmptyContainers(): void {
        // Check all containers except the last one, for we never remove it
        for (let i = this._containers.length - 2; i >= 0; i--) {
            if (this._containers[i].isEmpty) {
                this._removeContainer(i);
            }
        }
    }

    private _removeContainer(i: number): void {
        this._containers[i].remove();
        this._containers.splice(i, 1);
    }

    private _updateSize(): void {
        this._width = this._wrapper ? this._wrapper.clientWidth || this._wrapper.offsetWidth : 0;
        this._height = this._wrapper ? this._wrapper.clientHeight || this._wrapper.offsetHeight : 0;
    }

    /**
     * Returns true is the map is currently displayed in the DOM>
     */
    get isDisplayed(): boolean { return this._width > 0 && this._height > 0; }

    private _updateBbox(): void {
        let mapPosition = this._map.position;
        if (this._position[0] !== mapPosition[0] || this._position[1] !== mapPosition[1] || !softEquals(this._map.resolution, this._resolution) || this._bboxWidth !== this._width || this._bboxHeight !== this._height) {
            this._position = [mapPosition[0], mapPosition[1]];
            this._resolution = this._map.resolution;

            let dx = this._width * this._resolution / 2;
            let dy = this._height * this._resolution / 2;

            this._bbox = new Bbox([mapPosition[0] - dx, mapPosition[1] - dy], [mapPosition[0] + dx, mapPosition[1] + dy], this._map.crs);

            this._containers.forEach(container => {
                if (container.crs.canProjectTo(this._map.crs)) {
                    container.updateTransform(this._bbox, this._resolution);
                } else {
                    this._removeContainer(this._containers.indexOf(container));
                    if (this._containers.length === 0) this._setNewContainer();
                }
            });

            if (this._containers.length > 0 && this._containers[this._containers.length - 1].scale !== 1) this._needUpdate = true;

            this._bboxWidth = this._width;
            this._bboxHeight = this._height;

            this._redrawNeeded = true;
        }
    }

    /**
     * Current bbox of the map drawn by this painter.
     */
    get bbox(): Bbox {
        if (!this._bbox) this._updateBbox();
        return this._bbox;
    }

    /**
     * The map this painter draws.
     */
    get map(): sGisMap { return this._map; }

    get currContainer(): Container { return this._containers[this._containers.length - 1]; }

    get dynamicContainer(): HTMLElement { return this._dynamicRendersContainer; }

    /**
     * Width of the map on the screen in pixels.
     */
    get width(): number { return this._width; }

    /**
     * Height of the map on the screen in pixels.
     */
    get height(): number { return this._height; }

    private _initDOM(node: HTMLElement | string): void {
        let wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
        if (!wrapper) error('The element with ID "' + node + '" is not found.');

        this._innerWrapper = document.createElement('div');
        this._innerWrapper.style.cssText = innerWrapperStyle;

        this._staticRendersContainer = document.createElement('div');
        this._staticRendersContainer.style.cssText = layerWrapperStyle;

        this._dynamicRendersContainer = document.createElement('div');
        this._dynamicRendersContainer.style.cssText = layerWrapperStyle;

        this._innerWrapper.appendChild(this._staticRendersContainer);
        this._innerWrapper.appendChild(this._dynamicRendersContainer);

        wrapper.appendChild(this._innerWrapper);
        this._wrapper = wrapper;
    }

    private _clearDOM(): void {
        if (this._innerWrapper.parentNode) this._innerWrapper.parentNode.removeChild(this._innerWrapper);

        this._innerWrapper = null;
        this._staticRendersContainer = null;
        this._dynamicRendersContainer = null;
        this._wrapper = null;

        this._eventDispatcher.remove();
        this._eventDispatcher = null;

        this._clearContainers();
    }

    private _clearContainers(): void {
        this._containers.forEach((container, i) => {
            this._removeContainer(i);
        });
        this._map.getLayers(true, true).reverse().forEach(layer => {
            let renderer = this._layerRenderers.get(layer);
            renderer.clear();
        });
    }

    get innerWrapper(): HTMLElement { return this._innerWrapper; }

    resolveLayerOverlay(): void {
        let prevContainerIndex = 0;
        this._map.getLayers(true, true).forEach(layer => {
            let renderer = this._layerRenderers.get(layer);
            if (!renderer) return;

            let containerIndex = this._containers.indexOf(renderer.currentContainer);
            if (containerIndex < prevContainerIndex) {
                renderer.moveToLastContainer();
                prevContainerIndex = this._containers.length - 1;
            } else {
                prevContainerIndex = containerIndex;
            }
        });

        this._removeEmptyContainers();
    }

    /**
     * Returns the point in map coordinates, that is located at the given offset from the left top corner of the map.
     * @param x
     * @param y
     */
    getPointFromPxPosition(x: number, y: number): IPoint {
        let resolution = this._map.resolution;
        let bbox = this.bbox;
        return new Point([
            bbox.xMin + x * resolution,
            bbox.yMax - y * resolution],
            bbox.crs
        );
    }

    /**
     * For the given point, returns the px offset on the screen from the left top corner of the map.
     * @param position - point in the map coordinates
     */
    getPxPosition(position: Coordinates): Coordinates {
        return [
            (position[0] - this.bbox.xMin) / this._map.resolution,
            (this.bbox.yMax - position[1]) / this._map.resolution
        ];
    }

    private _onMapDrag(event: DragEvent): void {
        setTimeout(() => {
            if (event.isCanceled) return;
            this._map.move(event.offset[0], event.offset[1]);
        }, 0);
    }

    private _onMapDblClick(event: sGisDoubleClickEvent): void {
        setTimeout(() => {
            if (event.isCanceled) return;
            this._map.animateSetResolution(this._map.resolution/2, event.point);
        }, 0);
    }
}
