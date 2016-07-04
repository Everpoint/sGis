sGis.module('serializer.symbolSerializer', [
    'utils'
], (utils) => {
    
    'use strict';

    /**
     * @namespace sGis.serializer
     */
    
    var symbolDescriptions = {};

    /**
     * @alias sGis.serializer.symbolSerializer
     */
    return {
        registerSymbol: (constructor, description, properties) => {
            symbolDescriptions[description] = {Constructor: constructor, properties: properties};
        },

        serialize: (symbol) => {
            var keys = Object.keys(symbolDescriptions);
            for (var i = 0; i < keys.length; i++) {
                var desc = symbolDescriptions[keys[i]];

                if (symbol instanceof desc.Constructor) {
                    var serialized = {symbolName: keys[i]};
                    desc.properties.forEach(prop => {
                        serialized[prop] = symbol[prop];
                    });
                    return serialized;
                }
            }

            utils.error('Unknown type of symbol.');
        },
        
        deserialize: (desc) => {
            if (!symbolDescriptions[desc.symbolName]) utils.error('Unknown type of symbol.');
            var symbol = new symbolDescriptions[desc.symbolName].Constructor();
            symbolDescriptions[desc.symbolName].properties.forEach(prop => { symbol[prop] = desc[prop]; });
            
            return symbol;
        }
    };
    
});