import {Map} from "./Map";
import {DomPainter} from "./painters/DomPainter/DomPainter";
import {warn} from "./utils/utils";

/**
 * Convenience method for simple map initialization
 * @param position
 * @param centerPoint
 * @param resolution
 * @param crs
 * @param layers
 * @param wrapper
 * @param pluginDefinitions
 * @example init_Setting_position_and_resolution
 */
export const init = function({ position = undefined, centerPoint = undefined, resolution = undefined, crs = undefined, layers = undefined, wrapper = undefined, pluginDefinitions = []}: any) {
    let map = new Map({crs, position, centerPoint, resolution, layers});
    let painter = new DomPainter(map, {wrapper});

    let p = pluginDefinitions.map(pluginDefinition => {
        let name = pluginDefinition.name;
        if (!plugins[name]) {
            throw new Error(`Plugin ${name} is not available.`);
        }

        return new plugins[name](map, painter, pluginDefinition.properties);
    });

    return { map, painter, p };
};

export interface IPlugin {
    constructor(map, wrapper, properties);
}

export const plugins = {
    registerPlugin(name, Constructor: IPlugin) {
        if (plugins[name]) {
            warn(`Plugin with name ${name} already registered. Skipping.`);
        } else {
            plugins[name] = Constructor;
        }
    }
};