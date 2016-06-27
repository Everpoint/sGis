sGis.module('render.Polygon', [
    'utils',
    'geotools'
], function(utils, geotools) {
    
    'use strict';
    
    var defaults = {
        fillStyle: 'color',
        fillColor: 'transparent',
        fillImage: null,
        color: 'black',
        width: 1,
        ignoreEvents: false,
        lineContainsTolerance: 2
    };
    
    class Polygon {
        constructor(coordinates, options) {
            utils.init(this, options);
            this.coordinates = coordinates;
        }
        
        static get isVector() { return true; }
        
        contains(position) {
            return geotools.contains(this.coordinates, position, this.width / 2 + this.lineContainsTolerance);
        }
    }
    
    utils.extend(Polygon.prototype, defaults);

    return Polygon;
    
});
