import {Point} from "../../Point";
import {EventDispatcher} from "./EventDispatcher";
import {LayerRenderer} from "./LayerRenderer";
import {Container} from "./Container";
import {Map as sGisMap} from "../../Map";
import {Layer} from "../../Layer";
import {Bbox} from "../../Bbox";
import {error, warn} from "../../utils/utils";
import {softEquals} from "../../utils/math";
import {Coordinates} from "../../baseTypes";

let innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
let layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';

export class DomPainter {
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
    private _layerWrapper: HTMLElement;
    private _innerWrapper: HTMLElement;

    private _width: number;
    private _height: number;
    private _bboxWidth: number;
    private _bboxHeight: number;
    private _bbox: Bbox;

    /**
     * @constructor
     * @param {sGis.Map} map - the map to be drawn.
     * @param {Object} options - key-value list of properties to be assigned to the instance.
     */
    constructor(map, options) {
        this._map = map;
        Object.assign(this, options);

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
     * @type HTMLElement|String
     */
    get wrapper() { return this._wrapper; }
    set wrapper(/** HTMLElement|String */ node) {
        if (this._wrapper) this._clearDOM();
        if (node) {
            this._initDOM(node);
            this._eventDispatcher = new EventDispatcher(this._layerWrapper, this);
            this._needUpdate = true;
            this._redrawNeeded = true;
        }
    }

    get layerRenderers() { return Array.from(this._layerRenderers.values()); }

    /**
     * Sets position and resolution of the map to show the full bounding box in the center of the map
     * @param {sGis.Bbox} bbox
     * @param {Boolean} [animate=true] - if set to true, the position will be changed gradually with animation.
     */
    show(bbox, animate = true) {
        let projected = bbox.projectTo(this.map.crs);
        let xResolution = projected.width / this.width;
        let yResolution = projected.height / this.height;

        let method = animate ? 'animateTo' : 'setPosition';

        let center = projected.center;
        this.map[method](center, this.map.getAdjustedResolution(Math.max(xResolution, yResolution)));

        return new Bbox([center.x - this.width * xResolution, center.y - this.height * yResolution],
                        [center.x + this.width * xResolution, center.y + this.height * yResolution], this.map.crs);
    }

    _updateLayerList() {
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

    _addLayer(layer, index) {
        this._layerRenderers.set(layer, new LayerRenderer(this, layer, index));
    }

    _removeLayer(layer) {
        this._layerRenderers.get(layer).clear();
        this._layerRenderers.delete(layer);
    }

    _setEventListeners() {
        this._map.on('contentsChange', this._updateLayerList.bind(this));
        this._map.on('drag', this._onMapDrag.bind(this));
        this._map.on('dblclick', this._onMapDblClick.bind(this));
        this._map.on('animationStart', this.forbidUpdate.bind(this));
        this._map.on('animationEnd', this.allowUpdate.bind(this));
    }

    /**
     * Prevents the map to be redrawn.
     */
    forbidUpdate() {
        this._updateAllowed = false;
    }

    /**
     * Allows redrawing of the map again after .forbidUpdate() has been called.
     */
    allowUpdate() {
        this._updateAllowed = true;
    }

    _repaint() {
        this._updateSize();

        if (this.isDisplayed) {
            if (this._needUpdate && this._updateAllowed) {
                this._setNewContainer();
                this._needUpdate = false;
            }

            this._updateBbox();

            if (this._updateAllowed) {
                this._map.getLayers(true, true).reverse().forEach(layer => {
                    let renderer = this._layerRenderers.get(layer);
                    if (this._redrawNeeded || renderer.updateNeeded) {
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
        }

        requestAnimationFrame(this._repaintBound);
    }

    _setNewContainer() {
        this._containers.push(new Container(this._layerWrapper, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
    }

    _removeEmptyContainers() {
        // Check all containers except the last one, for we never remove it
        for (let i = this._containers.length - 2; i >= 0; i--) {
            if (this._containers[i].isEmpty) {
                this._removeContainer(i);
            }
        }
    }

    _removeContainer(i) {
        this._containers[i].remove();
        this._containers.splice(i, 1);
    }

    _updateSize() {
        this._width = this._wrapper ? this._wrapper.clientWidth || this._wrapper.offsetWidth : 0;
        this._height = this._wrapper ? this._wrapper.clientHeight || this._wrapper.offsetHeight : 0;
    }

    /**
     * Returns true is the map is currently displayed in the DOM>
     * @type Boolean
     * @readonly
     */
    get isDisplayed() { return this._width && this._height; }

    _updateBbox() {
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
     * @type sGis.Bbox
     * @readonly
     */
    get bbox() {
        if (!this._bbox) this._updateBbox();
        return this._bbox;
    }

    /**
     * The map this painter draws.
     * @type sGis.Map
     * @readonly
     */
    get map() { return this._map; }

    get currContainer() { return this._containers[this._containers.length - 1]}

    /**
     * Width of the map on the screen in pixels.
     * @type Number
     * @readonly
     */
    get width() { return this._width; }

    /**
     * Height of the map on the screen in pixels.
     * @type Number
     * @readonly
     */
    get height() { return this._height; }

    _initDOM(node) {
        let wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
        if (!wrapper) error('The element with ID "' + node + '" is not found.');

        this._innerWrapper = document.createElement('div');
        this._innerWrapper.style.cssText = innerWrapperStyle;
        wrapper.appendChild(this._innerWrapper);

        this._layerWrapper = document.createElement('div');
        this._layerWrapper.style.cssText = layerWrapperStyle;
        this._innerWrapper.appendChild(this._layerWrapper);

        this._wrapper = wrapper;
    }

    _clearDOM() {
        if (this._innerWrapper.parentNode) this._innerWrapper.parentNode.removeChild(this._innerWrapper);
        this._innerWrapper = null;
        this._layerWrapper = null;
        this._wrapper = null;

        this._eventDispatcher.remove();
        this._eventDispatcher = null;

        this._clearContainers();
    }

    _clearContainers() {
        this._containers.forEach((container, i) => {
            this._removeContainer(i);
        });
    }

    get innerWrapper() { return this._innerWrapper; }

    resolveLayerOverlay() {
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
     * @param {Number} x
     * @param {Number} y
     * @returns {sGis.Point}
     */
    getPointFromPxPosition(x, y) {
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
     * @param {Number[]} position - point in the map coordinates [x, y]
     * @returns {{x: number, y: number}}
     */
    getPxPosition(position) {
        return {
            x: (position[0] - this.bbox.xMin) / this._map.resolution,
            y: (this.bbox.yMax - position[1]) / this._map.resolution
        };
    }

    _onMapDrag(sGisEvent) {
        setTimeout(() => {
            if (sGisEvent.isCanceled()) return;
            this._map.move(sGisEvent.offset.x, sGisEvent.offset.y);
        }, 0);
    }

    _onMapDblClick(sGisEvent) {
        setTimeout(() => {
            if (sGisEvent.isCanceled()) return;
            this._map.animateSetResolution(this._map.resolution/2, sGisEvent.point);
        }, 0);
    }
}
