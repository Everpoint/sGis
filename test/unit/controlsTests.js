$(function() {
    
    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('Controls', function() {
        
        var map, layer;

        beforeEach(function() {
            $('#map').width(500).height(500);

            map = new sGis.Map({wrapper: 'map'}),
            layer = new sGis.FeatureLayer();

            map.addLayer(layer);
        });

        afterEach(function() {
            $('#map').html('').width(0).height(0);;
        });

        /*
        * sGis.controls.Point
        */

        describe('Point', function() {
            it('should be created with default settings', function () {
                expect(function() {new sGis.controls.Point();}).toThrow();
                expect(function() {new sGis.controls.Point(1, 1);}).toThrow();
                expect(function() {new sGis.controls.Point(1, layer);}).toThrow();
                expect(function() {new sGis.controls.Point({map: map, activeLayer: layer});}).toThrow();

                var control = new sGis.controls.Point(map, {activeLayer: layer});
                expect(control).toBeDefined();
                expect(control.color).toBe(sGis.feature.Point.prototype._color);
                expect(control.size).toBe(sGis.feature.Point.prototype._size);
                expect(control.activeLayer).toBe(layer);
                expect(control.isActive).toBeFalsy();
            });

            it('should set the properties correctly', function() {
                var control1 = new sGis.controls.Point(map, {color: 'red', size: 10});
                expect(control1.size).toBe(10);
                expect(control1.color).toBe('red');

                var control2 = new sGis.controls.Point(map, layer, {isActive: true});
                expect(control2.color).toBe(sGis.feature.Point.prototype._color);
                expect(control2.size).toBe(sGis.feature.Point.prototype._size);
                expect(control2.isActive).toBeFalsy();
            });

            describe('properties', function() {
                it('color should set the color properly', function() {
                    var control = new sGis.controls.Point(map);

                    control.color = 'blue';
                    expect(control.color).toBe('blue');

                    var control2 = new sGis.controls.Point(map);
                    expect(control2.color).toBe(sGis.feature.Point.prototype._color);

                    control2.color = 'brown';
                    expect(control.color).toBe('blue');
                    expect(control2.color).toBe('brown');
                });

                it('size should set the size properly', function() {
                    var control = new sGis.controls.Point(map);

                    control.size = 20;
                    expect(control.size).toBe(20);

                    var control2 = new sGis.controls.Point(map);
                    expect(control2.size).toBe(sGis.feature.Point.prototype._size);

                    control2.size = 30;
                    expect(control.size).toBe(20);
                    expect(control2.size).toBe(30);
                });

                it('activate() and deactivate() should hang and remove the listner from the map', function() {
                    var control = new sGis.controls.Point(map);

                    control.activate();
                    expect(control.isActive).toBeTruthy();

                    control.deactivate();
                    expect(control.isActive).toBeFalsy();

                    var control2 = new sGis.controls.Point(map);
                    control.activate();

                    expect(control2.isActive).toBeFalsy();
                });


                it('onclick should add a Point feature to the active layer', function() {
                    var control = new sGis.controls.Point(map, {activeLayer: layer});
                    control.activate();
                    expect(layer.features).toEqual([]);

                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    var features = layer.features;
                    expect(features.length).toBe(1);
                    expect(features[0] instanceof sGis.feature.Point).toBeTruthy();

                    control.deactivate();
                    map.fire('click', {map: map, mouseOffset: {x: 200, y: 200}});
                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0]).toBe(features[0]);

                    var featureLayer = new sGis.FeatureLayer();
                    map.addLayer(featureLayer);
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});

                    expect(featureLayer.features.length).toBe(0);

                    control.deactivate();
                    control.activeLayer = featureLayer;
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});

                    expect(featureLayer.features.length).toBe(1);
                    expect(layer.features.length).toBe(2);

                    control.deactivate();
                    map.removeLayer(featureLayer);
                });
            });
        });

        /*
        * sGis.controls.Polyline
        */

        describe('Polyline', function() {
            it('should be created with default settings', function () {
                expect(function() {new sGis.controls.Polyline();}).toThrow();
                expect(function() {new sGis.controls.Polyline(1, 1);}).toThrow();
                expect(function() {new sGis.controls.Polyline({map: map, activeLayer: layer});}).toThrow();

                var control = new sGis.controls.Polyline(map, {activeLayer: layer});
                expect(control).toBeDefined();
                expect(control.color).toBe(sGis.feature.Polyline.prototype._color);
                expect(control.width).toBe(sGis.feature.Polyline.prototype._width);
                expect(control.activeLayer).toBe(layer);
                expect(control.isActive).toBeFalsy();
            });

            it('should set the properties correctly', function() {
                var control1 = new sGis.controls.Polyline(map, {color: 'red', width: 10});
                expect(control1.width).toBe(10);
                expect(control1.color).toBe('red');

                var control2 = new sGis.controls.Polyline(map);
                expect(control2.color).toBe(sGis.feature.Polyline.prototype._color);
                expect(control2.width).toBe(sGis.feature.Polyline.prototype._width);
                expect(control2.isActive).toBeFalsy();
            });

            describe('methods', function() {
                it('setColor() should set the color properly', function() {
                    var control = new sGis.controls.Polyline(map);

                    control.color = 'blue';
                    expect(control.color).toBe('blue');

                    var control2 = new sGis.controls.Polyline(map);
                    expect(control2.color).toBe(sGis.feature.Polyline.prototype._color);

                    control2.color = 'brown';
                    expect(control.color).toBe('blue');
                    expect(control2.color).toBe('brown');
                });

                it('setWidth() should set the size properly', function() {
                    var control = new sGis.controls.Polyline(map);

                    control.width = 20;
                    expect(control.width).toBe(20);

                    var control2 = new sGis.controls.Polyline(map);
                    expect(control2.width).toBe(sGis.feature.Polyline.prototype._width);

                    control2.width = 30;
                    expect(control.width).toBe(20);
                    expect(control2.width).toBe(30);
                });

                it('activate() and deactivate() should hang and remove the listners from the map', function() {
                    var control = new sGis.controls.Polyline(map);

                    control.activate();
                    expect(control.isActive).toBeTruthy();

                    control.deactivate();
                    expect(control.isActive).toBeFalsy();

                    var control2 = new sGis.controls.Polyline(map);
                    control.activate();

                    expect(control2.isActive).toBeFalsy();

                    control2.activate();
                    expect(control.isActive).toBeTruthy();
                    expect(control2.isActive).toBeTruthy();
                });

                it('onclick should start drawing or add a point to the current polyline and attach onmousemove event listner', function() {
                    layer._features = [];

                    var control = new sGis.controls.Polyline(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});

                    var features = layer.features;
                    expect(features.length).toBe(1);
                    expect(features[0].coordinates[0].length).toBe(2);
                    expect(features[0] instanceof sGis.feature.Polyline).toBeTruthy();

                    control.deactivate();
                    expect(layer.features).toEqual([]);

                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 200, y: 100}});

                    var features2 = layer.features;
                    expect(features2.length).toBe(1);
                    expect(features[0]).not.toBe(features2[0]);
                    expect(features2[0].coordinates[0].length).toBe(3);
                    expect(features2[0] instanceof sGis.feature.Polyline).toBeTruthy();

                    control.deactivate();
                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0]).toBe(features2[0]);
                    expect(features2[0].coordinates[0].length).toBe(2);
                });

                it('onmousemove should move the last point of polyline', function() {
                    var control = new sGis.controls.Polyline(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    var points = layer.features[0].coordinates[0];

                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});

                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0] instanceof sGis.feature.Polyline).toBeTruthy();

                    var points2 = layer.features[0].coordinates[0];

                    expect(points2.length).toBe(2);
                    expect(points[0]).toEqual(points2[0]);
                    expect(points[1]).not.toEqual(points2[1]);

                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    var points3 = layer.features[0].coordinates[0];

                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 110}});

                    expect(layer.features.length).toBe(1);

                    var points4 = layer.features[0].coordinates[0];

                    expect(points4.length).toBe(3);
                    expect(points4[0]).toEqual(points[0]);
                    expect(points4[1]).toEqual(points3[1]);
                    expect(points4[2]).not.toEqual(points3[1]);

                    control.deactivate();

                    expect(layer.features[0].coordinates[0].length).toBe(2);
                });

                it('ondblclick should finish the polyline and remove its last point', function() {
                    layer._features = [];

                    var control = new sGis.controls.Polyline(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});

                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0].coordinates[0].length).toBe(2);

                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 130, y: 100}});

                    expect(layer.features.length).toBe(2);
                    expect(layer.features[0].coordinates[0].length).toBe(2);
                    expect(layer.features[1].coordinates[0].length).toBe(2);
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 110}});
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 120}});
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 130}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 130, y: 130}});

                    expect(layer.features.length).toBe(3);
                    expect(layer.features[0].coordinates[0].length).toBe(2);
                    expect(layer.features[1].coordinates[0].length).toBe(2);
                    expect(layer.features[2].coordinates[0].length).toBe(4);

                    control.deactivate();
                });

                it('new features should be added to the active layer', function() {
                    layer._features = [];
                    var control = new sGis.controls.Polyline(map, {activeLayer: layer}),
                        featureLayer = new sGis.FeatureLayer();

                    map.addLayer(featureLayer);
                    control.activeLayer = featureLayer;
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});
                    control.deactivate();

                    expect(featureLayer.features.length).toBe(1);
                    expect(layer.features.length).toBe(0);

                    control.activeLayer = layer;
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});
                    control.deactivate();

                    expect(featureLayer.features.length).toBe(1);
                    expect(layer.features.length).toBe(1);
                });
            });
        });

        /*
        * sGis.controls.Polygon
        */

        describe('Polygon', function() {
            it('should be created with default settings', function () {
                expect(function() {new sGis.controls.Polygon();}).toThrow();
                expect(function() {new sGis.controls.Polygon(1, 1);}).toThrow();
                expect(function() {new sGis.controls.Polygon({map: map, activeLayer: layer});}).toThrow();

                var control = new sGis.controls.Polygon(map, {activeLayer: layer});
                expect(control).toBeDefined();
                expect(control.color).toBe(sGis.feature.Polygon.prototype._color);
                expect(control.width).toBe(sGis.feature.Polygon.prototype._width);
                expect(control.fillColor).toBe(sGis.feature.Polygon.prototype._fillColor);
                expect(control.activeLayer).toBe(layer);
                expect(control.isActive).toBeFalsy();
            });

            it('should set the properties correctly', function() {
                var control1 = new sGis.controls.Polygon(map, {color: 'red', width: 10, fillColor: 'blue'});
                expect(control1.width).toBe(10);
                expect(control1.color).toBe('red');
                expect(control1.fillColor).toBe('blue');

                var control2 = new sGis.controls.Polygon(map);
                expect(control2.color).toBe(sGis.feature.Polygon.prototype._color);
                expect(control2.width).toBe(sGis.feature.Polygon.prototype._width);
                expect(control2.fillColor).toBe(sGis.feature.Polygon.prototype._fillColor);
                expect(control2.isActive).toBeFalsy();
            });

            describe('methods', function() {
                it('setColor() should set the color properly', function() {
                    var control = new sGis.controls.Polygon(map);

                    control.color = 'blue';
                    expect(control.color).toBe('blue');

                    var control2 = new sGis.controls.Polygon(map);
                    expect(control2.color).toBe(sGis.feature.Polygon.prototype._color);

                    control2.color = 'brown';
                    expect(control.color).toBe('blue');
                    expect(control2.color).toBe('brown');
                });

                it('setWidth() should set the size properly', function() {
                    var control = new sGis.controls.Polygon(map);

                    control.width = 20;
                    expect(control.width).toBe(20);

                    var control2 = new sGis.controls.Polygon(map);
                    expect(control2.width).toBe(sGis.feature.Polygon.prototype._width);

                    control2.width = 30;
                    expect(control.width).toBe(20);
                    expect(control2.width).toBe(30);
                });

                it('setFillColor() should set the color properly', function() {
                    var control = new sGis.controls.Polygon(map);

                    control.fillColor = 'blue';
                    expect(control.getFillColor()).toBe('blue');

                    var control2 = new sGis.controls.Polygon(map);
                    expect(control2.fillColor).toBe(sGis.feature.Polygon.prototype._fillColor);

                    control2.fillColor = 'brown';
                    expect(control.fillColor).toBe('blue');
                    expect(control2.fillColor).toBe('brown');
                });

                it('activate() and deactivate() should hang and remove the listners from the map', function() {
                    var control = new sGis.controls.Polygon(map);

                    control.activate();
                    expect(control.isActive).toBeTruthy();

                    control.deactivate();
                    expect(control.isActive).toBeFalsy();

                    var control2 = new sGis.controls.Polygon(map);
                    control.activate();

                    expect(control2.isActive).toBeFalsy();
                });

                it('setActiveLayer() should set the active layer', function() {
                    var control = new sGis.controls.Polygon(map, {activeLayer: layer}),
                        featureLayer = new sGis.FeatureLayer(),
                        tileLayer = new sGis.TileLayer('url');

                    expect(function() {control.activeLayer = 1;}).toThrow();
                    expect(function() {control.activeLayer = 'layer';}).toThrow();
                    expect(function() {control.activeLayer = [];}).toThrow();
                    expect(function() {control.activeLayer = {};}).toThrow();
                    expect(function() {control.activeLayer = tileLayer;}).toThrow();
                    expect(function() {control.activeLayer = featureLayer;}).toThrow();

                    map.addLayer(featureLayer);

                    control.activate();
                    expect(function() {control.activeLayer = featureLayer;}).toThrow();
                    control.deactivate();

                    control.activeLayer = featureLayer;
                    expect(control.activeLayer).toBe(featureLayer);

                    var control2 = new sGis.controls.Polygon(map, {activeLayer: layer});
                    expect(control2.activeLayer).toBe(layer);
                    expect(control.activeLayer).toBe(featureLayer);

                    control2.activeLayer = featureLayer;
                    control.activeLayer = layer;
                    expect(control.activeLayer).toBe(layer);
                    expect(control2.activeLayer).toBe(featureLayer);
                });

                it('onclick should start drawing or add a point to the current polygon and attach onmousemove event listner', function() {
                    layer._features = [];

                    var control = new sGis.controls.Polygon(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});

                    var features = layer.features;
                    expect(features.length).toBe(1);
                    expect(features[0].coordinates[0].length).toBe(2);
                    expect(features[0] instanceof sGis.feature.Polygon).toBeTruthy();

                    control.deactivate();
                    expect(layer.features).toEqual([]);

                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 200, y: 100}});

                    var features2 = layer.features;
                    expect(features2.length).toBe(1);
                    expect(features[0]).not.toBe(features2[0]);
                    expect(features2[0].coordinates[0].length).toBe(3);
                    expect(features2[0] instanceof sGis.feature.Polygon).toBeTruthy();

                    control.deactivate();
                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0]).toBe(features2[0]);
                    expect(features2[0].coordinates[0].length).toBe(2);
                });

                it('onmousemove should move the last point of polygon', function() {
                    var control = new sGis.controls.Polygon(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    var points = layer.features[0].coordinates[0];

                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});

                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0] instanceof sGis.feature.Polygon).toBeTruthy();

                    var points2 = layer.features[0].coordinates[0];

                    expect(points2.length).toBe(2);
                    expect(points[0]).toEqual(points2[0]);
                    expect(points[1]).not.toEqual(points2[1]);

                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    var points3 = layer.features[0].coordinates[0];

                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 110}});

                    expect(layer.features.length).toBe(1);

                    var points4 = layer.features[0].coordinates[0];

                    expect(points4.length).toBe(3);
                    expect(points4[0]).toEqual(points[0]);
                    expect(points4[1]).toEqual(points3[1]);
                    expect(points4[2]).not.toEqual(points3[1]);

                    control.deactivate();

                    expect(layer.features[0].coordinates[0].length).toBe(2);
                });

                it('ondblclick should finish the polygon and remove its last point', function() {
                    layer._features = [];

                    var control = new sGis.controls.Polygon(map, {activeLayer: layer});
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});

                    expect(layer.features.length).toBe(1);
                    expect(layer.features[0].coordinates[0].length).toBe(2);

                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 130, y: 100}});

                    expect(layer.features.length).toBe(2);
                    expect(layer.features[0].coordinates[0].length).toBe(2);
                    expect(layer.features[1].coordinates[0].length).toBe(2);
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 110}});
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 120}});
                    map.fire('click', {map: map, mouseOffset: {x: 120, y: 130}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('click', {map: map, mouseOffset: {x: 130, y: 130}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 130, y: 130}});

                    expect(layer.features.length).toBe(3);
                    expect(layer.features[0].coordinates[0].length).toBe(2);
                    expect(layer.features[1].coordinates[0].length).toBe(2);
                    expect(layer.features[2].coordinates[0].length).toBe(4);

                    control.deactivate();
                });

                it('new features should be added to the active layer', function() {
                    layer._features = [];
                    var control = new sGis.controls.Polygon(map, {activeLayer: layer}),
                        featureLayer = new sGis.FeatureLayer();

                    map.addLayer(featureLayer);
                    control.activeLayer = featureLayer;
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});
                    control.deactivate();

                    expect(featureLayer.features.length).toBe(1);
                    expect(layer.features.length).toBe(0);

                    control.activeLayer = layer;
                    control.activate();
                    map.fire('click', {map: map, mouseOffset: {x: 100, y: 100}});
                    map.fire('mousemove', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('click', {map: map, mouseOffset: {x: 110, y: 100}});
                    map.fire('dblclick', {map: map, mouseOffset: {x: 110, y: 100}});
                    control.deactivate();

                    expect(featureLayer.features.length).toBe(1);
                    expect(layer.features.length).toBe(1);

                    map.removeLayer(featureLayer);
                });
            });
        });

        /*
        /  EDITOR
         */

        describe('Editor', function() {
            describe('creation', function() {
                it('should be created with default parameters', function() {

                });
            });
        });
    });
});