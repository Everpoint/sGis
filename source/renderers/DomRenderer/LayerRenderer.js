sGis.module('renderer.domRenderer.LayerRenderer', [
    'Bbox',
    'renderer.domRenderer.Canvas',
    'renderer.domRenderer.SvgRender'
], (/** sGis.Bbox */ Bbox,
    /** sGis.renderer.domRenderer.Canvas */ Canvas,
    /** sGis.renderer.domRenderer.SvgRender */ SvgRender) => {

    'use strict';
    
    /**
     * @alias sGis.renderer.domRenderer.LayerRenderer
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
            this._renders = new Map();
            this._containerIndex = new Map();
            this._loading = [];

            this._forDeletion = [];

            this.setIndex(index);
        }
        
        get layer() { return this._layer; }
        
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
            for (let renders of this._featureRenders.values()) {
                renders.forEach(render => {
                    let node = this._renders.get(render);
                    if (node) {
                        let container = this._containerIndex.get(render);
                        container.removeNode(node);
                    }
                });
            }

            this._featureRenders.clear();
            this._renders.clear();
            this._containerIndex.clear();
        }
        
        update() {
            let bbox = this._master.bbox;
            if (bbox.equals(this._bbox)) return;

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
                this._master.currContainer.addNode(this._canvas.node, this._bbox);
                this.currentContainer = this._master.currContainer;
            }
        }
        
        _draw(feature) {
            let renders = feature.render(this._master.map.resolution, this._master.map.crs);
            if (this._featureRenders.get(feature) === renders) return;

            let isMixedRender = false;
            for (let i = 1; i < renders.length; i++) {
                if (renders[i].isVector !== renders[i-1].isVector) {
                    isMixedRender = true;
                    break;
                }
            }
            
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
        
        _drawNodeRender(render, baseFeature) {
            this._loading.push(render);
            render.getNode((error, node) => {
                let loadingIndex = this._loading.indexOf(render);
                this._remove(baseFeature);

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
            });

            this._renders.set(render, null);
        }
        
        get currentContainer() { return this._currentContainer; }
        set currentContainer(container) {
            if (this._currentContainer !== container) {
                this._currentContainer = container;
                this._master.resolveLayerOverlay();
            }
        }

        _clean() {
            if (this._loading.length !== 0) return;

            for (let i = this._forDeletion.length - 1; i >= 0; i--) {
                this._remove(this._forDeletion[i]);
            }
        }

        _remove(feature) {
            let renders = this._featureRenders.get(feature);
            if (!renders) return;

            renders.forEach(render => {
                let node = this._renders.get(render);
                if (!node) return;

                let container = this._containerIndex.get(render);
                container.removeNode(node);

                this._renders.delete(render);
                this._containerIndex.delete(render);
            });

            this._featureRenders.delete(feature);
        }

        moveToLastContainer() {
            var lastContainer = this._master.currentContainer;
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
    
    return LayerRenderer;
    
});