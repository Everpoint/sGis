sGis.module('painter.DomPainter', [
    'painter.domPainter.LayerRenderer',
    'painter.domPainter.Container',
    'painter.domPainter.EventDispatcher',
    'Point',
    'Bbox',
    'utils'
], (/** sGis.painter.domPainter.LayerRenderer */ LayerRenderer,
    /** sGis.painter.domPainter.Container */ Container,
    /** sGis.painter.domPainter.EventDispatcher */ EventDispatcher,
    /** sGis.Point */ Point,
    /** sGis.Bbox */ Bbox,
    /** sGis.utils */ utils) => {
    
    'use strict';
    
    /**
     * @namespace sGis.painter.domPainter
     */

    var innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
    var layerWrapperStyle = 'position: absolute; width: 100%; height: 100%; z-index: 0;';

    /**
     * @alias sGis.painter.DomPainter
     */
    class DomRenderer {
        /**
         * @constructor
         * @param {sGis.Map} map - the map to be drawn.
         * @param {Object} options - key-value list of properties to be assigned to the instance.
         */
        constructor(map, options) {
            this._map = map;
            utils.init(this, options, true);

            this._layerRenderers = new Map();
            this._containers = [];

            this._position = new Point(Infinity, Infinity);
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
                this._eventDispatcher = new EventDispatcher(this._innerWrapper, this);
            }
        }

        get layerRenderers() { return Array.from(this._layerRenderers.values()); }
        
        _updateLayerList() {
            var mapLayers = this._map.layers;
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
            this._redrawNeeded = true;
        }

        _removeLayer(layer) {
            this._layerRenderers.get(layer).clear();
            this._layerRenderers.delete(layer);
        }
        
        _setEventListeners() {
            this._map.on('layerAdd layerRemove layerOrderChange', this._updateLayerList.bind(this));
            this._map.on('drag', this._onMapDrag.bind(this));
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
                    this._map.layers.reverse().forEach(layer => {
                        let renderer = this._layerRenderers.get(layer);
                        if (this._redrawNeeded || renderer.updateNeeded) {
                            renderer.update();
                        }
                    });

                    this._redrawNeeded = false;
                }
            }

            utils.requestAnimationFrame(this._repaintBound);
        }
        
        _setNewContainer() {
            this._containers.push(new Container(this._layerWrapper, this.bbox, this._map.resolution, this._removeEmptyContainers.bind(this)));
        }

        _removeEmptyContainers() {
            // Check all containers except the last one, for we never remove it
            for (let i = this._containers.length - 2; i >= 0; i--) {
                if (this._containers[i].isEmpty) {
                    this._containers[i].remove();
                    this._containers.splice(i, 1);
                }
            }
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
            if (!mapPosition.equals(this._position) || !utils.softEquals(this._map.resolution, this._resolution)) {
                this._position = mapPosition;
                this._resolution = this._map.resolution;

                let dx = this._width * this._resolution / 2;
                let dy = this._height * this._resolution / 2;
                
                this._bbox = new Bbox([mapPosition.x - dx, mapPosition.y - dy], [mapPosition.x + dx, mapPosition.y + dy], mapPosition.crs);

                this._containers.forEach(container => {
                    container.updateTransform(this._bbox, this._resolution);
                });
                
                if (this._containers.length > 0 && this._containers[this._containers.length - 1].scale !== 1) this._needUpdate = true;

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
            var wrapper = node instanceof HTMLElement ? node : document.getElementById(node);
            if (!wrapper) utils.error('The element with ID "' + node + '" is not found.');

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
        }

        resolveLayerOverlay() {
            var prevContainerIndex = 0;
            this._map.layers.forEach(layer => {
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
            var resolution = this._map.resolution;
            var bbox = this.bbox;
            return new sGis.Point(
                bbox.xMin + x * resolution,
                bbox.yMax - y * resolution,
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
    }

    return DomRenderer;

});