sGis.module('controls.Polyline', [
    'controls.Poly',
    'feature.Polyline'
], function(Polyg, PolylineF) {
    'use strict';

    var Polyline = function(map, options) {
        this._initialize(map, options);
    };

    Polyline.prototype = new sGis.controls.Poly({
        _featureClass: sGis.feature.Polyline
    });

    return Polyline;

});


