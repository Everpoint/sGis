import {Color} from "../utils/Color";
import {copyObject, error} from "../utils/utils";
import {Symbol, SymbolConstructor} from "../symbols/Symbol";
import {Feature} from "../features/Feature";

type SymbolDescription = {
    Constructor: SymbolConstructor,
    properties: string[]
}

export type SerializedSymbol = {
    symbolName: string,
    [key: string]: Serializable
}

export type Serializable = null | string | number | Array<number> | Array<string>;

let symbolDescriptions: {[key: string]: SymbolDescription} = {};

/**
 * Registers symbol class for serialization. After registration, the symbol can be serialized and deserialized with this
 * serialier.
 * @param constructor - constructor (class) of the symbol.
 * @param name - unique name of the symbol type. It is used to find correct constructor on deserialization.
 * @param properties - list of property names that should be serialized.
 */
export const registerSymbol = (constructor: SymbolConstructor, name: string, properties: string[]) => {
    symbolDescriptions[name] = {Constructor: constructor, properties: properties};
};

/**
 * Serializes symbol to a key-value JSON object.
 * @param symbol - symbol to be serialized.
 * @param colorsFormat - color format to be used during serialization. If not set, the value from the symbol property
 *                       will be used without change.
 */
export const serialize = (symbol: Symbol<Feature>, colorsFormat: string = null): SerializedSymbol => {
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
                if (value instanceof Object) {
                    value = copyObject(value);
                }
                serialized[prop] = value;
            });
            return serialized;
        }
    }

    error(new Error('Unknown type of symbol.'));
};

/**
 * Deserializes symbol.
 * @param desc - serialized symbol as JSON object.
 * @param colorsFormat - format of the color properties to be used after deserialization. If not set, the values will be
 *                       set without change.
 */
export const deserialize = (desc: SerializedSymbol, colorsFormat: string = null) => {
    if (!symbolDescriptions[desc.symbolName]) error(new Error('Unknown type of symbol.'));
    let symbol = new symbolDescriptions[desc.symbolName].Constructor();
    symbolDescriptions[desc.symbolName].properties.forEach(prop => {
        let val = desc[prop];
        if (colorsFormat) {
            let color = new Color(val.toString());
            if (color.isValid && color.format === colorsFormat) val = color.toString('rgba');
        }
        if (val instanceof Object) {
            val = copyObject(val);
        }

        symbol[prop] = val;
    });

    return symbol;
};
