sGis.module('render.Point', [
    'utils'
], function(utils) {
    'use strict';

    var Point = function(coordinates, attributes) {
        this.setCoordinates(coordinates);

        if (attributes && attributes.color) this.color = attributes.color;
        if (attributes && attributes.size) this.size = attributes.size;
    };

    Point.prototype = {
        _color: 'black',
        ignoreEvents: false,
        isVector: true,

        getCoordinates: function() {
            return [].concat(this._coord);
        },

        setCoordinates: function(coordinates) {
            if (!sGis.utils.isArray(coordinates) || coordinates.length !== 2 || !sGis.utils.isNumber(coordinates[0]) || !sGis.utils.isNumber(coordinates[1])) {
                sGis.utils.error('Coordinates in format [x, y] are expected, but got ' + coordinates + ' instead');
            }

            this._coord = coordinates;
        },

        clone: function() {
            var point = new Point(this.getCoordinates()),
                keys = Object.keys(this);
            for (var i in keys) {
                point[keys[i]] = this[keys[i]];
            }
            return point;
        },

        contains: function(position) {
            var dx = position.x - this._coord[0],
                dy = position.y - this._coord[1],
                distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < this._size / 2 + 2;
        }
    };

    Object.defineProperties(Point.prototype, {
        coordinates: {
            get: function() {
                return this._coordinates;
            }
        },
        
        color: {
            get: function() {
                return this._color;
            },

            set: function(color) {
                if (!sGis.utils.isString(color)) sGis.utils.error('Expected a string but got ' + color + 'instead');
                this._color = color;
            }
        }
    });

    return Point;
    
});