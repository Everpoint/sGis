import {Color} from "../utils/Color";
import {error} from "../utils/utils";

let symbolDescriptions = {};

export const registerSymbol = (constructor, description, properties) => {
    symbolDescriptions[description] = {Constructor: constructor, properties: properties};
};

export const serialize = (symbol, colorsFormat = null): any => {
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

    error('Unknown type of symbol.');
};

export const deserialize = (desc, colorsFormat = null) => {
    if (!symbolDescriptions[desc.symbolName]) error('Unknown type of symbol.');
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
};
