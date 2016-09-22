sGis.module('controls.Polygon', [
    'controls.Poly',
    'feature.Polygon',
    'symbol.polygon.Simple'
], function(Poly, Polygon, PolygonSymbol) {
    
    'use strict';

    class PolygonControl extends Poly {
        constructor(map, options) {
            super(Polygon, new PolygonSymbol(), map, options);
        }
    }
    
    return PolygonControl;

});



