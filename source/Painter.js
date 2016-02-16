'use strict';

(function() {

    /**
     * Painter object
     * @param {sGis.Map} map for the painter to draw
     * @constructor
     */
    utils.Painter = function(map) {
        this._map = map;
        this._mapWrapper = map.layerWrapper;
        this._layerData = {};
        this._bbox = map.bbox;
        this._id = utils.getGuid();

        var self = this;
        this._map.addListener('bboxChange', function() {
            self._bboxChanged = true;

            var layers = this.layers;
            for (var i = 0, len = layers.length; i < len; i++) {
                if (!layers[i].delayedUpdate && self._layerData[layers[i].id]) self._layerData[layers[i].id].needUpdate = true;
            }
        });

        this._map.addListener('bboxChangeEnd', function() {
            var layers = self.layers;
            for (var i = 0, len = layers.length; i < len; i++) {
                if (layers[i].delayedUpdate && self._layerData[layers[i].id]) self._layerData[layers[i].id].needUpdate = true;
            }
        });

        this._map.addListener(this._listensFor.join(' ') + '.sGis-painter-' + this._id, function(sGisEvent) {
            self._handleEvent(sGisEvent);
        });

        this._map.addListener('layerOrderChange layerRemove', function(e) {
            e.layer.off('.sGis-painter-' + self._id);
            self._updateLayerOrder();
        });

        this._needUpdate = true;

        this._repaint();
    };

    utils.Painter.prototype = {
        ignoreEvents: false,

        _container: undefined,
        _oldContainer: undefined,
        _useTranslate3d: true, //sGis.browser.indexOf('Chrome') !== 0 && sGis.browser !== 'MSIE 9' && sGis.browser.indexOf('Opera') !== 0,
        _updateAllowed: true,
        _listensFor: ['click', 'dblclick', 'dragStart', 'mousemove'],

        prohibitUpdate: function() {
            this._updateAllowed = false;
        },

        allowUpdate: function() {
            this._updateAllowed = true;
        },

        redrawLayer: function(layer) {
            if (this._layerData[layer.id]) this._layerData[layer.id].needUpdate = true;
        },

        forceUpdate: function() {
            this._needUpdate = true;
        },

        _updateLayerOrder: function() {
            var layers = this.layers;
            var ids = [];
            for (var i = 0, len = layers.length; i < len; i ++) {
                var layerData = this._layerData[layers[i].id];
                if (layerData) {
                    if (layerData.zIndex !== i * 2) {
                        this._changeLayerZIndex(layers[i], i * 2);
                    }
                }
                ids.push(layers[i].id);
            }

            for (var id in this._layerData) {
                if (ids.indexOf(id) === -1) {
                    this._removeLayer(id);
                }
            }
        },

        _removeLayer: function(id) {
            var layerData = this._layerData[id];
            for (var i in layerData.displayedObjects) {
                for (var j in layerData.displayedObjects[i]) {
                    var object = layerData.displayedObjects[i][j];
                    if (object.node && object.node.parentNode) {
                        object.node.parentNode.removeChild(object.node);
                        object.node.onload = null;
                    }
                }
            }

            if (layerData.canvas && layerData.canvas.parentNode) {
                layerData.canvas.parentNode.removeChild(layerData.canvas);
            }

            delete this._layerData[id];
        },

        _changeLayerZIndex: function(layer, zIndex) {
            var layerData = this._layerData[layer.id];
            for (var i = 0, len = layerData.displayedFeatures.length; i < len; i++) {
                if (layerData.subContainers[layerData.displayedFeatures[i].id]) {
                    layerData.subContainers[layerData.displayedFeatures[i].id].container.style.zIndex = zIndex;
                }
                var displayedObjects = layerData.displayedObjects[layerData.displayedFeatures[i].id];
                if (displayedObjects) {
                    for (var j = 0, length = displayedObjects.length; j < length; j++) {
                        if (displayedObjects[j].node) {
                            displayedObjects[j].node.style.zIndex = zIndex;
                        }
                    }
                }
            }

            if (layerData.canvas) {
                layerData.canvas.style.zIndex = zIndex - 1;
            }
            layerData.zIndex = zIndex;
        },

        _repaint: function() {
            if (this._map.isDisplayed) {
                if (this._needUpdate && this._updateAllowed) {
                    this._setNewContainer();
                    this._needUpdate = false;
                } else if (this._bboxChanged) {
                    if (this._container) this._setContainerTransform(this._container);
                    if (this._oldContainer) this._setContainerTransform(this._oldContainer);
                    this._bboxChanged = false;
                }

                var layers = this.layers;
                for (var i = layers.length - 1; i >= 0; i--) {
                    if (!this._layerData[layers[i].id]) this._setLayerData(layers[i]);
                    if (this._layerData[layers[i].id].needUpdate && this._updateAllowed) this._updateLayer(layers[i]);
                }
            }

            utils.requestAnimationFrame(this._repaint.bind(this));
        },

        _setLayerData: function(layer) {
            this._layerData[layer.id] = {
                displayedFeatures: [],
                displayedObjects: {},
                loadingFeatureIds: [],
                forDeletion: [],
                needUpdate: true,
                subContainers: {},
                zIndex: this.layers.indexOf(layer) * 2
            };

            var self = this;
            layer.addListener('propertyChange.sGis-painter-' + this._id, function() {
                self._layerData[layer.id].needUpdate = true;
            });
        },

        _setNewContainer: function() {
            if (this._oldContainer) this._removeOldContainer();
            if (this._container) this._oldContainer = this._container;

            var container = document.createElement('div');
            container.style.width = '100%';
            container.style.height = '100%';
            container.width = this.width;
            container.height = this.height;
            container.style[utils.css.transformOrigin.func] = 'left top';
            container.style.position = 'absolute';
            container.bbox = this._map.bbox;
            this._setContainerTransform(container);

            this._mapWrapper.appendChild(container, this._oldContainer);
            this._container = container;
        },

        _setContainerTransform: function(container) {
            if (container.bbox.crs !== this._map.crs) {
                if (container.bbox.crs.from && this._map.crs.to) {
                    container.bbox.crs = container.bbox.projectTo(this._map.crs);
                } else {
                    this._setNewContainer();
                    var layers = this.layers;
                    for (var i = 0, len = layers.length; i < len; i++) {
                        this._removeLayerFromOldContainer(layers[i]);
                    }
                    return;
                }
            }

            var scale = this._setNodeTransform(container, this._map);
            if (container === this._container && scale !== 1) this._needUpdate = true;
        },

        _setNodeTransform: function(node, container) {
            var nodeBbox = node.bbox;
            var containerBbox = container.bbox;

            var containerResolution = container.resolution;

            if (nodeBbox) {
                if (nodeBbox.crs !== containerBbox.crs) {
                    nodeBbox = nodeBbox.projectTo(containerBbox.crs);
                }

                var nodeResolution = node.resolution || node.width ? nodeBbox.width / node.width : containerResolution;

                var sx = utils.normolize(nodeResolution / containerResolution);
                var sy = sx;

                var tx = this._browserAdj(utils.normolize((nodeBbox.p[0].x - containerBbox.p[0].x) / containerResolution));
                var ty = this._browserAdj(utils.normolize((-nodeBbox.p[1].y + containerBbox.p[1].y) / containerResolution));
            } else {
                var sx = 1,
                    sy = 1;

                var tx = this._browserAdj(node.position[0] - containerBbox.p[0].x / containerResolution);
                var ty = this._browserAdj(node.position[1] + containerBbox.p[1].y / containerResolution);
            }

            if (this._useTranslate3d) {
                node.style[utils.css.transform.func] = 'translate3d(' + tx + 'px, ' + ty + 'px, 0px) scale(' + sx.toPrecision(6) + ', ' + sy.toPrecision(6) + ')';
            } else {
                node.style[utils.css.transform.func] = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + sx.toPrecision(6) + ', ' + sy.toPrecision(6) + ')';
            }

            if (!node.resolution) node.resolution = nodeResolution;

            return sx;
        },

        _browserAdj: function(n) {
            if (!sGis.isIE) {
                return Math.round(n);
            }
            return n;
        },

        _removeOldContainer: function() {
            var layers = this.layers;
            for (var i = 0; i < layers.length; i++) {
                this._moveLayerToCurrentWrapper(layers[i]);
            }

            this._mapWrapper.removeChild(this._oldContainer);
            this._oldContainer = null;
        },

        _updateLayer: function(layer) {
            var bbox = this._map.bbox;
            var resolution = this.resolution;
            var features = layer.getFeatures(bbox, resolution);
            var layerData = this._layerData[layer.id];
            var displayedFeatures = layerData.displayedFeatures.slice();

            for (var i = 0, len = displayedFeatures.length; i < len; i++) {
                if (features.indexOf(displayedFeatures[i]) === -1) {
                    this._removeFeature(displayedFeatures[i], layer);
                }
            }

            if (layerData.canvas) this._resetCanvas(layerData);


            for (var i = 0, len = features.length; i < len; i++) {
                var loadingIndex = layerData.loadingFeatureIds.indexOf(features[i].id);
                if (loadingIndex === -1) {
                    this._drawFeature(features[i], layer);
                }
            }

            if (layerData.forDeletion.length > 0 && this._fullyDrawn(layer)) {
                this._removeLayerFromOldContainer(layer);
            }

            if (layerData.canvas && layerData.canvas.isUsed) {
                this._container.appendChild(layerData.canvas);
            }

            layerData.needUpdate = false;
        },

        _removeFeature: function(feature, layer) {
            var layerData = this._layerData[layer.id];
            var index = layerData.displayedFeatures.indexOf(feature);
            if (layerData.displayedObjects[feature.id]) {
                for (var i = 0, len = layerData.displayedObjects[feature.id].length; i < len; i++) {
                    var node = layerData.displayedObjects[feature.id][i].node;
                    if (node && node.parentNode) {
                        if (node.parentNode === this._container || !layerData.displayedObjects[feature.id][i].persistent) {
                            node.parentNode.removeChild(node);
                        } else {
                            layerData.forDeletion.push(node);
                        }
                    } else {
                        this._removeFromLoadingList(feature, layer);
                    }
                }

                if (layerData.subContainers[feature.id]) {
                    if (layerData.subContainers[feature.id].container.parentNode) layerData.subContainers[feature.id].container.parentNode.removeChild(layerData.subContainers[feature.id].container);
                    delete layerData.subContainers[feature.id];
                }
                delete layerData.displayedObjects[feature.id];
            }

            layerData.displayedFeatures.splice(index, 1);
        },

        _removeFromLoadingList: function(feature, layer) {
            var layerData = this._layerData[layer.id];
            if (layerData) {
                var loadingIndex = layerData.loadingFeatureIds.indexOf(feature.id);
                if (loadingIndex !== -1) layerData.loadingFeatureIds.splice(loadingIndex, 1);
            }
        },

        _fullyDrawn: function(layer) {
            var layerData = this._layerData[layer.id];
            var fullyDrawn = true;
            for (var i = 0, len = layerData.displayedFeatures.length; i < len; i++) {
                if (!layerData.displayedObjects[layerData.displayedFeatures[i].id]) {
                    fullyDrawn = false;
                }
            }

            return fullyDrawn;
        },

        _removeLayerFromOldContainer: function(layer) {
            var self = this;
            setTimeout(function() {
                var layerData = self._layerData[layer.id];
                var forDeletion = layerData.forDeletion.slice();
                for (var i = 0, len = forDeletion.length; i < len; i++) {
                    if (forDeletion[i].parentNode) forDeletion[i].parentNode.removeChild(forDeletion[i]);
                }

                layerData.forDeletion = [];

                if (self._oldContainer && self._oldContainer.childNodes.length === 0) {
                    self._removeOldContainer();
                }
            }, layer.transitionTime || 0);
        },

        _drawFeature: function(feature, layer) {
            var render = feature.render(this.resolution, this._map.crs);
            var displayedObjects = this._layerData[layer.id].displayedObjects[feature.id];
            if (displayedObjects === render) {
                //TODO
                return;
            }

            var isMixed = false;
            for (var i = 1, len = render.length; i < len; i++) {
                if (toDrawOnCanvas(render[i]) !== toDrawOnCanvas(render[0])) {
                    isMixed = true;
                    break;
                }
            }

            if (this._layerData[layer.id].displayedFeatures.indexOf(feature) === -1) this._layerData[layer.id].displayedFeatures.push(feature);

            if (isMixed) {
                this._drawMixedRender(render, feature, layer);
            } else if (render.length > 0) {
                if (this._layerData[layer.id].subContainers[feature.id]) {
                    this._removeSubContainer(layer, feature);
                }

                if (toDrawOnCanvas(render[0])) {
                    this._drawGeometry(render, feature, layer);
                } else {
                    this._drawNodes(render, feature, layer);
                }
            } else {
                this._removeFeature(feature, layer);
            }
        },

        _drawNodes: function(render, feature, layer) {
            var layerData = this._layerData[layer.id];
            var displayedObjects = layerData.displayedObjects[feature.id] || [];

            var displayed = false;
            for (var i = 0, len = render.length; i < len; i++) {
                if (displayedObjects.indexOf(render[i]) === -1) {
                    displayed = this._drawNode(render[i], feature, layer);
                }
            }

            if (displayed) {
                displayedObjects = layerData.displayedObjects[feature.id];
                if (displayedObjects) {
                    while (displayedObjects.length > 0) {
                        if (displayedObjects[0].node.parentNode) displayedObjects[0].node.parentNode.removeChild(displayedObjects[0].node);
                        displayedObjects.splice(0, 1);
                    }
                }
                layerData.displayedObjects[feature.id] = render;
            }

            layerData.needUpdate = false;
        },

        _drawNode: function(render, feature, layer, container) {
            var layerData = this._layerData[layer.id];
            var self = this;
            if (utils.isImage(render.node) && !render.node.complete) {
                layerData.loadingFeatureIds.push(feature.id);
                render.node.onload = function() {
                    self._removeFromLoadingList(feature, layer);
                    layerData.needUpdate = true;
                };
                render.node.onerror = function() {
                    render.error = true;
                    self._removeFromLoadingList(feature, layer);
                };
            } else {
                if (!render.error) {
                    this._displayNode(render, feature, layer, container);
                    return true;
                }
            }
        },

        _displayNode: function(render, feature, layer, container) {
            var layerData = this._layerData[layer.id];
            container = container || this._container;

            if (layerData.displayedFeatures.indexOf(feature) !== -1 && (render.node.position || render.node.bbox.crs === this._container.bbox.crs || render.node.bbox.crs.from && this._container.bbox.crs.to)) {
                this._resolveLayerOverlay(layer);
                this._setNodeStyles(render.node, layer);
                this._setNodeTransform(render.node, this._container);
                container.appendChild(render.node);
                if (render.onAfterDisplay) render.onAfterDisplay();
                layerData.currentContainer = this._container;

                var forDeletionIndex = layerData.forDeletion.indexOf(render.node);
                if (forDeletionIndex !== -1) {
                    layerData.forDeletion.splice(forDeletionIndex, 1);
                }
            }
        },

        _resolveLayerOverlay: function(layer) {
            var layers = this.layers;
            var index = layers.indexOf(layer);
            for (var i = index + 1, len = layers.length; i < len; i++) {
                this._moveLayerToCurrentWrapper(layers[i]);
            }
        },

        _moveLayerToCurrentWrapper: function(layer) {
            var layerData = this._layerData[layer.id];
            if (!layerData) return;
            for (var i = 0, length = layerData.displayedFeatures.length; i < length; i++) {
                var subContainer = layerData.subContainers[layerData.displayedFeatures[i].id];
                if (subContainer) {
                    if (subContainer.container.parentNode && subContainer.container.parentNode !== this._container) {
                        subContainer.container.parentNode.removeChild(subContainer.container);
                        this._setNodeTransform(subContainer.canvas, this._container);
                        this._container.appendChild(subContainer.container);
                    }
                }
                var objects = layerData.displayedObjects[layerData.displayedFeatures[i].id];
                if (objects) {
                    for (var j = 0, len = objects.length; j < len; j++) {
                        if (objects[j].node && objects[j].node.parentNode && objects[j].node.parentNode !== this._container) {
                            objects[j].node.parentNode.removeChild(objects[j].node);
                            this._displayNode(objects[j], layerData.displayedFeatures[i], layer, subContainer && subContainer.container);
                        }
                    }
                }
            }

            var canvas = layerData.canvas;
            if (canvas && canvas.parentNode && canvas.parentNode !== this._container) {
                canvas.parentNode.removeChild(canvas);
                this._setNodeTransform(canvas, this._container);
                this._container.appendChild(canvas);
            }
        },

        _drawGeometry: function(render, feature, layer) {
            var layerData = this._layerData[layer.id];
            var ctx;
            if (layerData.subContainers[feature.id]) {
                ctx = layerData.subContainers[feature.id].ctx;
            } else {
                if (!layerData.canvas) this._setNewCanvas(layerData);
                ctx = layerData.ctx;
                layerData.canvas.isUsed = true;
            }

            for (var i = 0, len = render.length; i < len; i++) {
                this._drawElement(render[i], ctx);
            }

            layerData.displayedObjects[feature.id] = render;
        },

        _setNewCanvas: function(layerData) {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.zIndex = layerData.zIndex - 1;
            canvas.style.position = 'absolute';
            canvas.style.transformOrigin = 'left top';
            canvas.style.pointerEvents = 'none';

            layerData.canvas = canvas;

            layerData.ctx = canvas.getContext('2d');
            this._setCanvasOrigin(layerData);
        },

        _resetCanvas: function(layerData) {
            if (layerData.canvas.parentNode) {
                layerData.canvas.parentNode.removeChild(layerData.canvas);
            }
            layerData.canvas.width = this.width;
            layerData.canvas.height = this.height;
            this._setCanvasOrigin(layerData);
            layerData.canvas.isUsed = false;
        },

        _setCanvasOrigin: function(layerData) {
            var bbox = this._map.bbox;
            var resolution = this.resolution;
            var xOrigin = bbox.p[0].x / resolution;
            var yOrigin = -bbox.p[1].y / resolution;
            layerData.ctx.translate(-xOrigin, -yOrigin);
            layerData.canvas.bbox = bbox;

            this._setNodeTransform(layerData.canvas, this._container);
        },

        _drawElement: function(geometry, ctx) {
            if (geometry instanceof sGis.geom.Polyline) {
                this._drawPolyline(geometry, ctx);
            } else if (geometry instanceof sGis.geom.Arc) {
                this._drawArc(geometry, ctx);
            } else if (geometry.node && utils.isImage(geometry.node) && geometry.node.position) {
                this._drawImage(geometry.node, ctx);
            }
        },

        _drawImage: function(image, ctx) {
            ctx.drawImage(image, image.position[0], image.position[1], image.width, image.height);
        },

        _drawPolyline: function(geometry, ctx) {
            var coordinates = geometry.coordinates;

            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = geometry.width;
            ctx.strokeStyle = geometry.color;

            for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
                ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
                for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                    ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
                }

                if (geometry instanceof sGis.geom.Polygon) {
                    ctx.closePath();
                }
            }

            if (geometry instanceof sGis.geom.Polygon) {
                if (geometry.fillStyle === 'color') {
                    ctx.fillStyle = geometry.fillColor;
                } else if (geometry.fillStyle === 'image') {
                    ctx.fillStyle = ctx.createPattern(geometry.fillImage, 'repeat');
                    var patternOffsetX = (coordinates[0][0][0]) % geometry.fillImage.width,
                        patternOffsetY = (coordinates[0][0][1]) % geometry.fillImage.height;
                    ctx.translate(patternOffsetX, patternOffsetY);
                }
                ctx.fill();

                //if (patternOffsetX) {
                    ctx.translate(-patternOffsetX, -patternOffsetY);
                //}
            }

            ctx.stroke();
        },

        _drawArc: function(arc, ctx) {
            var center = arc.center;

            ctx.beginPath();
            ctx.lineWidth = arc.strokeWidth;
            ctx.strokeStyle = arc.strokeColor;
            ctx.fillStyle = arc.fillColor;

            ctx.arc(center[0], center[1], arc.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        },

        _drawMixedRender: function(render, feature, layer) {
            var layerData = this._layerData[layer.id];
            var subContainer = layerData.subContainers[feature.id];
            if (subContainer) {
                this._resetCanvas(subContainer);
                subContainer.container.innerHTML = '';

                if (subContainer.container.parentNode !== this._container) {
                    this._container.appendChild(subContainer.container);
                }
            } else {
                layerData.subContainers[feature.id] = {};
                subContainer = layerData.subContainers[feature.id];
                subContainer.container = document.createElement('div');
                this._setNodeStyles(subContainer.container, layer);
                this._setNewCanvas(subContainer);
                subContainer.canvas.style.zIndex = -1;

                this._container.appendChild(subContainer.container);
            }

            var geometry = [];
            for (var i = 0, len = render.length; i < len; i++) {
                if (!toDrawOnCanvas(render[i]) && !render[i].node.parent) {
                    this._drawNode(render[i], feature, layer, subContainer.container);
                } else {
                    geometry.push(render[i]);
                }
            }
            this._drawGeometry(geometry, feature, layer, subContainer.canvas);
            subContainer.container.appendChild(subContainer.canvas);

            layerData.displayedObjects[feature.id] = render;
        },

        _removeSubContainer: function(layer, feature) {
            var layerData = this._layerData[layer.id];
            var subContainer = layerData.subContainers[feature.id];
            if (subContainer.container.parentNode) {
                subContainer.container.parentNode.removeChild(subContainer.container);
            }

            delete layerData.displayedObjects[feature.id];
            delete layerData.subContainers[feature.id];
        },

        _setNodeStyles: function(node, layer) {
            node.style[utils.css.transformOrigin.func] = 'left top';
            node.style.position = 'absolute';
            node.style.zIndex = this._layerData[layer.id].zIndex;
        },

        _handleEvent: function(sGisEvent) {
            if (this.ignoreEvents) return;

            var layers = this.layers;
            var position = sGisEvent.position;

            var eventObject = {
                point: sGisEvent.point,
                position: position,
                mouseOffset: sGisEvent.mouseOffset,
                browserEvent: sGisEvent.browserEvent
            };

            for (var i = layers.length - 1; i >= 0; i--) {
                if (!this._layerData[layers[i].id]) continue;

                var displayedFeatures = this._layerData[layers[i].id].displayedFeatures;
                for (var j = displayedFeatures.length - 1; j >= 0; j--) {
                    if (displayedFeatures[j].hasListeners(sGisEvent.eventType) || sGisEvent.eventType === 'mousemove' && (displayedFeatures[j].hasListeners('mouseout') || displayedFeatures[j].hasListeners('mouseover'))) {
                        var objects = this._layerData[layers[i].id].displayedObjects[displayedFeatures[j].id];
                        if (objects) {
                            for (var k = objects.length - 1; k >= 0; k--) {
                                if (objects[k].ignoreEvents) continue;

                                var intersectionType = contains(objects[k], position);

                                if (intersectionType) {
                                    sGisEvent.intersectionType = intersectionType;
                                    displayedFeatures[j].forwardEvent(sGisEvent);

                                    if (sGisEvent.eventType === 'mousemove' && this._mouseOverFeature !== displayedFeatures[j]) {
                                        if (this._mouseOverFeature) this._mouseOverFeature.fire('mouseout', eventObject);

                                        this._mouseOverFeature = displayedFeatures[j];
                                        this._mouseOverFeature.fire('mouseover', eventObject);
                                    }

                                    return;
                                }
                            }
                        }
                    }
                }
            }

            if (sGisEvent.eventType === 'mousemove' && this._mouseOverFeature) {
                this._mouseOverFeature.fire('mouseout', eventObject);
                this._mouseOverFeature = null;
            }
        }
    };


    function contains(geometry, position) {
        var intersectionType;
        if (!(geometry instanceof sGis.geom.Arc || geometry instanceof sGis.geom.Polyline) && geometry.node) {
            var geometryPosition = geometry.node.position || [geometry.bbox.width / geometry.resolution, geometry.bbox.height / geometry.resolution];
            var width = geometry.node.clientWidth || geometry.node.width;
            var height = geometry.node.clientHeight || geometry.node.height;
            intersectionType = geometryPosition[0] < position.x && (geometryPosition[0] + width) > position.x &&
            geometryPosition[1] < position.y && (geometryPosition[1] + height) > position.y;
        } else {
            intersectionType = geometry.contains(position);
        }

        return intersectionType;
    }


    Object.defineProperties(utils.Painter.prototype, {
        layers: {
            get: function() {
                return this._map.layers;
            }
        },

        width: {
            get: function() {
                return this._map.width;
            }
        },

        height: {
            get: function() {
                return this._map.height;
            }
        },

        resolution: {
            get: function() {
                return this._map.resolution;
            }
        }
    });

    sGis.utils.proto.setMethods(utils.Painter.prototype, sGis.IEventHandler);

    function toDrawOnCanvas(object) {
        return sGis.useCanvas && (object instanceof sGis.geom.Arc || object instanceof sGis.geom.Polyline || object.renderToCanvas);
    }

})();