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
                console.warn(`Plugin ${name} is not available. Skipping.`);
                return null;
            }

            return new sGis.plugins[name](map, painter.innerWrapper, pluginDefinition.properties);
        });

        return { map, painter, plugins };
    }

    return init;

});