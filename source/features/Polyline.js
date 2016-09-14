sGis.module('feature.Polyline', [
    'feature.Poly',
    'symbol.polyline.Simple'
], function(Poly, PolylineSymbol) {

    'use strict';

    /**
     * A line or a set of geographical lines.
     * @alias sGis.feature.Polyline
     * @extends sGis.feature.Poly
     */
    class Polyline extends Poly {
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.Polyline}
         */
        clone() {
            return new Polyline(this.rings, {crs: this.crs, symbol: this.originalSymbol});
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Polyline
     * @type {sGis.Symbol}
     * @instance
     * @default new sGis.symbol.polyline.Simple()
     */
    Polyline.prototype._symbol = new PolylineSymbol();

    return Polyline;

});
