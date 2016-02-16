'use strict';

$(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('sGis.controls.Editor (2)', function () {
        var map, layer, point, line, polygon;
        beforeEach(function () {
            $('#map').width(500).height(500);
            map = new sGis.Map({wrapper: 'map'});
            layer = new sGis.FeatureLayer();
            point = new sGis.feature.Point([10, 10]);
            line = new sGis.feature.Polyline([[15, 15], [16, 16]]);
            polygon = new sGis.feature.Polygon([[5, 5], [6, 6], [5, 6]]);
            layer.add([point, line, polygon]);
        });

        afterEach(function () {
            $('#map').html('').width(0).height(0);
        });

        describe('initialization', function() {
            it('should throw an exception if map is not specified or is not sGis.Map instance', function() {
                expect(function() { new sGis.controls.Editor(); }).toThrow();
                expect(function() { new sGis.controls.Editor(1); }).toThrow();
                expect(function() { new sGis.controls.Editor('map'); }).toThrow();
                expect(function() { new sGis.controls.Editor({}); }).toThrow();
                expect(function() { new sGis.controls.Editor(null); }).toThrow();
                expect(function() { new sGis.controls.Editor(new sGis.Feature); }).toThrow();

                expect(function() { new sGis.controls.Editor(map); }).not.toThrow();
            });

            it('should set an unique id', function() {
                var editor1 = new sGis.controls.Editor(map);
                var editor2 = new sGis.controls.Editor(map);
                expect(editor1.id).not.toBe(editor2.id);
            });
        });

        describe('properties', function() {
            var editor;
            beforeEach(function() {
                editor = new sGis.controls.Editor(map);
            });

            describe('.map', function() {
                it('should return the map of the control', function() {
                    expect(editor.map).toBe(map);
                });

                it('should be read only property', function() {
                    var map2 = new sGis.Map();
                    expect(function() { editor.map = map2; }).toThrow();
                    expect(editor.map).toBe(map);
                });
            });

            describe('.isActive', function() {
                it('should be false by default', function() {
                    expect(editor.isActive).toBe(false);
                });

                it('should activate the controller if assigned true value', function() {
                    spyOn(editor, 'activate').and.callThrough();
                    spyOn(editor, 'deactivate').and.callThrough();

                    editor.isActive = true;
                    expect(editor.activate).toHaveBeenCalled();
                    expect(editor.deactivate).not.toHaveBeenCalled();
                    expect(editor.isActive).toBe(true);
                });

                it('should deactivate the controller if assigned false value', function() {
                    spyOn(editor, 'activate').and.callThrough();
                    spyOn(editor, 'deactivate').and.callThrough();

                    editor.isActive = false;
                    expect(editor.activate).not.toHaveBeenCalled();
                    expect(editor.deactivate).toHaveBeenCalled();
                    expect(editor.isActive).toBe(false);
                });
            });

            describe('.activeLayer', function() {
                it('should not be set by default', function() {
                    expect(editor.activeLayer).toBeFalsy();
                });

                it('should throw an exception if assigned value is not a feature layer and not null', function() {
                    expect(function() { editor.activeLayer = 1; }).toThrow();
                    expect(function() { editor.activeLayer = 'layer'; }).toThrow();
                    expect(function() { editor.activeLayer = new sGis.TileLayer(' '); }).toThrow();
                    expect(function() { editor.activeLayer = new sGis.ESRIDynamicLayer(' '); }).toThrow();

                    expect(function() { editor.activeLayer = null; }).not.toThrow();
                    expect(function() { editor.activeLayer = layer; }).not.toThrow();
                });

                it('should set and return the active layer', function() {
                    editor.activeLayer = layer;
                    expect(editor.activeLayer).toBe(layer);

                    editor.activeLayer = null;
                    expect(editor.activeLayer).toBe(null);
                });

                it('should be set through constructor', function() {
                    var editor1 = new sGis.controls.Editor(map, {activeLayer: layer});
                    expect(editor1.activeLayer).toBe(layer);
                });

                it('should set the feature click handlers if the control is active', function() {
                    editor.activate();

                    editor.activeLayer = layer;
                    expect(point.getHandlers('click').length).toBe(1);
                    expect(line.getHandlers('click').length).toBe(1);
                    expect(polygon.getHandlers('click').length).toBe(1);
                });

                it('should not set the feature click handler if the control is not active', function() {
                    editor.activeLayer = layer;
                    expect(point.getHandlers('click').length).toBe(0);
                    expect(line.getHandlers('click').length).toBe(0);
                    expect(polygon.getHandlers('click').length).toBe(0);
                });

                it('should remove the listeners for the old active layer', function() {
                    editor.activate();
                    editor.activeLayer = layer;

                    var newLayer = new sGis.FeatureLayer();
                    var newPoint = new sGis.feature.Point([0,0]);
                    newLayer.add(newPoint);
                    editor.activeLayer = newLayer;

                    expect(point.getHandlers('click').length).toBe(0);
                    expect(line.getHandlers('click').length).toBe(0);
                    expect(polygon.getHandlers('click').length).toBe(0);

                    expect(newPoint.getHandlers('click').length).toBe(1);
                });

                it('should remove the listeners if null is assigned', function() {
                    editor.activate();
                    editor.activeLayer = layer;

                    editor.activeLayer = null;

                    expect(point.getHandlers('click').length).toBe(0);
                    expect(line.getHandlers('click').length).toBe(0);
                    expect(polygon.getHandlers('click').length).toBe(0);
                });

                it('should not set second listeners to the features if assigned the same active layer', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.activeLayer = layer;

                    expect(point.getHandlers('click').length).toBe(1);
                    expect(line.getHandlers('click').length).toBe(1);
                    expect(polygon.getHandlers('click').length).toBe(1);
                });

                it('should deselect the selected feature if different active layer is set', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    var clickListeners = map.getHandlers('click').length;

                    var newLayer = new sGis.FeatureLayer();
                    editor.activeLayer = newLayer;
                    expect(editor.selectedFeature).toBe(null);
                    expect(map.getHandlers('click').length).toBe(clickListeners - 1);
                });

                it('should deselect the selected feature if null is assigned', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    var clickListeners = map.getHandlers('click').length;

                    var newLayer = new sGis.FeatureLayer();
                    editor.activeLayer = newLayer;
                    expect(editor.selectedFeature).toBe(null);
                    expect(map.getHandlers('click').length).toBe(clickListeners - 1);
                });
            });

            describe('.selectedFeature', function() {
                it('should return null if no feature is selected', function() {
                    expect(editor.selectedFeature).toBe(null);
                });

                it('should return the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    expect(editor.selectedFeature).toBe(point);
                });

                it('should call the .select() method if assigned', function() {
                    spyOn(editor, 'select');

                    editor.activeLayer = layer;
                    editor.selectedFeature = null;
                    editor.selectedFeature = point;
                    editor.selectedFeature = point;
                    editor.activate();
                    editor.selectedFeature = null;
                    editor.selectedFeature = point;
                    editor.selectedFeature = point;

                    expect(editor.select.calls.count()).toBe(6);
                });
            });

            describe('.allowDeletion', function() {
                it('should be true by default', function() {
                    expect(editor.allowDeletion).toBe(true);
                });

                it('should set the value properly', function() {
                    editor.allowDeletion = false;
                    expect(editor.allowDeletion).toBe(false);
                    editor.allowDeletion = true;
                    expect(editor.allowDeletion).toBe(true);
                });

                it('should be properly set through constructor', function() {
                    var editor1 = new sGis.controls.Editor(map, {allowDeletion: false});
                    expect(editor1.allowDeletion).toBe(false);
                })
            });

            describe('.snappingPointSymbol', function() {
                it('should have value by default', function() {
                    expect(editor.snappingPointSymbol instanceof sGis.Symbol).toBe(true);
                });

                it('should be set in constructor', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map, {snappingPointSymbol: symbol});

                    expect(editor1.snappingPointSymbol).toBe(symbol);
                    expect(editor.snappingPointSymbol).toBe(sGis.controls.Editor.prototype.snappingPointSymbol);
                });

                it('should be set through setter', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map);

                    editor1.snappingPointSymbol = symbol;

                    expect(editor1.snappingPointSymbol).toBe(symbol);
                    expect(editor.snappingPointSymbol).toBe(sGis.controls.Editor.prototype.snappingPointSymbol);
                });
            });

            describe('.snappingVertexSymbol', function() {
                it('should have value by default', function() {
                    expect(editor.snappingVertexSymbol instanceof sGis.Symbol).toBe(true);
                });

                it('should be set in constructor', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map, {snappingVertexSymbol: symbol});

                    expect(editor1.snappingVertexSymbol).toBe(symbol);
                    expect(editor.snappingVertexSymbol).toBe(sGis.controls.Editor.prototype.snappingVertexSymbol);
                });

                it('should be set through setter', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map);

                    editor1.snappingVertexSymbol = symbol;

                    expect(editor1.snappingVertexSymbol).toBe(symbol);
                    expect(editor.snappingVertexSymbol).toBe(sGis.controls.Editor.prototype.snappingVertexSymbol);
                });
            });

            describe('.pointSnappingFunctions', function() {
                it('should be set by default', function() {
                    expect(editor.pointSnappingFunctions instanceof Array).toBe(true);
                });

                it('should be set through constructor', function() {
                    var originalFunctions = editor.pointSnappingFunctions;
                    var functions = ['vertex'];
                    var editor1 = new sGis.controls.Editor(map, {pointSnappingFunctions: functions});

                    expect(editor1.pointSnappingFunctions).toEqual(functions);
                    expect(editor.pointSnappingFunctions).not.toEqual(functions);
                    expect(editor.pointSnappingFunctions).toEqual(originalFunctions);
                });

                it('should be set through setter', function() {
                    var originalFunctions = editor.pointSnappingFunctions;
                    var functions = ['vertex'];
                    var editor1 = new sGis.controls.Editor(map);

                    editor1.pointSnappingFunctions = functions;

                    expect(editor1.pointSnappingFunctions).toEqual(functions);
                    expect(editor.pointSnappingFunctions).not.toEqual(functions);
                    expect(editor.pointSnappingFunctions).toEqual(originalFunctions);
                });
            });

            describe('.polylineSnappingFunctions', function() {
                it('should be set by default', function() {
                    expect(editor.polylineSnappingFunctions instanceof Array).toBe(true);
                });

                it('should be set through constructor', function() {
                    var originalFunctions = editor.polylineSnappingFunctions;
                    var functions = ['vertex'];
                    var editor1 = new sGis.controls.Editor(map, {polylineSnappingFunctions: functions});

                    expect(editor1.polylineSnappingFunctions).toEqual(functions);
                    expect(editor.polylineSnappingFunctions).not.toEqual(functions);
                    expect(editor.polylineSnappingFunctions).toEqual(originalFunctions);
                });

                it('should be set through setter', function() {
                    var originalFunctions = editor.polylineSnappingFunctions;
                    var functions = ['vertex'];
                    var editor1 = new sGis.controls.Editor(map);

                    editor1.polylineSnappingFunctions = functions;

                    expect(editor1.polylineSnappingFunctions).toEqual(functions);
                    expect(editor.polylineSnappingFunctions).not.toEqual(functions);
                    expect(editor.polylineSnappingFunctions).toEqual(originalFunctions);
                });
            });

            describe('.rotationControlSymbol', function() {
                it('should have value by default', function() {
                    expect(editor.rotationControlSymbol instanceof sGis.Symbol).toBe(true);
                });

                it('should be set in constructor', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map, {rotationControlSymbol: symbol});

                    expect(editor1.rotationControlSymbol).toBe(symbol);
                    expect(editor.rotationControlSymbol).toBe(sGis.controls.Editor.prototype.rotationControlSymbol);
                });

                it('should be set through setter', function() {
                    var symbol = new sGis.symbol.point.Point();
                    var editor1 = new sGis.controls.Editor(map);

                    editor1.rotationControlSymbol = symbol;

                    expect(editor1.rotationControlSymbol).toBe(symbol);
                    expect(editor.rotationControlSymbol).toBe(sGis.controls.Editor.prototype.rotationControlSymbol);
                });
            });

            describe('.deselectionAllowed', function() {
                beforeEach(function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                });

                it('should make it impossible to deselect the feature if false', function() {
                    editor.deselectionAllowed = false;
                    editor.deselect();
                    expect(editor.activeFeature).toBe(point);
                    expect(editor.deselectionAllowed).toBe(false);
                });

                it('should make it possible to deselect the feature if true', function() {
                    editor.deselectionAllowed = true;
                    editor.deselect();
                    expect(editor.activeFeature).toBe(null);
                    expect(editor.deselectionAllowed).toBe(true);
                });

                it('should be true by default', function() {
                    expect(editor.deselectionAllowed).toBe(true);
                });

                it('should be set by constructor', function() {
                    var editor2 = new sGis.controls.Editor(map, {deselectionAllowed: false});
                    expect(editor2.deselectionAllowed).toBe(false);
                    expect(editor.deselectionAllowed).toBe(true);
                });
            });
        });

        describe('methods', function() {
            var editor;
            beforeEach(function() {
                editor = new sGis.controls.Editor(map);
            });

            describe('.activate()', function() {
                it('should set active status to true', function() {
                    editor.activate();
                    expect(editor.isActive).toBe(true);
                    editor.activate();
                    expect(editor.isActive).toBe(true);
                });

                it('should set the click listeners to the features of active layer', function() {
                    editor.activeLayer = layer;

                    editor.activate();
                    expect(point.getHandlers('click').length).toBe(1);
                    expect(line.getHandlers('click').length).toBe(1);
                    expect(polygon.getHandlers('click').length).toBe(1);
                });

                it('should not set second listener if activated an active control', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.activate();

                    expect(point.getHandlers('click').length).toBe(1);
                    expect(line.getHandlers('click').length).toBe(1);
                    expect(polygon.getHandlers('click').length).toBe(1);
                });

                it('should add listeners to all features added to the active layer', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    var newPoint = new sGis.feature.Point([0,0]);
                    layer.add(newPoint);
                    expect(newPoint.getHandlers('click').length).toBe(1);
                });

                it('should remove the listeners from the features that are removed from the layer', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    var listeners = polygon.getHandlers('click').length;
                    layer.remove(polygon);
                    expect(polygon.getHandlers('click').length).toBe(listeners - 1);
                });
            });

            describe('.deactivate()', function() {
                it('should set active status to false', function() {
                    editor.activate();
                    editor.deactivate();
                    expect(editor.isActive).toBe(false);
                });

                it('should remove click listeners from the features', function() {
                    map.addLayer(layer);
                    editor.activeLayer = layer;

                    editor.activate();
                    editor.deactivate();

                    expect(point.getHandlers('click').length).toBe(0);
                    expect(line.getHandlers('click').length).toBe(0);
                    expect(polygon.getHandlers('click').length).toBe(0);
                });

                it('should deselect the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    var clickListeners = map.getHandlers('click').length;

                    editor.deactivate();
                    expect(editor.selectedFeature).toBe(null);
                    expect(map.getHandlers('click').length).toBe(clickListeners - 1);
                });
            });

            describe('.select()', function() {
                it('should select a feature of activeLayer if the control is active', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    expect(editor.selectedFeature).toBe(point);

                    editor.select(line);
                    expect(editor.selectedFeature).toBe(line);

                    editor.select(polygon);
                    expect(editor.selectedFeature).toBe(polygon);
                });

                it('should not select a feature if the control is not active', function() {
                    editor.activeLayer = layer;
                    editor.select(point);

                    expect(editor.selectedFeature).toBe(null);
                });

                it('should not select a feature if the feature does not belong to the active layer', function() {
                    var newPoint = new sGis.feature.Point([5, 5]);
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(newPoint);

                    expect(editor.selectedFeature).toBe(null);
                });

                it('should not select a feature if the control is not active', function() {
                    editor.activeLayer = layer;
                    editor.select(point);

                    expect(editor.selectedFeature).toBe(null);
                });

                it('should deselect selected feature if the given value is not a feature belonging to the active layer', function() {
                    var newPoint = new sGis.feature.Point([5, 5]);
                    editor.activeLayer = layer;
                    editor.activate();

                    editor.select(point);
                    editor.select(newPoint);
                    expect(editor.selectedFeature).toBe(null);

                    editor.select(point);
                    editor.select(null);
                    expect(editor.selectedFeature).toBe(null);
                });

                it('should call .deselect() the previously selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    spyOn(editor, 'deselect');
                    editor.select(line);

                    expect(editor.deselect).toHaveBeenCalled();
                });

                it('should set a click listener to the map for deselecting the feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    var clickListeners = map.getHandlers('click').length;
                    editor.select(point);

                    expect(map.getHandlers('click').length).toBe(clickListeners + 1);
                });

                it('should not set an additional listener to the map if already set one', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    editor.select(point);
                    var clickListeners = map.getHandlers('click').length;

                    editor.select(line);
                    expect(map.getHandlers('click').length).toBe(clickListeners);
                    editor.select(polygon);
                    expect(map.getHandlers('click').length).toBe(clickListeners);
                });

                it('should set the temp style for the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    var originalSymbol = point.symbol;

                    editor.select(point);

                    expect(point.symbol).not.toBe(originalSymbol);
                    expect(point.originalSymbol).toBe(originalSymbol);
                });

                it('should create the temp layer for snapping', function() {
                    map.addLayer(layer);
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    expect(map.layers.length).toBe(2);
                });
            });

            describe('.deselect()', function() {
                it('should deselect the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.deselect();

                    expect(editor.selectedFeature).toBe(null);
                });

                it('should do nothing if no feature is selected', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.deselect();

                    expect(editor.selectedFeature).toBe(null);
                });

                it('should remove the click listener from the map', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    editor.select(point);
                    var clickListeners = map.getHandlers('click').length;
                    editor.deselect();

                    expect(map.getHandlers('click').length).toBe(clickListeners - 1);
                    editor.deselect();
                    expect(map.getHandlers('click').length).toBe(clickListeners - 1);
                });

                it('should clear the temp symbol from the feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    var originalSymbol = point.symbol;

                    editor.select(point);
                    editor.deselect();

                    expect(point.symbol).toBe(originalSymbol);
                });

                it('should remove the snapping layer from the map', function() {
                    map.addLayer(layer);
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    editor.deselect();
                    expect(map.layers.length).toBe(1);
                });

                it('should be called if the selected feature is removed from the layer', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(polygon);

                    spyOn(editor, 'deselect').and.callThrough();

                    layer.remove(polygon);
                    expect(editor.deselect).toHaveBeenCalled();
                    expect(editor.selectedFeature).toBe(null);
                });

                it('should remove the click handler from the map', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(line);

                    var listeners = map.getHandlers('click').length;

                    editor.deselect();
                    expect(map.getHandlers('click').length).toBe(listeners - 1);
                });

                it('should remove the handlers from the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    var handlers = utils.copyObject(point._eventHandlers);

                    editor.select(point);

                    expect(point._eventHandlers).not.toEqual(handlers);

                    editor.deselect();

                    for (var i in point._eventHandlers) {
                        if (point._eventHandlers[i].length > 0) {
                            expect(point._eventHandlers[i]).toEqual(handlers[i]);
                        } else {
                            expect(handlers[i] === undefined || handlers[i].length === 0).toBe(true);
                        }
                    }

                    handlers = utils.copyObject(polygon._eventHandlers);

                    editor.select(polygon);

                    expect(polygon._eventHandlers).not.toEqual(handlers);

                    editor.deselect();
                    for (i in polygon._eventHandlers) {
                        if (polygon._eventHandlers[i].length > 0) {
                            expect(polygon._eventHandlers[i]).toEqual(handlers[i]);
                        } else {
                            expect(handlers[i] === undefined || handlers[i].length === 0).toBe(true);
                        }
                    }
                });
            });

            describe('.deleteSelected()', function() {
                it ('should delete the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    editor.deleteSelected();
                    expect(layer.has(point)).toBe(false);
                });

                it ('should do nothing if no feature is selected', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    editor.deleteSelected();
                    expect(layer.features.length).toBe(3);
                });

                it('should do nothing if there is no active layer', function() {
                    editor.activate();

                    editor.deleteSelected();
                    expect(layer.features.length).toBe(3);
                });

                it('should do nothing if allowDeletion property is set to false', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.allowDeletion = false;

                    editor.deleteSelected();
                    expect(layer.has(point)).toBe(true);
                    expect(layer.features.length).toBe(3);
                });
            });

            describe('.prohibitDeselect()', function() {
                beforeEach(function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                });

                it('should make it impossible to deselect the feature', function() {
                    var fired = false;
                    editor.prohibitDeselect();
                    editor.addListner('featureDeselect', function() { fired = true; });

                    editor.deselect();
                    expect(editor.selectedFeature).toBe(point);
                    expect(fired).toBe(false);
                });
            });

            describe('.allowDeselect()', function() {
                beforeEach(function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                });

                it('should allow deselection after prohibiting it', function() {
                    editor.prohibitDeselect();
                    editor.allowDeselect();
                    editor.deselect();

                    expect(editor.selectedFeature).toBe(null);
                });
            });
        });

        describe('events', function() {
            var editor;
            beforeEach(function() {
                editor = new sGis.controls.Editor(map);
            });

            describe('featureSelect', function() {
                it('should be fired when a feature is selected', function() {
                    var fired = false;
                    editor.addListener('featureSelect', function() {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    expect(fired).toBe(false);
                    editor.activate();
                    editor.select(point);

                    expect(fired).toBe(true);
                });

                it('should provide the selected feature as a parameter', function() {
                    var selected;
                    editor.addListener('featureSelect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    expect(selected).toBe(point);
                });

                it('should not be fired if trying to selected already selected feature', function() {
                    var fired = false;
                    editor.addListener('featureSelect', function() {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    fired = false;
                    editor.select(point);

                    expect(fired).toBe(false);
                });

                it('should be fired if select a new feature when there is already a selected feature', function() {
                    var fired = false;
                    editor.addListener('featureSelect', function() {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    fired = false;
                    editor.select(polygon);

                    expect(fired).toBe(true);
                });

                it('should not be fired if trying to select feature when there is no active layer', function() {
                    var fired = false;
                    editor.addListener('featureSelect', function() {
                        fired = true;
                    });

                    editor.activate();
                    editor.select(point);

                    expect(fired).toBe(false);
                });

                it('should not be fired if trying to select feature that is not in the layer', function() {
                    var fired = false;
                    editor.addListener('featureSelect', function() {
                        fired = true;
                    });

                    editor.activate();
                    editor.select(new sGis.feature.Point([0,0]));

                    expect(fired).toBe(false);
                });
            });

            describe('featureDeselect', function() {
                it('should be fired when a feature is deselected', function() {
                    var fired = false;
                    editor.addListener('featureDeselect', function() {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    expect(fired).toBe(false);
                    editor.deselect();
                    expect(fired).toBe(true);
                });

                it('should provide the deselected feature as a parameter', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.deselect();

                    expect(selected).toBe(point);
                });

                it('should be fired if another feature is selected', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.select(polygon);

                    expect(selected).toBe(point);
                });

                it('should be fired if active layer is changed', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.activeLayer = new sGis.FeatureLayer();

                    expect(selected).toBe(point);
                });

                it('should be fired if the active layer is set to null', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.activeLayer = null;

                    expect(selected).toBe(point);
                });

                it('should be fired if the editor is deactivated', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.deactivate();

                    expect(selected).toBe(point);
                });

                it('should not be fired if trying to select currently selected feature', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.select(point);

                    expect(selected).toBe(undefined);
                });

                it('should be fired if trying to select a feature that is not in the active layer', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.select(new sGis.feature.Point([0,0]));

                    expect(selected).toBe(point);
                });

                it('should be fired if the feature is being deleted by controller', function() {
                    var selected;
                    editor.addListener('featureDeselect', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.deleteSelected();

                    expect(selected).toBe(point);
                });
            });

            describe('featureRemove', function() {
                it('should be fired when feature is removed by the controller, and should send the feature as a parameter', function() {
                    var selected;
                    editor.addListener('featureRemove', function(sGisEvent) {
                        selected = sGisEvent.feature;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.deleteSelected();

                    expect(selected).toBe(point);
                });

                it('should not be fired if there is not selected feature', function() {
                    var fired = false;
                    editor.addListener('featureRemove', function(sGisEvent) {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.deleteSelected();

                    expect(fired).toBe(false);
                });

                it('should not be fired if the deletion is prohibited', function() {
                    var fired = false;
                    editor.addListener('featureRemove', function(sGisEvent) {
                        fired = true;
                    });

                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);
                    editor.allowDeletion = false;
                    editor.deleteSelected();

                    expect(fired).toBe(false);
                });
            });
        });

        describe('user interactions', function() {
            var editor;
            beforeEach(function() {
                editor = new sGis.controls.Editor(map);
            });

            describe('on clicking a feature of active layer', function() {
                it('should select the clicked feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();

                    point.fire('click');
                    expect(editor.selectedFeature).toBe(point);
                    line.fire('click');
                    expect(editor.selectedFeature).toBe(line);
                    polygon.fire('click');
                    expect(editor.selectedFeature).toBe(polygon);
                });
            });

            describe('on clicking an empty map point', function() {
                it('should deselect the selected feature', function() {
                    editor.activeLayer = layer;
                    editor.activate();
                    editor.select(point);

                    map.fire('click');
                    expect(editor.selectedFeature).toBe(null);
                });
            });
        });
    });
});
