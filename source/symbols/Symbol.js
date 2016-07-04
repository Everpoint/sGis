sGis.module('Symbol', [
    'utils',
    'serializer.symbolSerializer'
], function(utils, symbolSerializer) {

    'use strict';

    /**
     * @namespace sGis.symbol
     */

    /**
     * Empty symbol, base class for all other symbol classes. If this symbol is assigned to a feature, the feature will not be rendered.
     * @alias sGis.Symbol
     */
    class Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            utils.init(this, properties, true);
        }

        /**
         * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
         * If the symbol cannot render provided feature, empty array is returned.
         * @param {sGis.Feature} feature - feature to be drawn.
         * @param {Number} resolution - resolution of the render.
         * @param {sGis.Crs} crs - target coordinate system of the render.
         * @returns {sGis.IRender[]}
         */
        renderFunction(feature, resolution, crs) {
            return [];
        }

        /**
         * Returns a copy of the symbol. Only essential properties are copied.
         * @returns {sGis.Symbol}
         */
        clone() {
            var desc = symbolSerializer.serialize(this);
            return symbolSerializer.deserialize(desc);
        }
    }

    return Symbol;
    
});
