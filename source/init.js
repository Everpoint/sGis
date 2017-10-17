sGis.module('init', [
    'sGis',
    'Map',
    'painter.DomPainter'
], (sGis, Map, Painter) => {

    'use strict';

    function init({ position, resolution, crs, layers, wrapper, plugins = []}) {
        let map = new Map({crs, position, resolution, layers});
        let painter = new Painter(map, {wrapper});


        plugins = plugins.map(pluginDefinition => {
            let name = pluginDefinition.name;
            if (!sGis.plugins || !sGis.plugins[name]) {
                throw new Error(`Plugin ${name} is not available.`);
            }

            return new sGis.plugins[name](map, painter, pluginDefinition.properties);
        });

        return { map, painter, plugins };
    }

    return init;

});