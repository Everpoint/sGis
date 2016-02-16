'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

   /*
    * sGis.Painter
    */

    describe('Painter', function() {
        var map, featureLayer;
        
        beforeEach(function() {
            $('#map').width(500).height(500);
            map = new sGis.Map({wrapper: 'map'});
            featureLayer = new sGis.FeatureLayer();
        });

        afterEach(function() {
            $('#map').html('').width(0).height(0);
        });
        
        
        describe('creation', function() {
//            it('should be created with default parameters and throw exceptions in case of incorrect parameters', function() {
//                expect(function() {new utils.Painter();}).toThrow();
//                expect(function() {new utils.Painter(1);}).toThrow();
//                expect(function() {new utils.Painter('a');}).toThrow();
//                expect(function() {new utils.Painter({});}).toThrow();
//                
//                var map = new sGis.Map(),
//                    painter = new utils.Painter(map);
//             
//                expect(painter).toBeDefined();
//            });
        });
        
        describe('drawing', function() {
            it('should ignore the tile layer if it cannot be displayed in current crs', function() {
                var tileLayer = new sGis.TileLayer('url', {crs: sGis.CRS.plain});
                
                expect(function() {map.addLayer(tileLayer);}).not.toThrow();
            });
            
            it('should ignore the features, that cannot be projected to the map crs', function() {
                var point = new sGis.feature.Point([0, 0], {crs: sGis.CRS.plain});
                featureLayer.add(point);
                expect(function() {map.addLayer(featureLayer);}).not.toThrow();
            });
        });
    });
});