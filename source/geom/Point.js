(function() {

    sGis.geom.Point = function(coordinates, attributes) {
        this.setCoordinates(coordinates);

        if (attributes && attributes.color) this.color = attributes.color;
        if (attributes && attributes.size) this.size = attributes.size;
    };

    sGis.geom.Point.prototype = {
        _color: 'black',
        _size: 5,
        ignoreEvents: false,

        getCoordinates: function() {
            return [].concat(this._coord);
        },

        setCoordinates: function(coordinates) {
            if (!utils.isArray(coordinates) || coordinates.length !== 2 || !utils.isNumber(coordinates[0]) || !utils.isNumber(coordinates[1])) {
                utils.error('Coordinates in format [x, y] are expected, but got ' + coordinates + ' instead');
            }

            this._coord = coordinates;
        },

        clone: function() {
            var point = new sGis.geom.Point(this.getCoordinates()),
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

    Object.defineProperties(sGis.geom.Point.prototype, {
        size: {
            get: function() {
                return this._size;
            },

            set: function(size) {
                if (!utils.isNumber(size) || size <= 0) utils.error('Expected positive number but got ' + size + ' instead');
                this._size = size;
            }
        },

        color: {
            get: function() {
                return this._color;
            },

            set: function(color) {
                if (!utils.isString(color)) utils.error('Expected a string but got ' + color + 'instead');
                this._color = color;
            }
        }
    });

})();