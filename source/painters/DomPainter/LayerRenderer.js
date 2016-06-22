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
            this._outdatedFeatureRenders = new Map();
            this._renders = new Map();
            this._containerIndex = new Map();
            this._loading = [];

            this._forDeletion = [];

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
                    let node = this._renders.get(render);
                    if (node) node.style.zIndex = zIndex;
                });
            }

            this._index = index;
            this._zIndex = zIndex;
        }
        
        clear() {
            for (let feature of this._featureRenders.keys()) {
                this._remove(feature);
            }

            this._featureRenders.clear();
            this._renders.clear();
            this._containerIndex.clear();
            this._outdatedFeatureRenders.clear();
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
                if (newFeatures.indexOf(feature) < 0 && this._forDeletion.indexOf(feature) < 0) this._forDeletion.push(feature);
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
                if (this._loading.indexOf(renders[i]) > 0) return true;
            }
        }

        _draw(feature) {
            var removeIndex = this._forDeletion.indexOf(feature);
            if (removeIndex > 0) {
                this._forDeletion.splice(removeIndex, 1);
            }

            if (this._featureIsLoading(feature)) return;

            let renders = feature.render(this._master.map.resolution, this._master.map.crs);
            let prevRenders = this._featureRenders.get(feature);
            if (prevRenders === renders) return;

            this._cleanupFeature(feature);
            this._outdatedFeatureRenders.set(feature, prevRenders);

            let isMixedRender = false;
            for (let i = 1; i < renders.length; i++) {
                if (renders[i].isVector !== renders[i-1].isVector) {
                    isMixedRender = true;
                    break;
                }
            }

            this._featureRenders.set(feature, renders);

            for (let i = 0; i < renders.length; i++) {
                if (renders[i].isVector) {
                    if (this._useCanvas && !isMixedRender) {
                        this._canvas.draw(renders[i]);
                        this._cleanupFeature(feature);
                    } else {
                        this._drawNodeRender(new SvgRender(renders[i]), feature);
                    }
                } else {
                    this._drawNodeRender(renders[i], feature);
                }
            }
        }
        
        _drawNodeRender(render, baseFeature) {
            this._loading.push(render);
            render.getNode((error, node) => {
                let loadingIndex = this._loading.indexOf(render);
                this._cleanupFeature(baseFeature);

                this._loading.splice(loadingIndex, 1);

                if (error || !this._renders.has(render)) {
                    return;
                }

                node.style.zIndex = this._zIndex;

                let container = this._master.currContainer;
                if (render.bbox) {
                    container.addNode(node, render.width, render.height, render.bbox);
                } else if (render.position) {
                    container.addFixedSizeNode(node, render.position);
                }
                this._renders.set(render, node);
                this._containerIndex.set(render, container);
                this.currentContainer = container;

                if (render.onAfterDisplayed) render.onAfterDisplayed(node);

                this._clean();
                this._draw(baseFeature);
            });

            this._renders.set(render, null);
        }

        _cleanupFeature(feature) {
            var renders = this._outdatedFeatureRenders.get(feature);
            if (renders === undefined) return;
            renders.forEach(render => {
                this._removeRender(render);
            });

            this._outdatedFeatureRenders.delete(feature);
        }
        
        get currentContainer() { return this._currentContainer; }
        set currentContainer(container) {
            if (this._currentContainer !== container) {
                this._currentContainer = container;
                this._master.resolveLayerOverlay();
            }
        }

        _clean() {
            if (this._forDeletion.length === 0 || this._loading.length !== 0) return;

            setTimeout(() => {
                while(this._forDeletion.length > 0) {
                    this._remove(this._forDeletion.pop());
                }
            }, this._layer.transitionTime || 0);
        }

        _remove(feature) {
            this._cleanupFeature(feature);
            this._removeRenders(feature);
            this._featureRenders.delete(feature);
        }

        _removeRenders(feature) {
            let renders = this._featureRenders.get(feature);
            if (!renders) return;

            renders.forEach(render => {
                this._removeRender(render);
            });
        }

        _removeRender(render) {
            let node = this._renders.get(render);
            if (node === undefined) return;

            let container = this._containerIndex.get(render);
            if (container) {
                if (node) container.removeNode(node);
                this._containerIndex.delete(render);
            }

            this._renders.delete(render);
        }

        moveToLastContainer() {
            var lastContainer = this._master.currContainer;
            for (let renders of this._featureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renders.get(render);
                    if (node) {
                        let container = this._containerIndex.get(render);
                        if (container !== lastContainer) {
                            if (render.bbox) {
                                lastContainer.addNode(node, render.width, render.height, render.bbox);
                            } else if (render.position) {
                                lastContainer.addFixedSizeNode(node, render.position);
                            }
                        }
                    }
                });
            }
            
            if (this._canvas.node.parent) {
                lastContainer.addNode(this._canvas.node, this._bbox);
            }
        }
    }

    utils.extend(LayerRenderer.prototype, defaults);

    return LayerRenderer;
    
});