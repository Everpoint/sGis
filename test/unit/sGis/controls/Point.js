'use strict';

$(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('sGis.controls.Polygon', function () {
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
            it('should be initialized with only map parameter', function() {
                var control = new sGis.controls.Point(map);
                expect(control instanceof sGis.controls.Point).toBe(true);
            });

            it('should throw an exception if no valid map is provided', function() {
                expect(function() { var control = new sGis.controls.Point(); }).toThrow();
                expect(function() { var control = new sGis.controls.Point('map'); }).toThrow();
                expect(function() { var control = new sGis.controls.Point(123); }).toThrow();
                expect(function() { var control = new sGis.controls.Point([map]); }).toThrow();
                expect(function() { var control = new sGis.controls.Point({}); }).toThrow();
            });
        });

        describe('properties', function() {
            var control;
            beforeEach(function() {
                control = new sGis.controls.Point(map);
            });

            describe('.activeLayer', function() {
                it('should set and return the active layer of control', function() {
                    control.activeLayer = layer;
                    expect(control.activeLayer).toBe(layer);
                });

                it('should not be set by default', function() {
                    expect(control.activeLayer).toBe(null);
                });

                it('should be set in constructor', function() {
                    var control1 = new sGis.controls.Point(map, {activeLayer: layer});
                    expect(control1.activeLayer).toBe(layer);
                });

                it('should throw an exception if assigned value is not an sGis.FeatureLayer instance or null', function() {
                    expect(function() { control.activeLayer = undefined; }).toThrow();
                    expect(function() { control.activeLayer = NaN; }).toThrow();
                    expect(function() { control.activeLayer = 1; }).toThrow();
                    expect(function() { control.activeLayer = 'layer'; }).toThrow();
                    expect(function() { control.activeLayer = []; }).toThrow();
                    expect(function() { control.activeLayer = {}; }).toThrow();
                    expect(function() { control.activeLayer = new sGis.TileLayer('url'); }).toThrow();
                    expect(function() { control.activeLayer = new sGis.ESRIDynamicLayer('url'); }).toThrow();
                });

                it('should set the null as a value', function() {
                    control.activeLayer = layer;
                    control.activeLayer = null;
                    expect(control.activeLayer).toBe(null);
                });
            });
        });

        describe('methods', function() {
            var control;
            beforeEach(function() {
                control = new sGis.controls.Point(map);
            });

            describe('.activate()', function() {
                it('should make the control active', function() {
                    control.activate();
                    expect(control.isActive).toBe(true);
                });

                it('should create a temporary layer and add it to the map if active layer is not set', function() {
                    control.activate();
                    expect(control.activeLayer instanceof sGis.FeatureLayer).toBe(true);
                    expect(map.getLayerIndex(control.activeLayer)).toBe(0);
                });

                it('should not create a temporary layer if the active layer is set', function() {
                    control.activeLayer = layer;
                    expect(control.activeLayer).toBe(layer);
                });
            });

            describe('.deactivate()', function() {
                it('should make the control inactive', function() {
                    control.activate();
                    control.deactivate();
                    expect(control.isActive).toBe(false);
                });

                it('should remove the temporary layer from the map', function() {
                    control.activate();
                    var tempLayer = control.activeLayer;
                    control.deactivate();

                    expect(map.getLayerIndex(tempLayer)).toBe(-1);
                });

                it('should set .activeLayer to null if it was not set before activation', function() {
                    control.activate();
                    control.deactivate();
                    expect(control.activeLayer).toBe(null);
                });

                it('should clear the temp layer', function() {
                    control.activate();
                    var tempLayer = control.activeLayer;
                    tempLayer.add(point);
                    control.deactivate();

                    expect(tempLayer.features).toEqual([]);
                });

                it('should not remove the active layer from the map if it was set', function() {
                    map.addLayer(layer);
                    control.activeLayer = layer;
                    control.activate();
                    control.deactivate();

                    expect(map.getLayerIndex(layer)).toBe(0);
                });

                it('should not clear the active layer if it is not a temp layer', function() {
                    var features = layer.features;
                    map.addLayer(layer);
                    control.activeLayer = layer;
                    control.activate();
                    control.deactivate();

                    expect(layer.features).toEqual(features);
                });

                it('should not change the activeLayer property if it was set before', function() {
                    map.addLayer(layer);
                    control.activeLayer = layer;
                    control.activate();
                    control.deactivate();
                    expect(control.activeLayer).toBe(layer);
                });
            });
        });

    });

});