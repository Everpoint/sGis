sGis.module('init', [
    'sGis',
    'Map',
    'painter.DomPainter'
], (sGis, Map, Painter) => {

    'use strict';

    function init({ position, resolution, crs, layers, wrapper}) {
        let map = new Map({crs, position, resolution, layers});
        let painter = new Painter(map, {wrapper});

        return { map, painter };
    }

    return init;

});