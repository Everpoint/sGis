/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
    
    utils.css = {
        transition: document.body.style.transition !== undefined ? {func: 'transition', rule: 'transition'} : 
                    document.body.style.webkitTransition !== undefined ? {func: 'webkitTransition', rule: '-webkit-transition'} : 
                    document.body.style.msTransition !== undefined ? {fund: 'msTransition', rule: '-ms-transition'} :
                    null,
        transform:  document.body.style.transform !== undefined ? {func: 'transform', rule: 'transform'} : 
                    document.body.style.webkitTransform !== undefined ? {func: 'webkitTransform', rule: '-webkit-transform'} : 
                    document.body.style.msTransform !== undefined ? {func: 'msTransform', rule: '-ms-ransform'} : null
    };
    
    
    describe('Drawing vector grafics on map', function() {
        $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');
        var map = new sGis.Map('map'),
            layer = new sGis.FeatureLayer();
//            features = [],
//            k = 5;
//        map.addLayer(layer);
//
//        for (var i = 0; i < 10000; i++) {
//            features.push(new sGis.feature.Point([55.755831 + Math.random() * k, 37.617673 + Math.random() * k]));
//            features.push(new sGis.feature.Polyline([[55.755831 + Math.random() * k, 37.617673 + Math.random() * k], [55.755831 + Math.random() * k, 37.617673 + Math.random() * k]]));
//            features.push(new sGis.feature.Polygon([[55.755831 + Math.random() * k, 37.617673 + Math.random() * k], [55.755831 + Math.random() * k, 37.617673 + Math.random() * k], [55.755831 + Math.random() * k, 37.617673 + Math.random() * k]]));
//        }
//        
//        it('10000 objects of each type', function() {
//            layer.add(features);
//            map.redrawLayer(layer);
//        });

    });
    
});
