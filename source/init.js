sGis.module('init', [
    'sGis',
    'Map',
    'painter.DomPainter'
], (sGis, Map, Painter) => {

    'use strict';

    /**
     * @alias sGis.init
     * @param {Object} properties
     * @returns {sGis.Map}
     */
    function init(properties) {
        var map = new Map();
        if (properties.crs) map.crs = properties.crs;

        var painter = new Painter(map);
        if (properties.wrapper) painter.wrapper = properties.wrapper;

        sGis.painter = painter;
        sGis.map = map;

        return map;
    }

    return init;

});