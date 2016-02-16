'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('TileLayer', function() {
        var map,
            customTileScheme = {
                tileWidth: 32,
                tileHeight: 32,
                dpi: 96,
                origin: {
                    x: -512,
                    y: 512
                },
                matrix: {
                    '0': {
                        resolution: 32,
                        scale: 32
                    },
                    '1': {
                        resolution: 16,
                        scale: 32
                    },
                    '2': {
                        resolution: 8,
                        scale: 32
                    }
                }
            };

        var map;
        var triggerAnimationFrame;
        var tileLayer;

        beforeEach(function() {
            $('#map').width(500).height(500).show();
            map = new sGis.Map({wrapper: 'map'});
            tileLayer = new sGis.TileLayer('url/{z}/{y}/{x}');

            var callsList = [];

            spyOn(utils, 'requestAnimationFrame').and.callFake(function (f) {
                callsList.push(f);
                triggerAnimationFrame = function () {
                    callsList.forEach(function(handler) { handler(); });
                };
            });
            map = new sGis.Map({wrapper: 'map'});

            triggerAnimationFrame();
        });

        afterEach(function() {
            $('#map').html('').width(0).height(0).hide();
        });

        describe('creation', function() {
            it('should throw if source url is not specified', function() {
                expect(function() {var tileLayer = new sGis.TileLayer();}).toThrow();
                expect(function() {var tileLayer = new sGis.TileLayer('');}).toThrow();
                expect(function() {var tileLayer = new sGis.TileLayer(1);}).toThrow();
                expect(function() {var tileLayer = new sGis.TileLayer([]);}).toThrow();
                expect(function() {var tileLayer = new sGis.TileLayer({});}).toThrow();
            });

            it('should set the parameters correctly', function() {
                var tileLayer = new sGis.TileLayer('url', {tileScheme: customTileScheme, crs: sGis.CRS.ellipticalMercator});

                expect(tileLayer.tileScheme).toBe(customTileScheme);
                expect(tileLayer.crs).toBe(sGis.CRS.ellipticalMercator);
            });
        });

        describe('methods', function() {
            it('.getTileUrl() should replace placeholders with specified tileIndexes', function() {
                var tileLayer1 = new sGis.TileLayer('url/{z}/{y}/{x}');
                expect(tileLayer1.getTileUrl(1, 2, 3)).toBe('url/3/2/1');

                var tileLayer2 = new sGis.TileLayer('url/?x={x}&y={y}');
                expect(tileLayer2.getTileUrl(25, 11100)).toBe('url/?x=25&y=11100');
            });

            it('.getFeatures() should throw an exception in case of incorrect parameters', function() {
                expect(function() {tileLayer.getFeatures();}).toThrow();
                expect(function() {tileLayer.getFeatures(map.bbox);}).toThrow();
                expect(function() {tileLayer.getFeatures(null, map.resolution);}).toThrow();
                expect(function() {tileLayer.getFeatures(map.bbox, map.resolution);}).not.toThrow();
            });

            it('.getFeatures() should return the array of image features', function() {
                var features = tileLayer.getFeatures(map.bbox, map.resolution);
                expect(features.length > 0).toBe(true);
                for (var i = 0; i < features.length; i++) {
                    expect(features[i] instanceof sGis.feature.Image).toBe(true);
                }
            });
        });

        describe('properties', function() {

        });
    });

    describe('Layer Group', function() {
        var layer1, layer2, layer3, layer4, layer5;

        beforeEach(function() {
            $('#map').width(500).height(500);

            layer1 = new sGis.TileLayer('url', { name: 'layer1' });
            layer2 = new sGis.ESRIDynamicLayer('url', { name: 'layer2' });
            layer3 = new sGis.FeatureLayer({ name: 'layer3' });
            layer4 = new sGis.FeatureLayer({ name: 'layer4' });
            layer5 = new sGis.FeatureLayer({ name: 'layer5' });
        });

        afterEach(function() {
            $('#map').html('').width(0).height(0);;
        });

        describe('creation', function() {
            it('should throw exceptions with incoreect parameters', function() {
                expect(function() { new sGis.LayerGroup(1); }).toThrow();
                expect(function() { new sGis.LayerGroup('a'); }).toThrow();
                expect(function() { new sGis.LayerGroup({}); }).toThrow();
                expect(function() { new sGis.LayerGroup([1]); }).toThrow();
                expect(function() { new sGis.LayerGroup(['a']); }).toThrow();
                expect(function() { new sGis.LayerGroup([[layer1]]); }).toThrow();
            });

            it('should create an object with default parameters', function() {
                var layerGroup = new sGis.LayerGroup();

                expect(layerGroup.layers).toEqual([]);
            });

            it('should set the layer list correctly', function() {
                var list = [layer1, layer2, layer3],
                    layerGroup = new sGis.LayerGroup(list);

                expect(layerGroup.layers).toEqual(list);
                expect(layerGroup.layers).not.toBe(list);
            });
        });

        describe('methods', function() {
            var layerGroup, layerGroup1;
            beforeEach(function() {
                layerGroup = new sGis.LayerGroup([layer1, layer2, layer3]);
                layerGroup1 = new sGis.LayerGroup([layer4, layer5]);
            });

            it('.addLayer() should throw if the value is not layer', function() {
                expect(function() { layerGroup.addLayer(); }).toThrow();
                expect(function() { layerGroup.addLayer(1); }).toThrow();
                expect(function() { layerGroup.addLayer({}); }).toThrow();
                expect(function() { layerGroup.addLayer([]); }).toThrow();
                expect(function() { layerGroup.addLayer('layer'); }).toThrow();
            });

            it('.addLayer() should throw if the layer is already in the group', function() {
                expect(function() { layerGroup.addLayer(layer1); }).toThrow();
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3]);
            });

            it('.addLayer() should add the layer to the end of group', function() {
                layerGroup.addLayer(layer4);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3, layer4]);

                layerGroup.addLayer(layer5);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3, layer4, layer5]);
            });

            it('.addLayer() should fire the "layerAdd" event', function() {
                var fired = false;
                layerGroup.addListener('layerAdd', function() {
                    fired = true;
                });
                layerGroup.addLayer(layer4);
                expect(fired).toBe(true);
            });

            it('.addLayer() should add LayerGroup to the group', function() {
                layerGroup.addLayer(layerGroup1);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3, layerGroup1]);
            });

            it('.addLayer() should throw if being added layerGroup contains one or more layers, that are already in the group', function() {
                layerGroup1.addLayer(layer2);
                expect(function() { layerGroup.addLayer(layerGroup1); }).toThrow();
            });

            it('.addLayer() should throw if being added layer is in one of the layerGroups that are in the group', function() {
                layerGroup.addLayer(layerGroup1);
                expect(function() { layerGroup.addLayer(layer4); }).toThrow();
            });

            it('addLayer() should throw if any of the subgroups contains the layer being added', function() {
                var layerGroup2 = new sGis.LayerGroup([layer1]);
                layerGroup1.addLayer(layerGroup2);
                expect(function() { layerGroup.addLayer(layerGroup1); }).toThrow();
            });

            it('addLayer() should throw if the layer group being added is the group itself', function() {
                expect(function() { layerGroup.addLayer(layerGroup); }).toThrow();
                layerGroup.addLayer(layerGroup1);
                expect(function() { layerGroup1.addLayer(layerGroup); }).toThrow();
            });

            it('.removeLayer() should throw in case of incorrect parameters', function() {
                expect(function() { layerGroup.removeLayer(); }).toThrow();
                expect(function() { layerGroup.removeLayer(1); }).toThrow();
                expect(function() { layerGroup.removeLayer('a'); }).toThrow();
                expect(function() { layerGroup.removeLayer([]); }).toThrow();
                expect(function() { layerGroup.removeLayer({}); }).toThrow();
            });

            it('.removeLayer() should throw if the layer is not in the group', function() {
                expect(function() { layerGroup.removeLayer(layer4); }).toThrow();
            });

            it('.removeLayer() should remove the specified layer from the group', function() {
                layerGroup.removeLayer(layer2);
                expect(layerGroup.layers).toEqual([layer1, layer3]);
                layerGroup.removeLayer(layer3);
                expect(layerGroup.layers).toEqual([layer1]);
                layerGroup.removeLayer(layer1);
                expect(layerGroup.layers).toEqual([]);
            });

            it('.removeLayer() should fire "layerRemove"', function() {
                var fired = false;
                layerGroup.addListener('layerRemove', function() {
                    fired = true;
                });
                layerGroup.removeLayer(layer1);
                expect(fired).toBe(true);
            });

            it('.removeLayer() should remove layer group from the group', function() {
                layerGroup.addLayer(layerGroup1);
                layerGroup.removeLayer(layerGroup1);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3]);
            });

            it('.removeLayer() should throw if the layer in any of the subgroups', function() {
                layerGroup.addLayer(layerGroup1);
                expect(function() { layerGroup.removeLayer(layer4); }).toThrow();
            });

            it('.removeLayer(layer, true) should remove the layer from any of the subgroups', function() {
                layerGroup.addLayer(layerGroup1);
                layerGroup.removeLayer(layer4, true);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3, layerGroup1]);
                expect(layerGroup1.layers).toEqual([layer5]);

                var layerGroup2 = new sGis.LayerGroup([layer4]);
                layerGroup1.addLayer(layerGroup2);
                layerGroup.removeLayer(layer4, true);
                expect(layerGroup2.layers).toEqual([]);
            });

            it('.contains() should throw in case of incorrect parameters', function() {
                expect(function() { layerGroup.contains(); }).toThrow();
                expect(function() { layerGroup.contains('a'); }).toThrow();
                expect(function() { layerGroup.contains(1); }).toThrow();
                expect(function() { layerGroup.contains({}); }).toThrow();
                expect(function() { layerGroup.contains([]); }).toThrow();
                expect(function() { layerGroup.contains([layer1]); }).toThrow();
            });

            it('.contains() should return true if the layer is in the group or false otherwise', function() {
                expect(layerGroup.contains(layer1)).toBe(true);
                expect(layerGroup.contains(layer3)).toBe(true);
                expect(layerGroup.contains(layer4)).toBe(false);
                expect(layerGroup.contains(layer5)).toBe(false);
            });

            it('contains() should return true if any of sublayers contains the layers', function() {
                layerGroup.addLayer(layerGroup1);
                expect(layerGroup.contains(layer5)).toBe(true);

                layerGroup.layers = [layer1, layerGroup1, new sGis.LayerGroup([layer3])];
                expect(layerGroup.contains(layer3)).toBe(true);
                expect(layerGroup.contains(layer2)).toBe(false);
            });

            it('.indexOf() should return the index of the layer in the group', function() {
                expect(layerGroup.indexOf(layer2)).toBe(1);
                expect(layerGroup.indexOf(layer1)).toBe(0);
                expect(layerGroup.indexOf(layer3)).toBe(2);

                layerGroup.addLayer(layerGroup1);
                expect(layerGroup.indexOf(layerGroup1)).toBe(3);
            });

            it('.insertLayer() should throw in case of incorrect parameters', function() {
                expect(function() { layerGroup.insertLayer(); }).toThrow();
                expect(function() { layerGroup.insertLayer(1, 1); }).toThrow();
                expect(function() { layerGroup.insertLayer('1', 1); }).toThrow();
                expect(function() { layerGroup.insertLayer({}, 1); }).toThrow();
                expect(function() { layerGroup.insertLayer([], 1); }).toThrow();
                expect(function() { layerGroup.insertLayer(layer4, 'a'); }).toThrow();
                expect(function() { layerGroup.insertLayer(layer4, []); }).toThrow();
                expect(function() { layerGroup.insertLayer(layer4); }).toThrow();
            });

            it('.insertLayer() should throw if trying to insert self', function() {
                expect(function() { layerGroup.insertLayer(layerGroup, 1); }).toThrow();

                layerGroup1.addLayer(layerGroup);
                expect(function() { layerGroup.insertLayer(layerGroup1, 1); }).toThrow();
            });

            it('.insertLayer() should insert the layer into specified position', function() {
                layerGroup.insertLayer(layer4, 1);
                expect(layerGroup.layers).toEqual([layer1, layer4, layer2, layer3]);

                layerGroup1.removeLayer(layer4);
                layerGroup.insertLayer(layerGroup1, 0);
                expect(layerGroup.layers).toEqual([layerGroup1, layer1, layer4, layer2, layer3]);
            });

            it('.inserLayer() should add to the end of the list if the index is bigger then the length of the list', function() {
                layerGroup.insertLayer(layer4, 10);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer3, layer4]);
            });

            it('.inserLayer() should understand the negative indexes, and add to the beginning of the list if index is less then -length', function() {
                layerGroup.insertLayer(layer4, -2);
                expect(layerGroup.layers).toEqual([layer1, layer2, layer4, layer3]);

                layerGroup.insertLayer(layer5, -10);
                expect(layerGroup.layers).toEqual([layer5, layer1, layer2, layer4, layer3]);
            });

            it('.inserLayer() should move the layer if it is already in the group', function() {
                layerGroup.insertLayer(layer1, 1);
                expect(layerGroup.layers).toEqual([layer2, layer1, layer3]);
                layerGroup.insertLayer(layer3, 0);
                expect(layerGroup.layers).toEqual([layer3, layer2, layer1]);
                layerGroup.insertLayer(layer2, -2);
                expect(layerGroup.layers).toEqual([layer3, layer2, layer1]);
                layerGroup.insertLayer(layer2, 5);
                expect(layerGroup.layers).toEqual([layer3, layer1, layer2]);
            });

            it('.insertLayer() should fire "layerAdd" event', function() {
                var fired = false;
                layerGroup.addListener('layerAdd', function() {
                    fired = true;
                });
                layerGroup.insertLayer(layer4, 1);
                expect(fired).toBe(true);
            });
        });

        describe('properties', function() {
            var layerGroup;
            beforeEach(function() {
                layerGroup = new sGis.LayerGroup([layer1, layer2, layer3]);
            });

            it('.layers should throw if the value is incorrect', function() {
                expect(function() { layerGroup.layers = 1; }).toThrow();
                expect(function() { layerGroup.layers = 'a'; }).toThrow();
                expect(function() { layerGroup.layers = {}; }).toThrow();
            });

            it('.layers should set and return copy of the layer list', function() {
                var list = [layer5, layer4, layer3];
                layerGroup.layers = list;
                expect(layerGroup.layers).toEqual(list);
                expect(layerGroup.layers).not.toBe(list);

                layerGroup.layers = [];
                expect(layerGroup.layers).toEqual([]);
            });
        });
    });
});