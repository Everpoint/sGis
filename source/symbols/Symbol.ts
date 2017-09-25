import {deserialize, serialize} from "../serializers/symbolSerializer";
import {Feature} from "../features/Feature";
import {Crs} from "../Crs";
import {IRender} from "../interfaces/IRender";

/**
 * Empty symbol, base class for all other symbol classes. If this symbol is assigned to a feature, the feature will not be rendered.
 * @alias sGis.Symbol
 */
export abstract class Symbol {
    /**
     * @constructor
     * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        if (properties) Object.assign(this, properties);
    }

    /**
     * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
     * If the symbol cannot render provided feature, empty array is returned.
     * @param {sGis.Feature} feature - feature to be drawn.
     * @param {Number} resolution - resolution of the render.
     * @param {sGis.Crs} crs - target coordinate system of the render.
     * @returns {sGis.IRender[]}
     */
    abstract renderFunction(feature: Feature, resolution: number, crs: Crs): IRender[]

    /**
     * Returns a copy of the symbol. Only essential properties are copied.
     * @returns {sGis.Symbol}
     */
    clone(): Symbol {
        let desc = serialize(this);
        return deserialize(desc);
    }
}
