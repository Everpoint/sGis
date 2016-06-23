sGis.module('painter.domPainter.LayerRenderer', [
    'Bbox',
    'painter.domPainter.Canvas',
    'painter.domPainter.SvgRender',
    'utils'
], (/** sGis.Bbox */ Bbox,
    /** sGis.painter.domPainter.Canvas */ Canvas,
    /** sGis.painter.domPainter.SvgRender */ SvgRender,
    /** sGis.utils */ utils) => {

    'use strict';

    var defaults = {
        /** @memberof sGis.painter.domPainter.LayerRenderer */
        delayedUpdateTime: 500
    };

    /**
     * @alias sGis.painter.domPainter.LayerRenderer
     */
    class LayerRenderer {
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
            if (useCanvas) this._canvas = new Canvas();
            
            this._bbox = new Bbox([Infinity, Infinity], [Infinity, Infinity]);
            this._featureRenders = new Map();
            this._loadingRenders = new Map();
            this._renderNodeMap = new Map();
            this._renderContainerMap = new Map();

            this._outdatedFeatureRenders = new Map();
            this._rendersForRemoval = new Map();

            this._setListeners();
            this.setIndex(index);
            
            this._forceUpdate();
        }
        
        get layer() { return this._layer; }
        
        _setListeners() {
            this._layer.on('propertyChange', () => {
                this._forceUpdate();
            });
        }
        
        _forceUpdate() {
            this.updateNeeded = true;
        }
        
        setIndex(index) {
            if (index === this._index) return;

            let zIndex = index*2;
            for (let renders of this._featureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renderNodeMap.get(render);
                    if (node) node.style.zIndex = zIndex;
                });
            }

            for (let renders of this._outdatedFeatureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renderNodeMap.get(render);
                    if (node) node.style.zIndex = zIndex;
                });
            }

            this._index = index;
            this._zIndex = zIndex;
        }
        
        clear() {
            for (let render of this._loadingRenders.keys()) {
                this._removeRender(render);
            }

            for (let feature of this._outdatedFeatureRenders.keys()) {
                this._clean(feature);
            }

            for (let feature of this._featureRenders.keys()) {
                this._removeRenders(feature);
            }

            for (let render of this._renderNodeMap.keys()) {
                this._removeRender(render);
            }
        }

        update() {
            if (this._layer.delayedUpdate) {
                if (this._updateTimer) clearTimeout(this._updateTimer);

                if (this.updateNeeded) {
                    this._rerender();
                } else {
                    this._updateTimer = setTimeout(() => { this._rerender(); }, this.delayedUpdateTime);
                }
            } else {
                this._rerender();
            }
            
            this.updateNeeded = false;
        }

        _rerender() {
            let bbox = this._master.bbox;
            let newFeatures = this._layer.getFeatures(bbox, this._master.map.resolution);
            
            for (let feature of this._featureRenders.keys()) {
                if (newFeatures.indexOf(feature) < 0) this._markForRemoval(feature);
            }

            this._bbox = bbox;
            this._canvas.reset(bbox, this._master.map.resolution, this._master.width, this._master.height);

            newFeatures.forEach(feature => {
                this._draw(feature);
            });

            if (this._canvas.isEmpty) {
                this._master.currContainer.removeNode(this._canvas.node);
            } else {
                this._master.currContainer.addNode(this._canvas.node, this._master.width, this._master.height, this._bbox);
                this.currentContainer = this._master.currContainer;
            }

            this._clean();
        }

        _featureIsLoading(feature) {
            let renders = this._featureRenders.get(feature);
            if (!renders) return false;

            for (let i = 0; i < renders.length; i++) {
                if (this._loadingRenders.has(renders[i])) return true;
            }

            return false;
        }

        _draw(feature) {
            if (this._featureIsLoading(feature)) return;

            let renders = feature.render(this._master.map.resolution, this._master.map.crs);
            let prevRenders = this._featureRenders.get(feature);
            if (prevRenders === renders) return;

            let isMixedRender = false;
            for (let i = 1; i < renders.length; i++) {
                if (renders[i].isVector !== renders[i-1].isVector) {
                    isMixedRender = true;
                    break;
                }
            }

            this._markAsOutdated(feature);
            this._featureRenders.set(feature, renders);

            for (let i = 0; i < renders.length; i++) {
                if (renders[i].isVector) {
                    if (this._useCanvas && !isMixedRender) {
                        this._canvas.draw(renders[i]);
                    } else {
                        this._drawNodeRender(new SvgRender(renders[i]), feature);
                    }
                } else {
                    this._drawNodeRender(renders[i], feature);
                }
            }
        }
        
        _drawNodeRender(render, feature) {
            this._loadingRenders.set(render, 1);
            render.getNode((error, node) => {
                this._loadingRenders.delete(render);
                if (error || !this._featureRenders.has(feature) || this._featureRenders.get(feature).indexOf(render) < 0) return;

                node.style.zIndex = this._zIndex;

                let container = this._master.currContainer;
                if (render.bbox) {
                    container.addNode(node, render.width, render.height, render.bbox);
                } else if (render.position) {
                    container.addFixedSizeNode(node, render.position);
                }

                this._renderNodeMap.set(render, node);
                this._renderContainerMap.set(render, container);
                this.currentContainer = container;

                if (render.onAfterDisplayed) render.onAfterDisplayed(node);

                this._clean(feature);
            });
        }

        get currentContainer() { return this._currentContainer; }
        set currentContainer(container) {
            if (this._currentContainer !== container) {
                this._currentContainer = container;
                this._master.resolveLayerOverlay();
            }
        }

        _clean(feature) {
            var outdated = this._outdatedFeatureRenders.get(feature);
            if (outdated) {
                outdated.forEach(render => {
                    this._removeRender(render);
                });

                this._outdatedFeatureRenders.delete(feature);
            }

            if (this._loadingRenders.size > 0) return;

            setTimeout(() => {
                for (var renders of this._rendersForRemoval.values()) {
                    renders.forEach(render => {
                        this._removeRender(render);
                    });
                }
                this._rendersForRemoval.clear();
            }, this._layer.transitionTime || 0);
        }

        _markForRemoval(feature) {
            var forRemoval = this._rendersForRemoval.get(feature) || [];

            var renders = this._featureRenders.get(feature);
            renders.forEach(render => {
                forRemoval.push(render);
            });

            this._rendersForRemoval.set(feature, forRemoval);
            this._featureRenders.delete(feature);
        }

        _markAsOutdated(feature) {
            var renders = this._featureRenders.get(feature);
            if (!renders) return;

            var outdated = this._outdatedFeatureRenders.get(feature) || [];
            renders.forEach(render => {
                outdated.push(render);
            });

            this._outdatedFeatureRenders.set(feature, outdated);
            this._featureRenders.delete(feature);
        }

        _removeRenders(feature) {
            let renders = this._featureRenders.get(feature);

            if (renders) {
                renders.forEach(render => {
                    this._removeRender(render);
                });
                this._featureRenders.delete(feature);
            }

            let outdated = this._outdatedFeatureRenders.get(feature);
            if (outdated) {
                outdated.forEach(render => {
                    this._removeRender(render);
                });
                this._outdatedFeatureRenders.delete(feature);
            }
        }

        _removeRender(render) {
            let node = this._renderNodeMap.get(render);
            if (node === undefined) return;

            let container = this._renderContainerMap.get(render);
            if (container) {
                if (node) container.removeNode(node);
                this._renderContainerMap.delete(render);
            }

            this._renderNodeMap.delete(render);
        }

        moveToLastContainer() {
            for (let renders of this._outdatedFeatureRenders.values()) {
                this._moveRendersToLastContainer(renders);
            }

            for (let renders of this._featureRenders.values()) {
                this._moveRendersToLastContainer(renders);
            }
            
            if (this._canvas.node.parentNode) {
                this._master.currContainer.addNode(this._canvas.node, this._bbox);
            }
        }

        _moveRendersToLastContainer(renders) {
            var lastContainer = this._master.currContainer;
            renders.forEach(render => {
                let node = this._renderNodeMap.get(render);
                if (node) {
                    let container = this._renderContainerMap.get(render);
                    if (container !== lastContainer) {
                        if (render.bbox) {
                            lastContainer.addNode(node, render.width, render.height, render.bbox);
                        } else if (render.position) {
                            lastContainer.addFixedSizeNode(node, render.position);
                        }
                    }

                    this._renderContainerMap.set(render, lastContainer);
                }
            });
        }
    }

    utils.extend(LayerRenderer.prototype, defaults);

    return LayerRenderer;
    
});