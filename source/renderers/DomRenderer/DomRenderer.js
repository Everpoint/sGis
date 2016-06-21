sGis.module('renderer.DomRenderer', [
    'renderer.domRenderer.LayerRenderer',
    'renderer.domRenderer.Container',
    'Point',
    'Bbox',
    'utils'
], (/** sGis.renderer.domRenderer.LayerRenderer @kind class */ LayerRenderer,
    /** sGis.renderer.domRenderer.Container */ Container,
    /** sGis.Point */ Point,
    /** sGis.Bbox */ Bbox,
    /** sGis.utils */ utils) => {
    
    'use strict';
    
    /**
     * @namespace sGis.renderer.domRenderer
     */

    var innerWrapperStyle = 'position: relative; overflow: hidden; width: 100%; height: 100%;';
    var layerWrapperStyle = 'position: absolute; width: 100%; height: 100%';

    class DomRenderer {
        constructor(map, options) {
            this._map = map;
            utils.init(this, options);

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

        get wrapper() { return this._wrapper; }
        set wrapper(node) {
            if (this._wrapper) this._clearDOM();
            this._initDOM(node);
        }
        
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
        }

        _removeLayer(layer) {
            this._layerRenderers.get(layer).clear();
            this._layerRenderers.delete(layer);
        }
        
        _setEventListeners() {
            this._map.on('layerAdd layerRemove layerOrderChange', this._updateLayerList.bind(this));
        }
        
        _repaint() {
            this._updateSize();

            if (this.isDisplayed) {
                if (this._needUpdate && this._updateAllowed) {
                    this._setNewContainer();
                    this._needUpdate = false;
                }

                this._updateBbox();


                this._map.layers.reverse().forEach(layer => {
                    this._layerRenderers.get(layer).update();
                });
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
            }
        }
        
        get bbox() {
            if (!this._bbox) this._updateBbox();
            return this._bbox;
        }
        get map() { return this._map; }
        
        get currContainer() { return this._containers[this._containers.length - 1]}

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
        }
    }

    return DomRenderer;

});