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
            utils.init(this, options);
            this.coordinates = coordinates;
        }

        static get isVector() { return true; }

        contains(position) {
            for (var ring = 0, l = this._coordinates.length; ring < l; ring++) {
                for (var i = 1, m = this._coordinates[ring].length; i < m; i++) {
                    if (geotools.pointToLineDistance(position, [this._coordinates[ring][i-1], this._coordinates[ring][i]]) < this._width / 2 + this.lineContainsTolerance) return [ring, i - 1];
                }
            }
            return false;
        }
    }
    
    utils.extend(Polyline.prototype, defaults);
    
    return Polyline;

});
