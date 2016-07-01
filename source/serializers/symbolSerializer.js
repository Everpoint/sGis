sGis.module('serializer.symbolSerializer', [
    'utils'
], (utils) => {
    
    'use strict';
    
    var symbolDescriptions = {};

    return {
        registerSymbol: (constructor, description, properties) => {
            symbolDescriptions[description] = {Constructor: constructor, properties: properties};
        },

        serialize: (symbol) => {
            var keys = Object.keys(symbolDescriptions);
            for (var i = 0; i < keys.length; i++) {
                var desc = symbolDescriptions[keys[i]];

                if (symbol instanceof desc.Constructor) {
                    var serialized = {name: keys[i]};
                    desc.properties.forEach(prop => {
                        serialized[prop] = symbol[prop];
                    });
                    return desc;
                }
            }

            utils.error('Unknown type of symbol.');
        },
        
        deserialize: (desc) => {
            if (!symbolDescriptions[desc.name]) utils.error('Unknown type of symbol.');
            var symbol = new symbolDescriptions[desc.name].Constructor();
            symbolDescriptions[desc.name].properties.forEach(prop => { symbol[prop] = desc[prop]; });
            
            return symbol;
        }
    };
    
});