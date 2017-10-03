import {Map} from "./Map";
import {DomRenderer} from "./painters/DomPainter/DomPainter";
import {warn} from "./utils/utils";

export const init = function({ position, resolution, crs, layers, wrapper, pluginDefinitions = []}) {
    let map = new Map({crs, position, resolution, layers});
    let painter = new DomRenderer(map, {wrapper});

    let p = pluginDefinitions.map(pluginDefinition => {
        let name = pluginDefinition.name;
        if (!plugins[name]) {
            throw new Error(`Plugin ${name} is not available.`);
        }

        return new plugins[name](map, painter.innerWrapper, pluginDefinition.properties);
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