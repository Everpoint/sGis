sGis.module('render.Polyline', [
    'utils',
    'geotools'
], function(utils, geotools) {

    'use strict';

    var defaults = {
        color: 'black',
        width: 1,
        ignoreEvents: false,
        lineContainsTolerance: 2
    };

    class Polyline {
        constructor(coordinates, options) {
            if (!coordinates) coordinates = [];
            if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
            if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];
            
            utils.init(this, options);
            this.coordinates = coordinates;
        }

        static get isVector() { return true; }

        contains(position) {
            for (var ring = 0, l = this.coordinates.length; ring < l; ring++) {
                for (var i = 1, m = this.coordinates[ring].length; i < m; i++) {
                    if (geotools.pointToLineDistance(position, [this.coordinates[ring][i-1], this.coordinates[ring][i]]) < this.width / 2 + this.lineContainsTolerance) return [ring, i - 1];
                }
            }
            return false;
        }
    }
    
    utils.extend(Polyline.prototype, defaults);
    
    return Polyline;

});
