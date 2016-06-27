sGis.module('render.Point', [
    'utils'
], function(utils) {
    
    'use strict';

    var defaults = {
        color: 'black',
        ignoreEvents: false
    };
    
    class Point {
        constructor(coordinates, properties) {
            this._coord = coordinates;
            utils.init(this, properties);
        }
        
        static get isVector() { return true; }

        contains(position) {
            var dx = position.x - this._coord[0],
                dy = position.y - this._coord[1],
                distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < this._size / 2 + 2;
        }

        get coordinates() { return this._coord; }
    }
    
    utils.extend(Point.prototype, defaults);

    return Point;
    
});
