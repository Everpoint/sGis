'use strict';

$(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    describe('sGis.FeatureLayer', function () {
        var map, layer, point, line, polygon;
        beforeEach(function () {
            $('#map').width(500).height(500);
            map = new sGis.Map({wrapper: 'map'});
            layer = new sGis.FeatureLayer();
            point = new sGis.feature.Point([10, 10]);
            line = new sGis.feature.Polyline([[15, 15], [16, 16]]);
            polygon = new sGis.feature.Polygon([[5, 5], [6, 6], [5, 6]]);
        });

        afterEach(function () {
            $('#map').html('').width(0).height(0);
        });

        describe('events', function() {
            describe('featureAdd', function() {
                it('should be fired when a feature is added to the layer, and should return the feature as a parameter', function() {
                    var feature;
                    var handler = function(sGisEvent) {
                        feature = sGisEvent.feature;
                    };

                    layer.addListener('featureAdd', handler);

                    layer.add(point);
                    expect(feature).toBe(point);
                });

                it('should be fired for each feature added to the layer', function() {
                    var features = [];
                    var handler = function(sGisEvent) {
                        features.push(sGisEvent.feature);
                    };

                    layer.addListener('featureAdd', handler);

                    layer.add([point, polygon, line]);
                    expect(features).toEqual([point, polygon, line]);
                });

                it('should be fired when the features are added through the .features property', function() {
                    var features = [];
                    var handler = function(sGisEvent) {
                        features.push(sGisEvent.feature);
                    };

                    layer.addListener('featureAdd', handler);

                    layer.features = [point, polygon, line];
                    expect(features).toEqual([point, polygon, line]);
                });
            });
        });

    });
});