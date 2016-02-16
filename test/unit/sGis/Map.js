'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('Map', function() {
        var $wrapper;
        beforeEach(function() {
            $wrapper = $('#map');
            $wrapper.width(500).height(500).show();
        });

        afterEach(function() {
            $wrapper.html('').hide();
        });

        describe('creation', function() {
            it('should be created with default parameters', function() {
                var map = new sGis.Map();

                expect(map).toBeDefined();
                expect(map.crs).toBe(sGis.Map.prototype._crs);
                expect(map.resolution).toBe(sGis.Map.prototype._resolution);
                expect(map.position).not.toBe(sGis.Map.prototype._position);
                expect(map.position.x).toBe(sGis.Map.prototype._position.x);
                expect(map.position.y).toBe(sGis.Map.prototype._position.y);
                expect(map.position.crs).toBe(sGis.Map.prototype._position.crs);
                expect(map.wrapper).toBe(null);
                expect(map.layerWrapper).toBe(undefined);
                expect(map.height).toBe(undefined);
                expect(map.width).toBe(undefined);
                expect(map.bbox).toBe(undefined);
                expect(map.layers).toEqual([]);
                expect(map.layers).not.toBe(map._layers);
            });
            
            it('should set the layers as specified in options', function() {
                var layer1 = new sGis.FeatureLayer(),
                    layer2 = new sGis.FeatureLayer(),
                    layers = [layer1, layer2],
                    map = new sGis.Map({layers: layers});
                    
                expect(map.layers).not.toBe(layers);
                expect(map.layers).toEqual(layers);
            });
            
            it('should throw an error if at least one layer in the list of layers is not a valid layer', function() {
                var layers = [
                    new sGis.FeatureLayer(),
                    new sGis.TileLayer('url'),
                    new sGis.ESRIDynamicLayer('url')
                ];
                
                expect(function() {new sGis.Map({layers: layers});}).not.toThrow();
                    
                layers.push('not a layer');
                expect(function() {new sGis.Map({layers: layers});}).toThrow();
            });
            
            it('should set the position to 0,0 if map crs cannot be converted to WGS', function() {
                var map = new sGis.Map({crs: sGis.CRS.plain});
                
                expect(map.position.x).toBe(0);
                expect(map.position.y).toBe(0);
                expect(map.position.crs).toBe(sGis.CRS.plain);
            });
        });
        
        describe('properties', function() {
            var map, layer1, layer2, layer3;
            var triggerAnimationFrame;

            beforeEach(function() {
                var callsList = [];

                spyOn(utils, 'requestAnimationFrame').and.callFake(function (f) {
                    callsList.push(f);
                    triggerAnimationFrame = function () {
                        callsList.forEach(function(handler) { handler(); });
                    };
                });
                map = new sGis.Map({wrapper: 'map'});
                layer1 = new sGis.TileLayer('url');
                layer2 = new sGis.ESRIDynamicLayer('url');
                layer3 = new sGis.FeatureLayer();            });

            describe('.width and .height', function() {

                it('should throw an exception if assigned value', function() {
                    expect(function() { map.width = 200; }).toThrow();
                    expect(function() { map.height = 200; }).toThrow();
                });

                it('should return the size of the map wrapper', function() {
                    expect(map.width).toBe(500);
                    expect(map.height).toBe(500);
                });

                it('should return correct value even if the size of the wrapper is changed', function() {
                    var $wrapper = $('#map');
                    $wrapper.width(200).height(300);

                    triggerAnimationFrame();

                    expect(map.width).toBe(200);
                    expect(map.height).toBe(300);
                });

                it('should return 0 if the wrapper is not displayed on the screen', function() {
                    $wrapper.hide();

                    triggerAnimationFrame();
                    expect(map.width).toBe(0);
                    expect(map.height).toBe(0);
                });

                it('should return undefined if the map has no wrapper', function() {
                    map.wrapper = null;

                    triggerAnimationFrame();
                    expect(map.width).toBe(undefined);
                    expect(map.height).toBe(undefined);
                });
            });

            describe('.wrapper', function() {
                var $wrapper1;
                beforeEach(function() {
                    $wrapper1 = $('<div id="map1" style="width: 300px; height: 300px;" />');
                    $(document.body).append($wrapper1);
                });

                afterEach(function() {
                    $wrapper1.remove();
                });

                it('should return the DOM-element -container of the map', function() {
                    expect(map.wrapper instanceof HTMLElement).toBe(true);
                    expect(map.wrapper.id).toBe('map');
                });

                it('should not be set by default', function() {
                    var map1 = new sGis.Map();
                    expect(map1.wrapper).toBe(null);
                });

                it('should be set in constructor', function() {
                    var map1 = new sGis.Map({wrapper: 'map'});
                    expect(map1.wrapper).toBe(document.getElementById('map'));
                });

                it('should get DOM element as a value', function() {
                    var node = document.getElementById('map1');
                    map.wrapper = node;
                    expect(map.wrapper).toBe(node);
                });

                it('should set the .innerWrapper, .layerWrapper and .painter properties', function() {
                    expect(map.innerWrapper).toBeDefined();
                    expect(map.layerWrapper).toBeDefined();
                    expect(map.painter instanceof utils.Painter).toBe(true);
                });

                it('should add the map DOM elements into the wrapper', function() {
                    expect($wrapper.children().length > 0).toBe(true);
                });

                it('should remove all map DOM elements from the old container and add to the new one', function() {
                    map.wrapper = 'map1';
                    expect($wrapper.children().length).toBe(0);
                    expect($wrapper1.children().length > 0).toBe(true);
                });

                it('should remove the map from the container if null is assigned', function() {
                    map.wrapper = null;
                    expect($wrapper.children().length).toBe(0);
                });

                it('should remove .innerWrapper, .layerWrapper and .painter if null is assigned', function() {
                    map.wrapper = null;
                    expect(map.innerWrapper).toBe(undefined);
                    expect(map.layerWrapper).toBe(undefined);
                    expect(map.painter).toBe(undefined);
                });

                it('should not change the wrapper and its content', function() {
                    $wrapper1.append('<div>Inner div</div>');
                    var html = $wrapper1.html();
                    var node = document.getElementById('map1');
                    var keys = Object.keys(node);

                    map.wrapper = 'map';
                    map.wrapper = null;

                    expect($wrapper1.html()).toBe(html);
                    expect(Object.keys(node)).toEqual(keys);
                });

                it('should trigger the "bboxChange" event', function() {
                    var fired = false;
                    var handler = function() { fired = true; };
                    map.on('bboxChange', handler);

                    map.wrapper = 'map1';
                    expect(fired).toBe(true);
                });

                it('should trigger the "wrapperSet" event', function() {
                    var fired = false;
                    var handler = function() { fired = true; };
                    map.on('wrapperSet', handler);

                    map.wrapper = 'map1';
                    expect(fired).toBe(true);

                    fired = false;
                    map.wrapper = null;
                    expect(fired).toBe(true);
                });

                it('should throw an exception in case of incorrect assignment', function() {
                    expect(function() { map.wrapper = undefined; }).toThrow();
                    expect(function() { map.wrapper = NaN; }).toThrow();
                    expect(function() { map.wrapper = 0; }).toThrow();
                    expect(function() { map.wrapper = 1; }).toThrow();
                    expect(function() { map.wrapper = {}; }).toThrow();
                    expect(function() { map.wrapper = []; }).toThrow();
                });

                it('should throw an exception if there is no specified wrapper', function() {
                    expect(function() { map.wrapper = 'nowrapper'; }).toThrow();
                });

                it('should delete only self from the wrapper in case two maps are contained in the same wrapper', function() {
                    var node = map.wrapper;
                    var map1 = new sGis.Map({wrapper: 'map'});
                    expect(map.wrapper).toBe(map1.wrapper);
                    expect(map.innerWrapper).not.toBe(map1.innerWrapper);

                    map.wrapper = null;
                    expect(map.wrapper).toBe(null);
                    expect(map1.wrapper).toBe(node);
                    expect($wrapper.children().length).toBe(1);
                });
            });

            describe('.crs', function() {
                it('should set and return the crs of the map', function() {
                    map.crs = sGis.CRS.ellipticalMercator;
                    expect(map.crs).toBe(sGis.CRS.ellipticalMercator);
                });

                it('should be set by default', function() {
                    expect(map.crs instanceof sGis.Crs).toBe(true);
                });

                it('should be set in constructor', function() {
                    var map1 = new sGis.Map({crs: sGis.CRS.plain});
                    expect(map1.crs).toBe(sGis.CRS.plain);
                });

                it('should project the old position to the new crs if assigned', function() {
                    var position = map.position;
                    map.crs = sGis.CRS.ellipticalMercator;
                    expect(map.position).toEqual(position.projectTo(sGis.CRS.ellipticalMercator));
                });

                it('should project the default position to the new crs if assigned in constructor', function() {
                    var defaultPosition = map.position;
                    var map1 = new sGis.Map({crs: sGis.CRS.ellipticalMercator});
                    expect(map1.position).toEqual(defaultPosition.projectTo(sGis.CRS.ellipticalMercator));
                });

                it('should set position to 0,0 if it cannot be projected into the new crs', function() {
                    map.crs = sGis.CRS.plain;
                    expect(map.position).toEqual(new sGis.Point(0, 0, map.crs));
                });

                it('should set position to 0,0 if it is set in constructor and the default position cannot be projected to the new crs', function() {
                    var map1 = new sGis.Map({crs: sGis.CRS.plain});
                    expect(map1.position).toEqual(new sGis.Point(0, 0, map1.crs));
                });

                it('should should set position after the crs is set in constructor', function() {
                    var point = new sGis.Point(10, 20, sGis.CRS.plain);
                    var map1 = new sGis.Map({position: point, crs: sGis.CRS.plain});

                    expect(map1.crs).toBe(sGis.CRS.plain);
                    expect(map1.position).toEqual(point);
                });

                it('should not change resolution if the old crs can be projected into the new one', function() {
                    var resolution = map.resolution;
                    map.crs = sGis.CRS.ellipticalMercator;
                    expect(map.resolution).toBe(resolution);
                });

                it('should set resolution to 1 if the old crs cannot be projected into the new one', function() {
                    map.crs = sGis.CRS.plain;
                    expect(map.resolution).toBe(1);
                });

                it('should set resolution to 1 if assigned in constructor unprojectable crs', function() {
                    var map1 = new sGis.Map({crs: sGis.CRS.plain});
                    expect(map1.resolution).toBe(1);
                });

                it('should throw an exception in case of invalid assignment', function() {
                    expect(function() { map.crs = undefined; }).toThrow();
                    expect(function() { map.crs = null; }).toThrow();
                    expect(function() { map.crs = NaN; }).toThrow();
                    expect(function() { map.crs = sGis.Crs; }).toThrow();
                    expect(function() { map.crs = {}; }).toThrow();
                    expect(function() { map.crs = []; }).toThrow();
                });
            });

            describe('.position', function() {
                it('should set and return the position of the map', function() {
                    var point = new sGis.Point(100, 100, map.crs);
                    map.position = point;
                    expect(map.position).toEqual(point);
                    expect(map.position).not.toBe(point);
                    expect(map.position).not.toBe(map.position);
                });

                it('should get sGis.feature.Point as a valid value, but to convert it to sGis.Point', function() {
                    var point = new sGis.feature.Point([100, 100], {crs: map.crs});
                    map.position = point;

                    expect(map.position.x).toBe(point.x);
                    expect(map.position.y).toBe(point.y);
                    expect(map.position instanceof sGis.Point).toBe(true);
                });

                it('should get an array as a valid value and convert it to sGis.Point', function() {
                    map.position = [100, 200];
                    expect(map.position).toEqual(new sGis.Point(100, 200, map.crs));
                });

                it('should be set by default', function() {
                    expect(map.position instanceof sGis.Point).toBe(true);
                });

                it('should be set in constructor', function() {
                    var point = new sGis.Point(10, 20);
                    var map1 = new sGis.Map({position: point});
                    expect(map1.position).toEqual(point.projectTo(map1.crs));

                    var point2 = new sGis.feature.Point([200, 300], {crs: sGis.CRS.ellipticalMercator});
                    var map2 = new sGis.Map({position: point2});
                    expect(map2.position.x).toBe(point2.projectTo(map.crs).x);
                    expect(map2.position.y).toBe(point2.projectTo(map.crs).y);
                });

                it('should project the coordinates, if they are not in the map CRS', function() {
                    var point = new sGis.Point(10, 20);
                    map.position = point;
                    expect(map.position.crs).toBe(map.crs);

                    expect(map.position).toEqual(point.projectTo(map.crs));

                    var point1 = new sGis.feature.Point([20, 30]);
                    map.position = point1;
                    expect(map.position.crs).toBe(map.crs);
                    expect(map.position.x).toBe(point1.projectTo(map.crs).x);
                    expect(map.position.y).toBe(point1.projectTo(map.crs).y);
                });

                it('should always return the position in map crs', function() {
                    var position = map.position;
                    expect(position.crs).toBe(map.crs);

                    map.crs = sGis.CRS.ellipticalMercator;
                    expect(position.crs).not.toBe(map.crs);

                    expect(map.position.crs).toBe(sGis.CRS.ellipticalMercator);
                    expect(map.position).toEqual(position.projectTo(sGis.CRS.ellipticalMercator));
                });

                it('should trigger the "bboxChange" event', function() {
                    var fired = false;
                    var handler = function() { fired = true; };
                    map.on('bboxChange', handler);

                    map.position = new sGis.Point(10,10);
                    expect(fired).toBe(true);
                });

                it('should throw an exception in case of invalid assignment value', function() {
                    expect(function() { map.position = undefined; }).toThrow();
                    expect(function() { map.position = null; }).toThrow();
                    expect(function() { map.position = NaN; }).toThrow();
                    expect(function() { map.position = {}; }).toThrow();
                    expect(function() { map.position = []; }).toThrow();
                    expect(function() { map.position = sGis.feature.Polyline([[10, 10]]); }).toThrow();
                });

                it('should throw an exception if the new position cannot be reprojected into map crs', function() {
                    expect(function() { map.position = new sGis.Point(10, 10, sGis.CRS.plain); }).toThrow();
                });
            });

            describe('.resolution', function() {
                it('should set and return the resolution of the map', function() {
                    map.resolution = 100;
                    expect(map.resolution).toBe(100);
                });

                it('should be set by default', function() {
                    expect(map.resolution).toBeTruthy();
                });

                it('should be set in constructor', function() {
                    var map1 = new sGis.Map({resolution: 200});
                    expect(map1.resolution).toBe(200);
                });

                it('should trigger the "bboxChange" if assigned', function() {
                    var fired = false;
                    var handler = function() { fired = true; };
                    map.on('bboxChange', handler);

                    map.resolution = 10;
                    expect(fired).toBe(true);
                });

                it('should throw an exception if assigned an invalid value', function() {
                    expect(function() { map.resolution = undefined; }).toThrow();
                    expect(function() { map.resolution = null; }).toThrow();
                    expect(function() { map.resolution = NaN; }).toThrow();
                    expect(function() { map.resolution = -10; }).toThrow();
                    expect(function() { map.resolution = 0; }).toThrow();
                    expect(function() { map.resolution = '10'; }).toThrow();
                    expect(function() { map.resolution = [10]; }).toThrow();
                });
            });

            describe('.bbox', function() {
                it('should return the bbox of the map', function() {
                    map.crs = sGis.CRS.plain;
                    expect(map.bbox).toEqual(new sGis.Bbox([-map.width / 2, -map.height / 2], [map.width / 2, map.height / 2], sGis.CRS.plain));
                });

                it('should always be in the crs of the map', function() {
                    expect(map.bbox.crs).toBe(map.crs);
                    map.crs = sGis.CRS.ellipticalMercator;
                    expect(map.bbox.crs).toBe(sGis.CRS.ellipticalMercator);

                    map.crs = sGis.CRS.plain;
                    expect(map.bbox.crs).toBe(sGis.CRS.plain);
                });

                it('should be undefined if the map is not displayed', function() {
                    map.wrapper = null;
                    triggerAnimationFrame();
                    expect(map.bbox).toBe(undefined);

                    map.wrapper = 'map';
                    triggerAnimationFrame();
                    expect(map.bbox instanceof sGis.Bbox).toBe(true);

                    $wrapper.hide();
                    triggerAnimationFrame();
                    expect(map.bbox).toBe(undefined);

                    $wrapper.show();
                    triggerAnimationFrame();
                    expect(map.bbox instanceof sGis.Bbox).toBe(true);

                    $wrapper.width(0);
                    triggerAnimationFrame();
                    expect(map.bbox).toBe(undefined);

                    $wrapper.width(200);
                    triggerAnimationFrame();
                    expect(map.bbox instanceof sGis.Bbox).toBe(true);
                });

                it('should change if position is changed', function() {
                    map.crs = sGis.CRS.plain;
                    map.position = [100, 200];
                    expect(map.bbox).toEqual(new sGis.Bbox([100 - map.width / 2, 200 - map.height / 2], [100 + map.width / 2, 200 + map.width / 2], sGis.CRS.plain));
                });

                it('should change if the resolution is changed', function() {
                    map.crs = sGis.CRS.plain;
                    map.resolution = 4;
                    expect(map.bbox).toEqual(new sGis.Bbox([-map.width * 2, -map.height * 2], [map.width * 2, map.height * 2], sGis.CRS.plain));
                });

                it('should throw an exception if assigned', function() {
                    expect(function() { map.bbox = map.bbox; }).toThrow();
                });
            });

            describe('.layers', function() {
                it('should set and return the list of the layers on the map', function() {
                    var list = [layer1, layer2, layer3];
                    map.layers = list;

                    var map1 = new sGis.Map();
                    map1.layers = [layer2];

                    expect(map.layers).toEqual(list);
                    expect(map.layers).not.toBe(list);

                    expect(map1.layers).toEqual([layer2]);
                });

                it('should be empty list by default', function() {
                    expect(map.layers).toEqual([]);
                });

                it('should be set through the constructor', function() {
                    var list = [layer2, layer3];
                    var map1 = new sGis.Map({layers: list});

                    expect(map1.layers).toEqual(list);
                    expect(map1.layers).not.toBe(list);
                    expect(map.layers).not.toEqual(list);
                });

                it('should remove all the layers that were previously on the map', function() {
                    map.layers = [layer1, layer2];
                    map.layers = [layer3];
                    expect(map.layers).toEqual([layer3]);
                });

                it('should trigger the layerAdd event when assigned', function() {
                    var firedList = [];
                    var handler = function(e) { firedList.push(e.layer); };

                    map.on('layerAdd', handler);

                    var list = [layer1, layer2, layer3];
                    map.layers = list;
                    expect(firedList).toEqual(list);
                });

                it('should trigger the layerRemove event for each layer that is already on the map', function() {
                    var firedList = [];
                    var handler = function(e) { firedList.push(e.layer); };
                    var list = [layer1, layer3];

                    map.on('layerRemove', handler);
                    map.layers = list;
                    expect(firedList).toEqual([]);

                    map.layers = [layer1, layer2];
                    expect(firedList).toEqual(list);
                });

                it('should throw an exception in case of incorrect assignment', function() {
                    expect(function() { map.layers = undefined; });
                    expect(function() { map.layers = 1; });
                    expect(function() { map.layers = 'layer'; });
                    expect(function() { map.layers = NaN; });
                    expect(function() { map.layers = {}; });
                    expect(function() { map.layers = [1]; });
                    expect(function() { map.layers = [{}]; });
                    expect(function() { map.layers = [layer1, 'not a layer']; });
                });
            });

            describe('.tileScheme', function() {
                var tileLayer, tileLayer1;
                beforeEach(function() {
                    tileLayer = new sGis.TileLayer('url');
                    tileLayer1 = new sGis.TileLayer('url', {tileScheme: {}});
                });

                it('should return the tile scheme currently used by the map', function() {
                    map.addLayer(tileLayer);
                    expect(map.tileScheme).toBe(sGis.TileLayer.prototype.tileScheme);
                });

                it('should return null if there are no tile layers', function() {
                    expect(map.tileScheme).toBe(null);
                });

                it('should return the tileScheme of the first tile layer in the layer list', function() {
                    map.layers = [layer2, layer3, tileLayer1, tileLayer];
                    expect(map.tileScheme).toBe(tileLayer1.tileScheme);
                });

                it('should always return the given tile scheme if assigned', function() {
                    map.tileScheme = tileLayer.tileScheme;
                    map.addLayer(tileLayer1);
                    expect(map.tileScheme).toBe(tileLayer.tileScheme);
                });

                it('should return the tile scheme of a layer if null is assigned', function() {
                    map.tileScheme = tileLayer.tileScheme;
                    map.addLayer(tileLayer1);
                    map.tileScheme = null;
                    expect(map.tileScheme).toBe(tileLayer1.tileScheme);
                });
            });

            describe('.maxResolution', function() {
                it('should set and return the maximum allowed resolution of the map', function() {
                    map.addLayer(layer1);
                    map.maxResolution = 10000;
                    expect(map.maxResolution).toBe(10000);
                });

                it('should return the highest resolution in tileScheme if not assigned', function() {
                    map.addLayer(layer1);
                    expect(map.maxResolution).toBe(layer1.tileScheme.matrix[0].resolution);
                });

                it('should understand well arbitrary tileScheme', function() {
                    map.tileScheme = {
                        matrix: [
                            {resolution: 5},
                            {resolution: 10},
                            {resolution: 3},
                            {resolution: 8}
                        ]
                    };

                    expect(map.maxResolution).toBe(10);
                });

                it('should return the resolution according to the tileScheme if null is assigned', function() {
                    map.addLayer(layer1);
                    map.maxResolution = 10000;
                    map.maxResolution = null;
                    expect(map.maxResolution).toBe(layer1.tileScheme.matrix[0].resolution);
                });

                it('should adjust the resolution if the current map resolution is higher then the new max', function() {
                    map.resolution = 1000;
                    map.maxResolution = 500;
                    expect(map.resolution).toBe(500);
                });

                it('should throw an exception if the assigned value is invalid', function() {
                    expect(function() { map.maxResolution = undefined; }).toThrow();
                    expect(function() { map.maxResolution = -1; }).toThrow();
                    expect(function() { map.maxResolution = 0; }).toThrow();
                    expect(function() { map.maxResolution = '10'; }).toThrow();
                    expect(function() { map.maxResolution = [10]; }).toThrow();
                    expect(function() { map.maxResolution = {}; }).toThrow();
                    expect(function() { map.maxResolution = NaN; }).toThrow();
                    expect(function() { map.maxResolution = Infinity; }).toThrow();
                });
            });
        });
        
        describe('methods', function() {
            var map, layer1, layer2, layer3;
            beforeEach(function() {
                map = new sGis.Map();
                layer1 = new sGis.TileLayer('url');
                layer2 = new sGis.ESRIDynamicLayer('url');
                layer3 = new sGis.FeatureLayer();
            });

            describe('.addLayer()', function() {
                it('should add the layer to the end of map layer list', function() {
                    map.addLayer(layer1);
                    expect(map.layers.length).toBe(1);
                    expect(map.layers[0]).toBe(layer1);

                    map.addLayer(layer2);
                    map.addLayer(layer3);
                    expect(map.layers).toEqual([layer1, layer2, layer3]);
                });

                it('should trigger the layerAdd event and provide the layer as parameter', function() {
                    var layer = null;
                    var handler = function(e) {
                        layer = e.layer;
                    };

                    map.on('layerAdd', handler);
                    map.addLayer(layer1);
                    expect(layer).toBe(layer1);

                    map.addLayer(layer2);
                    expect(layer).toBe(layer2);

                    map.addLayer(layer3);
                    expect(layer).toBe(layer3);
                });

                it('should throw an exception in case of incorrect parameter', function() {
                    expect(function() { map.addLayer(); }).toThrow();
                    expect(function() { map.addLayer(null); }).toThrow();
                    expect(function() { map.addLayer(1); }).toThrow();
                    expect(function() { map.addLayer('a'); }).toThrow();
                    expect(function() { map.addLayer({}); }).toThrow();
                    expect(function() { map.addLayer([]); }).toThrow();
                    expect(function() { map.addLayer(new sGis.feature.Point([0,0])); }).toThrow();
                });

                it('should throw an exception if the layer is already on the map', function () {
                    map.addLayer(layer1);
                    expect(function () { map.addLayer(layer1); }).toThrow();
                    expect(map.layers.length).toBe(1);
                });
            });

            describe('.removeLayer()', function() {
                beforeEach(function() {
                    map.layers = [layer1, layer2, layer3];
                });

                it('should remove the layer from the map', function() {
                    map.removeLayer(layer2);
                    expect(map.layers).toEqual([layer1, layer3]);

                    map.removeLayer(layer1);
                    map.removeLayer(layer3);
                    expect(map.layers).toEqual([]);
                });

                it('should trigger the "layerRemove" event and provide the layer as a parameter', function() {
                    var layer;
                    var handler = function(e) { layer = e.layer; };
                    map.on('layerRemove', handler);
                    map.removeLayer(layer2);

                    expect(layer).toBe(layer2);

                    map.removeLayer(layer1);
                    expect(layer).toBe(layer1);
                });

                it('should throw an exception in case of incorrect parameters', function() {
                    expect(function() { map.removeLayer(); }).toThrow();
                    expect(function() { map.removeLayer(null); }).toThrow();
                    expect(function() { map.removeLayer(1); }).toThrow();
                    expect(function() { map.removeLayer('a'); }).toThrow();
                    expect(function() { map.removeLayer({}); }).toThrow();
                    expect(function() { map.removeLayer([]); }).toThrow();
                    expect(function() { map.removeLayer(new sGis.feature.Point([0,0])); }).toThrow();
                });

                it('should throw an exception if there is no such layer in the map', function() {
                    map.removeLayer(layer3);
                    expect(function() { map.removeLayer(layer3); }).toThrow();
                });
            });

            describe('.getLayerIndex()', function() {
                beforeEach(function() {
                    map.layers = [layer1, layer2, layer3];
                });

                it('should return the index of the layer in the layer list', function() {
                    expect(map.getLayerIndex(layer1)).toBe(0);
                    expect(map.getLayerIndex(layer2)).toBe(1);
                    expect(map.getLayerIndex(layer3)).toBe(2);
                });

                it('should return -1 if the layer is not on the map', function() {
                    map.removeLayer(layer2);
                    expect(map.getLayerIndex(layer2)).toBe(-1);
                });

                it('should return correct index after layer list change', function() {
                    map.removeLayer(layer2);
                    expect(map.getLayerIndex(layer3)).toBe(1);
                });

                it('should return -1 if the argument is not a layer', function() {
                    expect(map.getLayerIndex({})).toBe(-1);
                    expect(map.getLayerIndex('layer')).toBe(-1);
                    expect(map.getLayerIndex(123)).toBe(-1);
                    expect(map.getLayerIndex()).toBe(-1);
                });
            });

            describe('.moveLayerToIndex()', function() {
                var layer4;
                beforeEach(function() {
                    map.layers = [layer1, layer2, layer3];
                    layer4 = new sGis.FeatureLayer();
                });

                it('should move the layer to the specified index', function() {
                    map.moveLayerToIndex(layer1, 2);
                    expect(map.layers).toEqual([layer2, layer3, layer1]);

                    map.moveLayerToIndex(layer3, 0);
                    expect(map.layers).toEqual([layer3, layer2, layer1]);
                });

                it('should move the layer to the end of list if the index is higher then the number of layers on the map', function() {
                    map.moveLayerToIndex(layer2, 4);
                    expect(map.layers).toEqual([layer1, layer3, layer2]);

                    map.moveLayerToIndex(layer3, 1000);
                    expect(map.layers).toEqual([layer1, layer2, layer3]);
                });

                it('should count negative indexes from the end of the list', function() {
                    map.moveLayerToIndex(layer1, -1);
                    expect(map.layers).toEqual([layer2, layer3, layer1]);

                    map.moveLayerToIndex(layer3, -2);
                    expect(map.layers).toEqual([layer2, layer3, layer1]);
                });

                it('should move the layer to the beginning of the list if the negative value is higher then the number of layer on the map', function() {
                    map.moveLayerToIndex(layer2, -4);
                    expect(map.layers).toEqual([layer2, layer1, layer3]);

                    map.moveLayerToIndex(layer3, -10000);
                    expect(map.layers).toEqual([layer3, layer2, layer1]);
                });

                it('should add a layer to the map if it is not there yet', function() {
                    map.moveLayerToIndex(layer4, 1);
                    expect(map.layers).toEqual([layer1, layer4, layer2, layer3]);

                    map.removeLayer(layer1);
                    map.moveLayerToIndex(layer1, -2);
                    expect(map.layers).toEqual([layer4, layer2, layer1, layer3]);

                    map.removeLayer(layer4);
                    map.moveLayerToIndex(layer4, -1);
                    expect(map.layers).toEqual([layer2, layer1, layer3, layer4]);
                });

                it('should trigger a "layerOrderChange" event and provide the layer as a parameter', function() {
                    var arg1, arg2;
                    var handler1 = function(e) { arg1 = e.layer; };
                    var handler2 = function(e) { arg2 = e.layer; };

                    map.on('layerOrderChange', handler1);
                    map.on('layerAdd', handler2);

                    map.moveLayerToIndex(layer1, -2);
                    expect(arg1).toBe(layer1);
                    expect(arg2).toBe(undefined);
                });

                it('should fire a "layerAdd" event and not fire "layerOrderChange" if the layer is added to the map', function() {
                    var arg1, arg2;
                    var handler1 = function(e) { arg1 = e.layer; };
                    var handler2 = function(e) { arg2 = e.layer; };

                    map.on('layerOrderChange', handler1);
                    map.on('layerAdd', handler2);

                    map.moveLayerToIndex(layer4, 1);
                    expect(arg1).toBe(undefined);
                    expect(arg2).toBe(layer4);
                });

                it('should throw an exception if the first argument is not layer', function() {
                    expect(function() { map.moveLayerToIndex(undefined, 1); }).toThrow();
                    expect(function() { map.moveLayerToIndex(null, 1); }).toThrow();
                    expect(function() { map.moveLayerToIndex(1, 1); }).toThrow();
                    expect(function() { map.moveLayerToIndex({}, 1); }).toThrow();
                    expect(function() { map.moveLayerToIndex([layer1], 1); }).toThrow();
                });

                it('should throw an exceptions if the second argument is not an index', function() {
                    expect(function() { map.moveLayerToIndex(layer1, undefined); }).toThrow();
                    expect(function() { map.moveLayerToIndex(layer1, '1'); }).toThrow();
                    expect(function() { map.moveLayerToIndex(layer1, NaN); }).toThrow();
                    expect(function() { map.moveLayerToIndex(layer1, Infinity); }).toThrow();
                    expect(function() { map.moveLayerToIndex(layer1, {}); }).toThrow();
                    expect(function() { map.moveLayerToIndex(layer1, 1.5); }).toThrow();
                });
            });

            describe('moveLayerToTop', function() {
                var layer4;
                beforeEach(function() {
                    map.layers = [layer1, layer2, layer3];
                    layer4 = new sGis.FeatureLayer();
                });

                it('should move the layer to the end of the layer list', function() {
                    map.moveLayerToTop(layer1);
                    expect(map.layers).toEqual([layer2, layer3, layer1]);

                    map.moveLayerToTop(layer3);
                    expect(map.layers).toEqual([layer2, layer1, layer3]);
                });

                it('should add the layer if it is not on the map', function() {
                    map.moveLayerToTop(layer4);

                    expect(map.layers).toEqual([layer1, layer2, layer3, layer4]);
                });

                it('should trigger the "layerOrderChange" event if the layer was already on the map', function() {
                    var arg1, arg2;
                    var handler1 = function(e) { arg1 = e.layer; };
                    var handler2 = function(e) { arg2 = e.layer; };

                    map.on('layerOrderChange', handler1);
                    map.on('layerAdd', handler2);

                    map.moveLayerToTop(layer2);

                    expect(arg1).toBe(layer2);
                    expect(arg2).toBe(undefined);
                });

                it('should trigger the "layerAdd" event if the layer was not on the map', function() {
                    var arg1, arg2;
                    var handler1 = function(e) { arg1 = e.layer; };
                    var handler2 = function(e) { arg2 = e.layer; };

                    map.on('layerOrderChange', handler1);
                    map.on('layerAdd', handler2);

                    map.moveLayerToTop(layer4);

                    expect(arg1).toBe(undefined);
                    expect(arg2).toBe(layer4);
                });

                it('should throw an exception if the argument is not a layer', function() {
                    expect(function() { map.moveLayerToTop(); }).toThrow();
                    expect(function() { map.moveLayerToTop(1); }).toThrow();
                    expect(function() { map.moveLayerToTop('layer'); }).toThrow();
                    expect(function() { map.moveLayerToTop([layer1]); }).toThrow();
                    expect(function() { map.moveLayerToTop({}); }).toThrow();
                });
            });

            describe('.move()', function() {
                var map;
                beforeEach(function() {
                    map = new sGis.Map();
                });

                it('should move the position of the map by the specified amount', function() {
                    map.wrapper = 'map';
                    var position = map.position;
                    map.move(10, 20);
                    var newPosition = map.position;
                    expect(position.x + 10).toBe(newPosition.x);
                    expect(position.y + 20).toBe(newPosition.y);
                });

                it('should work with no wrapper', function() {
                    var position = map.position;
                    map.move(10, 20);
                    var newPosition = map.position;
                    expect(position.x + 10).toBe(newPosition.x);
                    expect(position.y + 20).toBe(newPosition.y);
                });

                it('should fire the "bboxChange" event', function() {
                    map.wrapper = 'map';
                    var fired = false;
                    var handler = function() { fired = true; };
                    map.on('bboxChange', handler);
                    map.move(10, 20);
                    expect(fired).toBe(true);
                });

                it('should throw an exception if the input is incorrect', function() {
                    expect(function() { map.move(); }).toThrow();
                    expect(function() { map.move(10); }).toThrow();
                    expect(function() { map.move(undefined, 20); }).toThrow();
                    expect(function() { map.move(NaN, 0); }).toThrow();
                    expect(function() { map.move('10', 10); }).toThrow();
                    expect(function() { map.move(10, '10'); }).toThrow();
                    expect(function() { map.move([10,10]); }).toThrow();
                    expect(function() { map.move({x:10, y:10}); }).toThrow();
                    expect(function() { map.move(null, null); }).toThrow();
                });
            });
        });
    });
});