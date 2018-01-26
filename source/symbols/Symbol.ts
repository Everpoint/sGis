import {deserialize, serialize} from "../serializers/symbolSerializer";
import {Feature} from "../features/Feature";
import {Crs} from "../Crs";
import {Render} from "../renders/Render";

/**
 * Symbol that renders a feature to the screen coordinate system. All symbols take as input a feature, target resolution
 * and target crs, and must return a set of renders (rendered primitives) that then can be used to draw the feature.
 * @alias sGis.Symbol
 */
export abstract class Symbol {
    /**
     * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
     * If the symbol cannot render provided feature, empty array is returned.
     * @param feature - feature to be drawn.
     * @param resolution - resolution of the render.
     * @param crs - target coordinate system of the render.
     */
    abstract renderFunction(feature: Feature, resolution: number, crs: Crs): Render[]

    /**
     * Returns a copy of the symbol. Only essential properties are copied.
     */
    clone(): Symbol {
        let desc = serialize(this);
        return deserialize(desc);
    }
}

export type SymbolConstructor = new () => Symbol;