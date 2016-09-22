sGis.module('controls.Polyline', [
    'controls.Poly',
    'feature.Polyline',
    'symbol.polyline.Simple'
], function(Poly, Polyline, PolylineSymbol) {
    
    'use strict';

    class PolylineControl extends Poly {
        constructor(map, options) {
            super(Polyline, new PolylineSymbol(), map, options);
        }
    }
    
    return PolylineControl;

});


