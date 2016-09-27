sGis.module('controls.Polyline', [
    'controls.Poly',
    'feature.Polyline',
    'symbol.polyline.Simple'
], function(Poly, Polyline, PolylineSymbol) {
    
    'use strict';

    /**
     * Control for drawing polyline features.
     * @alias sGis.control.Polyline
     * @extends sGis.controls.Poly
     */
    class PolylineControl extends Poly {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties) {
            super(Polyline, new PolylineSymbol(), map, properties);
        }
    }

    /**
     * Symbol of the created features
     * @member {sGis.Symbol} sGis.controls.Polyline#symbol
     * @default new sGis.symbol.polyline.Simple()
     */

    return PolylineControl;

});


