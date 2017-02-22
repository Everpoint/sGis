sGis.module('serializer.symbolSerializer', [
    'utils',
    'utils.Color'
], (utils, Color) => {
    
    'use strict';

    /**
     * @namespace sGis.serializer
     */
    
    let symbolDescriptions = {};

    /**
     * @alias sGis.serializer.symbolSerializer
     */
    return {
        registerSymbol: (constructor, description, properties) => {
            symbolDescriptions[description] = {Constructor: constructor, properties: properties};
        },

        serialize: (symbol, colorsFormat = null) => {
            let keys = Object.keys(symbolDescriptions);
            for (let i = 0; i < keys.length; i++) {
                let desc = symbolDescriptions[keys[i]];

                if (symbol instanceof desc.Constructor) {
                    let serialized = {symbolName: keys[i]};
                    desc.properties.forEach(prop => {
                        let value = symbol[prop];
                        if (colorsFormat) {
                            let color = new Color(value);
                            if (color.isValid) value = color.toString(colorsFormat);
                        }
                        serialized[prop] = value;
                    });
                    return serialized;
                }
            }

            utils.error('Unknown type of symbol.');
        },
        
        deserialize: (desc, colorsFormat = null) => {
            if (!symbolDescriptions[desc.symbolName]) utils.error('Unknown type of symbol.');
            let symbol = new symbolDescriptions[desc.symbolName].Constructor();
            symbolDescriptions[desc.symbolName].properties.forEach(prop => {
                let val = desc[prop];
                if (colorsFormat) {
                    let color = new Color(val);
                    if (color.isValid && color.format === colorsFormat) val = color.toString('rgba');
                }

                symbol[prop] = val;
            });
            
            return symbol;
        }
    };
    
});