'use strict';

(function() {

    var PREFIX = 'sGis-control-edit-';

    sGis.controls.Editor = function(map, properties) {
        if (!(map instanceof sGis.Map)) utils.error('sGis.Map is expected but got ' + map + ' instead');

        this._map = map;
        this._id = utils.getGuid();

        this._ns = PREFIX + this._id;
        this._currentState = -1;
        this._states = [];
        this._featureStates = {};

        sGis.utils.init(this, properties);
    };

    sGis.controls.Editor.prototype = new sGis.Control({
        _translateControlSymbol: sGis.symbol.point.Square,

        activate: function() {
            if (!this._isActive) {
                this._setEventListeners();
                this._isActive = true;
            }
        },

        deactivate: function() {
            if (this._isActive) {
                this._removeEventListeners();
                this.deselect();
                this.clearStateList();
                this._isActive = false;
            }
        },

        _setEventListeners: function() {
            if (this._activeLayer) {
                var features = this._activeLayer.features;
                for (var i = 0; i < features.length; i++) {
                    this._setFeatureClickHandler(features[i]);
                }

                var self = this;
                this._activeLayer.addListener('featureAdd.' + this._ns, function(sGisEvent) { self._setFeatureClickHandler(sGisEvent.feature); });
                this._activeLayer.addListener('featureRemove.' + this._ns, this._featureRemoveHandler.bind(this));

                this._map.addListener('keydown.' + this._ns, this._keydownHandler.bind(this));
            }
        },

        _featureRemoveHandler: function(sGisEvent) {
            if (this._selectedFeature === sGisEvent.feature) this.deselect();
            this._removeFeatureClickHandler(sGisEvent.feature);
        },

        _removeEventListeners: function() {
            if (this._activeLayer) {
                var features = this._activeLayer.features;
                for (var i = 0; i < features.length; i++) {
                    this._removeFeatureClickHandler(features[i]);
                }
                this._activeLayer.removeListener('.' + this._ns);
            }
            this._map.removeListener('keydown.' + this._ns);
        },

        _keydownHandler: function(sGisEvent) {
            if (this.ignoreEvents) return;
            var event = sGisEvent.browserEvent;

            // Ignore key events if there is active form element on the page
            var activeElement = document.activeElement;
            if (activeElement && activeElement !== document.body) {
                return;
            }

            if (event.which === 27) {
                if (!this._deselectProhibited) this.deselect();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            } else if (event.which === 46) {
                this.deleteSelected();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            } else if (event.which === 9) {
                this._selectNext();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            } else if (event.which === 90 && event.ctrlKey) { //ctrl + z
                this.undo();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            } else if (event.which === 89 && event.ctrlKey) { //ctrl + y
                this.redo();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            }
        },

        _selectNext: function() {
            if (this._activeLayer) {
                var features = this._activeLayer.features;

                this.select(features[0]);
            }
        },

        _setFeatureClickHandler: function(feature) {
            var self = this;
            feature.addListener('click.' + this._ns, function(sGisEvent) { self._featureClickHandler(sGisEvent, this); });
        },

        _removeFeatureClickHandler: function(feature) {
            feature.removeListener('click.' + this._ns);
        },

        _featureClickHandler: function(sGisEvent, feature) {
            if (this.ignoreEvents) return;
            this.select(feature);
            sGisEvent.stopPropagation();
            sGisEvent.preventDefault();
        },

        select: function(feature) {
            if (this._selectedFeature === feature) return;
            this.deselect();

            if (this._isActive && this._activeLayer && this._activeLayer.has(feature)) {
                this._map.addListener('click.' + this._ns, this._mapClickHandler.bind(this));
                this._selectedFeature = feature;
                this._activeLayer.moveToTop(feature);
                this._setSelectedListeners();
                this._setTempSymbol();
                this._setSnappingLayer();
                this._saveOriginalState();
                this._map.redrawLayer(this._activeLayer);

                this.fire('featureSelect', {feature: feature});
            }
        },

        deselect: function() {
            if (this.deselectionAllowed && this._selectedFeature) {
                var feature = this._selectedFeature;
                this._map.removeListener('click.' + this._ns);
                this._clearTempSymbol();
                this._removeSelectedListeners();
                this._removeSnappingLayer();
                this._selectedFeature = null;
                if (this._map.getLayerIndex(this._activeLayer) !== -1) this._map.redrawLayer(this._activeLayer);

                this.fire('featureDeselect', {feature: feature});
            }
        },

        prohibitDeselect: function() {
            this.deselectionAllowed = false;
        },

        allowDeselect: function() {
            this.deselectionAllowed = true;
        },

        _setSnappingLayer: function() {
            if (!this._snappingLayer) {
                this._snappingLayer = new sGis.FeatureLayer();
                this._snappingPoint = new sGis.feature.Point([0, 0], {crs: this._map.crs, symbol: this._snappingPointSymbol});
                this._snappingPoint.hide();
                this._snappingLayer.add(this._snappingPoint);
                this._createTransformControls();
            }

            if (this._selectedFeature instanceof sGis.feature.Polyline) {
                this._updateTransformControls();
            }
            this._map.moveLayerToIndex(this._snappingLayer, Number.MAX_VALUE);
        },

        _removeSnappingLayer: function() {
            this._map.removeLayer(this._snappingLayer);
            this._snappingPoint.hide();
            this._hideTransformControls();
        },

        _createTransformControls: function() {
            this._transformControls = [];
            this._createScalingControls();
            this._createRotationControl();
            this._updateTransformControls();
        },

        _createScalingControls: function() {
            var OFFSET = 10;
            var self = this;

            for (var x = 0; x < 3; x++) {
                this._transformControls.push([]);
                for (var y = 0; y < 3; y++) {
                    if (x !== 1 || y !== 1) {
                        var symbol = new this._translateControlSymbol({offset: {x: (x-1)*OFFSET, y: -(y-1)*OFFSET}, size: 7});
                        var control = new sGis.feature.Point([0,0], {crs: this._map.crs, symbol: symbol, xIndex: x, yIndex: y});
                        control.hide();

                        control.addListener('dragStart', this._transformControlDragStartHandler);
                        control.addListener('drag', function(sGisEvent) { self._transformControlDragHandler(sGisEvent, this) });
                        control.addListener('dragEnd', this._saveState.bind(this));

                        this._transformControls[x][y] = control;
                        this._snappingLayer.add(control);
                    }
                }
            }
        },

        _createRotationControl: function() {
            var self = this;
            var rotationControl = new sGis.feature.Point([0,0], {crs: this._map.crs, symbol: this._rotationControlSymbol});
            rotationControl.addListener('dragStart', function(sGisEvent) {
                self._rotationBase = self._selectedFeature.centroid;
                self._transformControlDragStartHandler.call(this, sGisEvent);
                self.fire('rotationStart');
            });
            rotationControl.addListener('drag', this._rotationControlDragHandler.bind(this));
            rotationControl.addListener('dragEnd', function() {
                self._saveState();
                self.fire('rotationEnd');
            });


            rotationControl.hide();
            this._snappingLayer.add(rotationControl);
            this._transformControls.rotationControl = rotationControl;
        },

        _hideTransformControls: function() {
            if (this._transformControls) {
                if (this._transformControls.length > 0) {
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            if (this._transformControls[i][j]) {
                                this._transformControls[i][j].hide();
                            }
                        }
                    }
                }

                if (this._transformControls.rotationControl) this._transformControls.rotationControl.hide();
            }
        },

        _transformControlDragStartHandler: function(sGisEvent) {
            //if (this.ignoreEvents) return; todo: this does not work because of the context
            sGisEvent.draggingObject = this; // called in feature context
            sGisEvent.stopPropagation();
        },

        _transformControlDragHandler: function(sGisEvent, feature) {
            var MIN_SIZE = 10;

            var xIndex = feature.xIndex === 0 ? 2 : feature.xIndex === 2 ? 0 : 1;
            var yIndex = feature.yIndex === 0 ? 2 : feature.yIndex === 2 ? 0 : 1;
            var basePoint = this._transformControls[xIndex][yIndex].coordinates;

            var bbox = this._selectedFeature.bbox;
            var resolution = this._map.resolution;
            var tolerance = MIN_SIZE * resolution;
            var width = bbox.width;
            var xScale = xIndex === 1 ? 1 : (width + (xIndex - 1) * sGisEvent.offset.x) / width;
            if (width < tolerance && xScale < 1) xScale = 1;
            var height = bbox.height;
            var yScale = yIndex === 1 ? 1 : (height + (yIndex - 1) * sGisEvent.offset.y) / height;
            if (height < tolerance && yScale < 1) yScale = 1;

            this._selectedFeature.scale([xScale, yScale], basePoint);
            this._map.redrawLayer(this._activeLayer);
            this._updateTransformControls();
        },

        _rotationControlDragHandler: function(sGisEvent) {
            var xPrev = sGisEvent.point.x + sGisEvent.offset.x;
            var yPrev = sGisEvent.point.y + sGisEvent.offset.y;

            var alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
            var alpha2 = sGisEvent.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(sGisEvent.point.y - this._rotationBase[1], sGisEvent.point.x - this._rotationBase[0]);
            var angle = alpha2 - alpha1;

            this._selectedFeature.rotate(angle, this._rotationBase);
            this._map.redrawLayer(this._activeLayer);
            this._updateTransformControls();

            this.fire('rotation');
        },

        _updateTransformControls: function() {
            if (this._transformControls && this._selectedFeature && this._selectedFeature instanceof sGis.feature.Polyline) {
                var bbox = this._selectedFeature.bbox.projectTo(this._map.crs);
                var coordinates = [[bbox.xMin, bbox.yMin], [bbox.xMax, bbox.yMax]];
                var controls = this._transformControls;

                if (controls.length > 0) {
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            if (i !== 1 || j !== 1) {
                                var x = coordinates[0][0] + (coordinates[1][0] - coordinates[0][0]) * i / 2;
                                var y = coordinates[0][1] + (coordinates[1][1] - coordinates[0][1]) * j / 2;
                                controls[i][j].coordinates = [x, y];
                                if (this.allowScaling) {
                                    controls[i][j].show();
                                } else {
                                    controls[i][j].hide();
                                }
                            }
                        }
                    }
                }

                if (controls.rotationControl) {
                    controls.rotationControl.coordinates = [(coordinates[0][0] + coordinates[1][0]) / 2, coordinates[1][1]];
                    if (this.allowRotation) {
                        controls.rotationControl.show();
                    } else {
                        controls.rotationControl.hide();
                    }
                }
                this._map.redrawLayer(this._snappingLayer);
            } else {
                this._hideTransformControls();
            }
        },

        _mapClickHandler: function(sGisEvent) {
            if (this.ignoreEvents) return;
            this.deselect();
        },

        _setTempSymbol: function() {
            this._selectedFeature.setTempSymbol(new selectionSymbols[this._selectedFeature.type]({baseSymbol: this._selectedFeature.symbol}));
        },

        _clearTempSymbol: function() {
            this._selectedFeature.clearTempSymbol();
        },

        _setSelectedListeners: function() {
            var self = this;
            this._selectedFeature.addListener('dragStart.' + this._ns, function(sGisEvent) { self._dragStartHandler(sGisEvent, this); });
            this._selectedFeature.addListener('drag.' + this._ns, function(sGisEvent) { self._dragHandler(sGisEvent, this); });
            this._selectedFeature.addListener('dragEnd.' + this._ns, this._saveState.bind(this));

            if (this._selectedFeature instanceof sGis.feature.Polyline) {
                this._selectedFeature.addListener('mousemove.' + this._ns, function(sGisEvent) { self._polylineMousemoveHandler(sGisEvent, this); });
                this._selectedFeature.addListener('mouseout.' + this._ns, function(sGisEvent) { self._polylineMouseoutHandler(sGisEvent, this); });
                this._selectedFeature.addListener('dblclick.' + this._ns, function(sGisEvent) { self._polylineDblclickHandler(sGisEvent, this); });
            } else if (this._selectedFeature instanceof sGis.feature.MultiPoint) {
                this._selectedFeature.addListener('dblclick.' + this._ns, function(sGisEvent) { self._multipointDblclickHandler(sGisEvent, this); })
            }
        },

        _removeSelectedListeners: function() {
            this._selectedFeature.removeListener('dragStart.' + this._ns);
            this._selectedFeature.removeListener('drag.' + this._ns);
            this._selectedFeature.removeListener('dragEnd.' + this._ns);
            this._selectedFeature.removeListener('mousemove.' + this._ns);
            this._selectedFeature.removeListener('mouseout.' + this._ns);
            this._selectedFeature.removeListener('dblclick.' + this._ns);
        },

        _dragStartHandler: function(sGisEvent, feature) {
            if (this.ignoreEvents || !(this.allowVertexEditing || this.allowDragging)) return;

            if (feature instanceof sGis.feature.Polyline || feature instanceof sGis.feature.MultiPoint) {
                this._currentDragInfo = this._getAdjustedEventData(sGisEvent, feature);
                if (!this.allowVertexEditing && (this._currentDragInfo.type === 'line' || this._currentDragInfo.type === 'vertex')) {
                    this._currentDragInfo.type = 'bulk';
                }
            }

            sGisEvent.draggingObject = feature;
            sGisEvent.stopPropagation();
        },

        _dragHandler: function(sGisEvent, feature) {
            if (feature instanceof sGis.feature.Point) {
                this._pointDragHandler(sGisEvent, feature);
            } else if (feature instanceof sGis.feature.Polyline) {
                this._polylineDragHandler(sGisEvent, feature);
            } else if (feature instanceof sGis.feature.MultiPoint) {
                this._multipointDragHandler(sGisEvent, feature);
            }
        },

        _polylineMousemoveHandler: function(sGisEvent, feature) {
            if (this.ignoreEvents || !this.allowVertexEditing) return;

            var adjustedEvent = this._getAdjustedEventData(sGisEvent, feature);
            var symbol = adjustedEvent.type === 'line' ? this._snappingPointSymbol : adjustedEvent.type === 'vertex' ? this._snappingVertexSymbol : null;

            if (symbol) {
                this._snappingPoint.coordinates = adjustedEvent.point;
                this._snappingPoint.symbol = symbol;

                this._snappingPoint.show();
            } else {
                this._snappingPoint.hide();
            }
            this._map.redrawLayer(this._snappingLayer);
        },

        _polylineDblclickHandler: function(sGisEvent, feature) {
            if (this.ignoreEvents || !this.allowVertexEditing) return;

            var adjustedEvent = this._getAdjustedEventData(sGisEvent, feature);
            if (adjustedEvent.type === 'vertex') {
                var coordinates = feature.coordinates;
                if (coordinates[adjustedEvent.ring].length > 2) {
                    feature.removePoint(adjustedEvent.ring, adjustedEvent.index);
                    this._saveState();
                } else {
                    if (coordinates.length > 1) {
                        feature.removeRing(adjustedEvent.ring);
                        this._saveState();
                    } else {
                        this.deleteSelected();
                    }
                }

                this._map.redrawLayer(this._activeLayer);
                this._updateTransformControls();
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();

                this.fire('featurePointRemove', {feature: feature, pointIndex: adjustedEvent.index, ring: adjustedEvent.ring});
            }
        },

        _multipointDblclickHandler: function(sGisEvent, feature) {
            if (this.ignoreEvents || !this.allowVertexEditing) return;

            var adjustedEvent = this._getAdjustedEventData(sGisEvent, feature);
            var coords = feature.coordinates;
            if (coords.length > 1) {
                coords.splice(adjustedEvent.index, 1);
                feature.coordinates = coords;
                this._saveState();
                this._map.redrawLayer(this._activeLayer);
            } else {
                this.deleteSelected();
            }

            sGisEvent.stopPropagation();
            sGisEvent.preventDefault();

            this.fire('featurePointRemove', {feature: feature, pointIndex: adjustedEvent.index});
        },

        deleteSelected: function() {
            if (this.deselectionAllowed && this.allowDeletion && this.selectedFeature) {
                var feature = this._selectedFeature;
                this.prohibitEvent('featureDeselect');
                this.activeLayer.remove(this.selectedFeature);
                this.allowEvent('featureDeselect');

                this._saveDeletion(feature);

                this.fire('featureRemove', {feature: feature});
            }
        },

        _getAdjustedEventData: function(sGisEvent, feature) {
            if (sGisEvent.intersectionType && utils.isArray(sGisEvent.intersectionType)) {
                var coordinates = feature.coordinates;
                var ring = sGisEvent.intersectionType[0];
                if (feature instanceof sGis.feature.Polygon) {
                    coordinates[ring].push(coordinates[ring][0]);
                }

                var snappingType = 'bulk';
                var snappingPoint;
                var index;
                var snappingDistance = this.snappingDistance * this._map.resolution;
                for (var i = 1; i < coordinates[ring].length; i++) {
                    var distance = sGis.geotools.pointToLineDistance(sGisEvent.point.coordinates, [coordinates[ring][i - 1], coordinates[ring][i]]);
                    if (distance < snappingDistance) {
                        for (var j = 0; j < 2; j++) {
                            if (Math.abs(coordinates[ring][i - 1 + j][0] - sGisEvent.point.x) < snappingDistance && Math.abs(coordinates[ring][i - 1 + j][1] - sGisEvent.point.y) < snappingDistance) {
                                snappingPoint = coordinates[ring][i - 1 + j];
                                snappingType = 'vertex';
                                index = i - 1 + j;
                                break;
                            }
                        }

                        if (!snappingPoint) {
                            snappingPoint = sGis.geotools.pointToLineProjection(sGisEvent.point.coordinates, [coordinates[ring][i - 1], coordinates[ring][i]]);
                            snappingType = 'line';
                            index = i - 1;
                        }
                        break;
                    }
                }
            } else if (feature instanceof sGis.feature.MultiPoint) {
                var minDistanceSquare = Number.MAX_VALUE;
                feature.coordinates.forEach(function(point, i) {
                    var distanceSquare = Math.pow((point[0] - sGisEvent.point.x), 2) + Math.pow((point[1] - sGisEvent.point.y), 2);
                    if (distanceSquare < minDistanceSquare) {
                        minDistanceSquare = distanceSquare;
                        index = i;
                    }
                });
                snappingType = 'bulk';
            } else {
                snappingType = 'bulk';
            }

            return {point: snappingPoint, type: snappingType, ring: ring, index: index};
        },

        _polylineMouseoutHandler: function(sGisEvent, feature) {
            this._snappingPoint.hide();
            this._map.redrawLayer(this._snappingLayer);
        },

        _polylineDragHandler: function(sGisEvent, feature) {
            var dragInfo = this._currentDragInfo;
            if ((dragInfo.type === 'vertex' || dragInfo.type === 'line') && !this.allowVertexEditing || dragInfo.type === 'bulk' && !this.allowDragging) return;

            if (dragInfo.type === 'vertex') {
                if (!sGisEvent.browserEvent.altKey) {
                    var snappingPoint = this._getSnappingPoint(sGisEvent.point, this._polylineSnappingFunctions, [feature], {
                        feature: feature,
                        ring: dragInfo.ring,
                        index: dragInfo.index
                    });
                }
                feature.setPoint(dragInfo.ring, dragInfo.index, snappingPoint || sGisEvent.point);

                this.fire('featurePointChange', {feature: feature, pointIndex: dragInfo.index, ring: dragInfo.ring});
            } else if (dragInfo.type === 'line') {
                dragInfo.index++;
                feature.insertPoint(dragInfo.ring, dragInfo.index, sGisEvent.point);
                dragInfo.type = 'vertex';

                this.fire('featurePointAdd', {feature: feature});
            } else {
                feature.move(-sGisEvent.offset.x, -sGisEvent.offset.y);
                this.fire('featureMove', {feature: feature});
            }

            this._updateTransformControls();
            this._map.redrawLayer(this._activeLayer);
        },

        _pointDragHandler: function(sGisEvent, feature) {
            if (!this.allowDragging) return;

            var projected = feature.projectTo(this._map.crs);
            if (!sGisEvent.browserEvent.altKey) {
                var snappingPoint = this._getSnappingPoint(sGisEvent.point, this._pointSnappingFunctions, [feature]);
            }
            if (snappingPoint) {
                projected.x = snappingPoint[0];
                projected.y = snappingPoint[1];
            } else {
                projected.x = sGisEvent.point.x;
                projected.y = sGisEvent.point.y;
            }

            feature.coordinates = projected.projectTo(feature.crs).coordinates;
            this._map.redrawLayer(this._activeLayer);

            this.fire('featureMove', {feature: feature});
        },

        _multipointDragHandler: function(sGisEvent, feature) {
            if (!this.allowDragging) return;

            var projected = feature.projectTo(this._map.crs);
            var index = this._currentDragInfo.index;
            if (!sGisEvent.browserEvent.altKey) {
                var snappingPoint = this._getSnappingPoint(sGisEvent.point, this._pointSnappingFunctions, [feature]);
            }
            if (snappingPoint) {
                projected.coordinates[index][0] = snappingPoint[0];
                projected.coordinates[index][1] = snappingPoint[1];
            } else {
                projected.coordinates[index][0] = sGisEvent.point.x;
                projected.coordinates[index][1] = sGisEvent.point.y;
            }

            feature.coordinates = projected.projectTo(feature.crs).coordinates;
            this._map.redrawLayer(this._activeLayer);

            this.fire('featureMove', {feature: feature});
        },

        _getSnappingPoint: function(point, functions, exclude, featureData) {
            var snappingDistance = this.snappingDistance * this._map.resolution;
            for (var i = 0; i < functions.length; i++) {
                if (snapping[functions[i]]) var snappingPoint = snapping[functions[i]](point, this._activeLayer, snappingDistance, exclude, featureData);
                if (snappingPoint) return snappingPoint;
            }
        },

        _saveDeletion: function(feature) {
            this._saveState(null, feature, true)
        },

        _trimStates: function() {
            while(this._states.length - 1 > this._currentState) {
                var state = this._states.pop();
                this._featureStates[state.feature.id].pop();
            }
        },

        _saveOriginalState: function() {
            var feature = this._selectedFeature;
            if (!this._featureStates[feature.id]) {
                this._featureStates[feature.id] = [];
            }

            if (!this._featureStates[feature.id][0]) {
                this._featureStates[feature.id].push(feature.coordinates);
            }
        },

        _saveState: function(sGisEvent, feature, del) {
            this._trimStates();

            feature = feature || this._selectedFeature;
            this._featureStates[feature.id].push(del ? 'del' : feature.coordinates);

            this._states.push({
                feature: feature,
                index: this._featureStates[feature.id].length - 1
            });

            this._limitStateCache();
            this._currentState = this._states.length - 1;
        },


        _limitStateCache: function() {
            if (this._states.length > this._maxStatesLength) {
                var state = this._states.shift();
                this._featureStates[state.feature.id].splice(state.index, 1);
            }
        },

        _setState: function(index) {
            if (index > this._currentState) {
                var baseState = this._states[index];
                if (baseState) var i = baseState.index;
            } else {
                baseState = this._states[this._currentState];
                if (baseState) i = baseState.index - 1;
            }

            if (baseState) {
                var feature = baseState.feature;
                var coordinates = this._featureStates[feature.id][i];

                if (coordinates === 'del') {
                    if (this._activeLayer.has(feature)) {
                        this._activeLayer.remove(feature);
                        this._map.redrawLayer(this._activeLayer);
                        this._hideTransformControls();
                        this._map.redrawLayer(this.snappingLayer);
                    }
                } else {
                    if (!this._activeLayer.has(feature)) {
                        this._activeLayer.add(feature);
                    }

                    feature.coordinates = coordinates;

                    if (this._selectedFeature !== feature) {
                        this.select(feature);
                    } else {
                        this._map.redrawLayer(this._activeLayer);
                    }
                    this._updateTransformControls();
                }

                this._currentState = index;
            }
        },

        undo: function() {
            this._setState(this._currentState - 1);
        },

        redo: function() {
            this._setState(this._currentState + 1);
        },

        clearStateList: function() {
            this._states = [];
            this._currentState = -1;
            this._featureStates = {};
        },

        /**
         * Sets the mode of editing.
         * @param {String|String[]} mode - the mode or list of modes. Possible values are: 'rotate', 'scale', 'drag', 'vertex', 'all'.
         */
        setMode: function(mode) {
            var state = mode === 'all';
            this.allowRotation = this.allowScaling = this.allowDragging = this.allowVertexEditing = state;

            if (!state) {
                var props = {
                    'rotate': 'allowRotation',
                    'scale': 'allowScaling',
                    'drag': 'allowDragging',
                    'vertex': 'allowVertexEditing'
                };

                if (utils.isString(mode)) mode = [mode];
                for (var i = 0; i < mode.length; i++) {
                    if (props[mode[i]]) this[props[mode[i]]] = true;
                }
            }

            this._updateTransformControls();
        }
    });

    sGis.utils.proto.setProperties(sGis.controls.Editor.prototype, {
        allowDeletion: true,
        snappingDistance: 7,
        maxStateLength: 32,
        snappingPointSymbol: { default: new sGis.symbol.point.Point({fillColor: 'red', size: 3}) },
        snappingVertexSymbol: { default: new sGis.symbol.point.Point({fillColor: 'blue', size: 6}) },
        pointSnappingFunctions: { default: ['vertex', 'midpoint', 'line'], get: function() { return this._pointSnappingFunctions.concat(); }},
        polylineSnappingFunctions: { default: ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'], get: function() { return this._polylineSnappingFunctions.concat(); }},
        rotationControlSymbol: { default: new sGis.symbol.point.Point({offset: {x: 0, y: -30}}) },
        deselectionAllowed: true,
        allowRotation: true,
        allowScaling: true,
        allowDragging: true,
        allowVertexEditing: true,

        selectedFeature: {
            default: null,
            set: function(feature) {
                this.select(feature);
            }
        },

        /**
         * @deprecated
         */
        activeFeature: {
            get: function() {
                return this.selectedFeature;
            },
            set: function(feature) {
                this.selectedFeature = feature;
            }
        },

        activeLayer: {
            default: null,
            type: sGis.FeatureLayer,
            set: function(layer) {
                var isActive = this._isActive;
                this.deactivate();
                this._activeLayer = layer;
                this.isActive = isActive;
            }
        },

        isActive: {
            default: false,
            get: function() {
                return this._isActive;
            },
            set: function(bool) {
                if (bool) {
                    this.activate();
                } else {
                    this.deactivate();
                }
            }
        },

        map: {
            default: null,
            set: null
        },

        id: {
            default: null,
            set: null
        },
        ignoreEvents: false
    });

    /**
     * @deprecated
     */
    sGis.controls.Editor.prototype.deselectFeature = sGis.controls.Editor.prototype.deselect;
    sGis.controls.Editor.prototype.selectFeature = sGis.controls.Editor.prototype.select;

    var selectionSymbols = {
        point: sGis.symbol.editor.Point,
        polyline: sGis.symbol.editor.Point,
        polygon: sGis.symbol.editor.Point
    };

    var snapping = {
        /**
         * snaps to vertexes of all features around
         */
        vertex: function(point, layer, distance, exclude) {
            var bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);

            for (var i = 0; i < features.length; i++) {
                if (exclude.indexOf(features[i]) !== -1) continue;
                var feature = features[i].projectTo(point.crs);
                if (feature instanceof sGis.feature.Point) {
                    if (Math.abs(feature.x - point.x) < distance && Math.abs(feature.y - point.y) < distance) {
                        return [feature.x, feature.y];
                    }
                } else if (feature instanceof sGis.feature.Polyline) {
                    var coordinates = feature.coordinates;
                    for (var ring = 0; ring < coordinates.length; ring++) {
                        for (var j = 0; j < coordinates[ring].length; j++) {
                            if (Math.abs(coordinates[ring][j][0] - point.x) < distance && Math.abs(coordinates[ring][j][1] - point.y) < distance) {
                                return coordinates[ring][j];
                            }
                        }
                    }
                }
            }
        },

        midpoint: function(point, layer, distance, exclude) {
            var bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);
            for (var i = 0; i < features.length; i++) {
                if (exclude.indexOf(features[i]) !== -1 || !(features[i] instanceof sGis.feature.Polyline)) continue;
                var feature = features[i].projectTo(point.crs);
                var coordinates = feature.coordinates;

                for (var ring = 0; ring < coordinates.length; ring++) {
                    if (feature instanceof sGis.feature.Polygon) coordinates[ring].push(coordinates[ring][0]);

                    for (var j = 1; j < coordinates[ring].length; j++) {
                        var midPointX = (coordinates[ring][j][0] + coordinates[ring][j-1][0]) / 2;
                        var midPointY = (coordinates[ring][j][1] + coordinates[ring][j-1][1]) / 2;

                        if (Math.abs(midPointX - point.x) < distance && Math.abs(midPointY - point.y) < distance) {
                            return [midPointX, midPointY];
                        }
                    }
                }
            }
        },

        line: function(point, layer, distance, exclude) {
            var bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            var features = layer.getFeatures(bbox);
            for (var i = 0; i < features.length; i++) {
                if (exclude.indexOf(features[i]) !== -1 || !(features[i] instanceof sGis.feature.Polyline)) continue;
                var feature = features[i].projectTo(point.crs);
                var coordinates = feature.coordinates;

                for (var ring = 0; ring < coordinates.length; ring++) {
                    if (feature instanceof sGis.feature.Polygon) coordinates[ring].push(coordinates[ring][0]);

                    for (var j = 1; j < coordinates[ring].length; j++) {
                        var projection = sGis.geotools.pointToLineProjection(point.coordinates, [coordinates[ring][j-1], coordinates[ring][j]]);

                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            return projection;
                        }
                    }
                }
            }
        },

        axis: function(point, layer, distance, exclude, featureData) {
            var lines = [];
            var ring = featureData.feature.coordinates[featureData.ring];
            if (featureData.feature instanceof sGis.feature.Polygon) ring.push(ring[0]);
            var index = featureData.index;

            if (index < ring.length - 1) {
                lines.push([ring[index], ring[index + 1]]);
            }
            if (index === 0) {
                if (featureData.feature instanceof sGis.feature.Polygon) lines.push([ring[index], ring[ring.length - 2]]);
            } else {
                lines.push([ring[index], ring[index - 1]]);
            }

            var basePoint = [];
            for (var i = 0; i < lines.length; i++) {
                for (var axis = 0; axis < 2; axis++) {
                    var projection = [lines[i][axis][0], lines[i][(axis + 1)%2][1]];
                    if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                        basePoint[(axis+1)%2] = lines[i][1][(axis+1)%2];
                        break;
                    }
                }
            }

            if (basePoint.length > 0) return [basePoint[0] === undefined ? point.x : basePoint[0], basePoint[1] === undefined ? point.y : basePoint[1]];
        },

        orthogonal: function(point, layer, distance, exclude, featureData) {
            var lines = [];
            var ring = featureData.feature.coordinates[featureData.ring];
            var index = featureData.index;
            if (featureData.feature instanceof sGis.feature.Polygon) {
                var n = ring.length;
                lines.push([ring[(index+1) % n], ring[(index+2) % n]]);
                lines.push([ring[(n + index - 1) % n], ring[(n + index - 2) % n]]);
            } else {
                if (ring[index+2]) {
                    lines.push([ring[index+1], ring[index+2]]);
                }
                if (ring[index-2]) {
                    lines.push([ring[index-1], ring[index-2]]);
                }
            }

            for (var i = 0; i < lines.length; i++) {
                var projection = sGis.geotools.pointToLineProjection(point.coordinates, lines[i]);
                var dx = projection[0] - lines[i][0][0];
                var dy = projection[1] - lines[i][0][1];
                if (Math.abs(dx) < distance && Math.abs(dy) < distance) {
                    var basePoint = [point.x - dx, point.y - dy];
                    var direction = i === 0 ? 1 : -1;
                    var nextPoint = n ? ring[(n + index + direction) % n] : ring[index + direction];
                    var prevPoint = n ? ring[(n + index - direction) % n] : ring[index - direction];
                    if (nextPoint && prevPoint) {
                        projection = sGis.geotools.pointToLineProjection(prevPoint, [ring[index], nextPoint]);
                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            basePoint = projection;
                        }
                    }
                    return basePoint;
                }
            }
        }
    };

})();