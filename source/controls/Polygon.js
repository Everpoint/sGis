sGis.module('controls.Polygon', [
    'controls.Poly',
    'feature.Polygon'
], function(Polyg, PolygonF) {
    'use strict';

    var Polygon = function(map, options) {
        this._initialize(map, options);
    };

    Polygon.prototype = new sGis.controls.Poly({
        _featureClass: sGis.feature.Polygon
    });

    return Polygon;

});



