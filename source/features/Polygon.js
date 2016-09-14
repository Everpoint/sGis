sGis.module('feature.Polygon', [
    'feature.Poly',
    'symbol.polygon.Simple'
], function(Poly, PolygonSymbol) {
    
    'use strict';

    /**
     * Polygon with one or more contours (rings). Coordinates in the contours must not be enclosed (first and last points must not be same).
     * @alias sGis.feature.Polygon
     * @extends sGis.feature.Poly
     */
    class Polygon extends Poly {
        /**
         * Returns a copy of the feature. Only generic properties are copied.
         * @returns {sGis.feature.Polygon}
         */
        clone() {
            return new Polygon(this.rings, {crs: this.crs, symbol: this.originalSymbol});
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Polygon
     * @type {sGis.Symbol}
     * @instance
     * @default new sGis.symbol.polygon.Simple()
     */
    Polygon.prototype._symbol = new PolygonSymbol();

    return Polygon;

});
