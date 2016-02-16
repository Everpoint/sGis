'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('Controls', function() {
        var map;

        beforeEach(function() {
            $('#map').width(500).height(500);
            map = new sGis.Map({ wrapper: 'map' });
        });

        afterEach(function() {
            $('#map').html('').width(0).height(0);;
        });

        describe('BaseLayerSwitch', function() {
            var baseLayerSwitch, layer1, layer2, layer3;

            beforeEach(function() {
                baseLayerSwitch = new sGis.controls.BaseLayerSwitch(map);
                layer1 = new sGis.TileLayer('url');
                layer2 = new sGis.TileLayer('url1');
                layer3 = new sGis.ESRIDynamicLayer('url2');
            });

            describe('creation', function() {
                it('should throw an exception if map is not specified correctly', function() {
                    expect(function() { new sGis.controls.BaseLayerSwitch(); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(1); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch('not a map'); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch({}); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch([]); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(null); }).toThrow();
                });

                it('should set the map', function() {
                    expect(baseLayerSwitch.map).toBe(map);
                });

                it('should set the list of base layers correctly', function() {
                    expect(baseLayerSwitch.layers).toEqual([]);

                    baseLayerSwitch = new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, layer2] });
                    expect(baseLayerSwitch.layers).toEqual([layer1, layer2]);
                });

                it('should throw an exception in case of incorrect layers', function() {
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, 'layer'] }); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, 1] }); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, null] }); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, {}] }); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, []] }); }).toThrow();
                    expect(function() { new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, layer2, layer3] }); }).toThrow();
                });

                it('should leave only one of the layers on the map', function() {
                    map.addLayer(layer1);
                    map.addLayer(layer2);

                    baseLayerSwitch.layers = [layer1, layer2];
                    expect(map.getLayerIndex(layer1)).toBe(-1);
                    expect(map.getLayerIndex(layer2)).toBe(0);
                });

                it('should set the active status according to isActive setting', function() {
                    baseLayerSwitch = new sGis.controls.BaseLayerSwitch(map, { layers: [layer1, layer2], isActive: true });
                    expect(baseLayerSwitch.isActive).toBe(true);
                });
            });

            describe('properties', function() {
                it('.map should return the map of the control', function() {
                    expect(baseLayerSwitch.map).toBe(map);
                });

                it('.map should be available only for reading', function() {
                    var map1 = new sGis.Map();
                    expect(function() { baseLayerSwitch.map = map1; }).toThrow();
                });

                it('.layers set and should return copy of the layer array', function() {
                    var list = [layer1, layer2];
                    baseLayerSwitch.layers = list;
                    expect(baseLayerSwitch.layers).toEqual(list);
                    expect(baseLayerSwitch.layers).not.toBe(list);
                });

                it('.layers should raise an exception in case of incorrect layer', function() {
                    expect(function() { baseLayerSwitch.layers = [layer1, 'layer']; }).toThrow();
                    expect(function() { baseLayerSwitch.layers = [layer1, 1]; }).toThrow();
                    expect(function() { baseLayerSwitch.layers = [layer1, null]; }).toThrow();
                    expect(function() { baseLayerSwitch.layers = [layer1, {}]; }).toThrow();
                    expect(function() { baseLayerSwitch.layers = [layer1, []]; }).toThrow();
                    expect(function() { baseLayerSwitch.layers = [layer1, layer2, layer3]; }).toThrow();
                });

                it('.activeLayer should return null if no active layer is specified', function() {
                    expect(baseLayerSwitch.activeLayer).toBe(null);
                });

                it('.activeLayer should set and return the currently active base layer', function() {
                    baseLayerSwitch.layers = [layer1, layer2];
                    baseLayerSwitch.activeLayer = layer2;
                    expect(baseLayerSwitch.activeLayer).toBe(layer2);
                });

                it('.activeLayer should throw an exception if argument is not in the list', function() {
                    expect(function() { baseLayerSwitch.activeLayer = layer1; }).toThrow();

                    baseLayerSwitch.layers = [layer1, layer2];
                    expect(function() { baseLayerSwitch.activeLayer = undefined; }).toThrow();
                    expect(function() { baseLayerSwitch.activeLayer = 1; }).toThrow();
                    expect(function() { baseLayerSwitch.activeLayer = 'layer1'; }).toThrow();
                    expect(function() { baseLayerSwitch.activeLayer = layer3; }).toThrow();
                });

                it('.activeLayer should make the layer visible', function() {
                    layer1.isDisplayed = false;
                    map.addLayer(layer1);
                    baseLayerSwitch.addLayer(layer1);
                    baseLayerSwitch.activeLayer = layer1;

                    expect(layer1.isDisplayed).toBe(true);
                });

                it('.activeLayer should remove the previous active layer from the map', function() {
                    baseLayerSwitch.layers = [layer1, layer2];
                    baseLayerSwitch.activeLayer = layer1;
                    baseLayerSwitch.activeLayer = layer2;
                    expect(layer2.isDisplayed).toBe(true);

                    expect(map.getLayerIndex(layer1)).toBe(-1);
                });

                it('.activeLayer should add the layer to the map to the 0 index if there is no active layer yet', function() {
                    baseLayerSwitch.addLayer(layer1);
                    baseLayerSwitch.activeLayer = layer1;
                    expect(map.getLayerIndex(layer1)).toBe(0);
                });

                it('.activeLayer should add the layer to the map to the current layer index', function() {
                    map.addLayer(layer3);
                    map.addLayer(layer1);
                    baseLayerSwitch.layers = [layer1, layer2];

                    expect(map.getLayerIndex(layer1)).toBe(1);

                    baseLayerSwitch.activeLayer = layer2;
                    expect(map.getLayerIndex(layer2)).toBe(1);
                });
            });

            describe('methods', function() {
                it('.addLayer() should add a layer to the list', function() {
                    baseLayerSwitch.addLayer(layer1);
                    expect(baseLayerSwitch.layers).toEqual([layer1]);
                    baseLayerSwitch.addLayer(layer2);
                    expect(baseLayerSwitch.layers).toEqual([layer1, layer2]);
                });

                it('.addLayer() should throw if an argument is not a layer', function() {
                    expect(function() { baseLayerSwitch.addLayer(); }).toThrow();
                    expect(function() { baseLayerSwitch.addLayer(1); }).toThrow();
                    expect(function() { baseLayerSwitch.addLayer('not a layer'); }).toThrow();
                    expect(function() { baseLayerSwitch.addLayer([]); }).toThrow();
                    expect(function() { baseLayerSwitch.addLayer({}); }).toThrow();
                });

                it('.addLayer() should throw an exception if the layer is already in the list', function() {
                    baseLayerSwitch.addLayer(layer1);
                    expect(function() { baseLayerSwitch.addLayer(layer1); }).toThrow();
                });

                it('.addLayer() should set the layer as an acitve one if it is already on the map', function() {
                    map.addLayer(layer2);
                    baseLayerSwitch.addLayer(layer1);
                    expect(baseLayerSwitch.activeLayer).toBe(null);

                    baseLayerSwitch.addLayer(layer2);
                    expect(baseLayerSwitch.activeLayer).toBe(layer2);

                    var layer4 = new sGis.TileLayer('ururl');
                    map.addLayer(layer4);
                    baseLayerSwitch.addLayer(layer4);
                    expect(baseLayerSwitch.activeLayer).toBe(layer4);
                });

                it('.activate() should set the active layer if it is not set before', function() {
                    baseLayerSwitch.layers = [layer1, layer2];
                    baseLayerSwitch.activate();
                    expect(baseLayerSwitch.activeLayer).toBe(layer1);
                });

                it('.activate() should make the control active only if there are layers in the list', function() {
                    baseLayerSwitch.activate();
                    expect(baseLayerSwitch.isActive).toBe(false);
                });
            });
        });

    });
});