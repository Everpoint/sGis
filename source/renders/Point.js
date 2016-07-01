sGis.module('render.Point', [
    'utils'
], function(utils) {
    
    'use strict';

    var defaults = {
        /**
         * The color of the point. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Point
         * @instance
         * @default "black"
         */
        color: 'black',

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @type Boolean
         * @instance
         * @memberof sGis.render.Arc
         * @default false
         */
        ignoreEvents: false
    };

    /**
     * @alias sGis.render.Point
     */
    class Point {
        /**
         * @constructor
         * @param {Number[]} coordinates - the rendered (px) coordinates of the point in [x, y] format.
         * @param {Object} [properties] - key-value list of any sGis.render.Point properties.
         */
        constructor(coordinates, properties) {
            this._coord = coordinates;
            utils.init(this, properties);
        }
        
        get isVector() { return true; }

        /**
         * Returns true if 'position' is inside the rendered arc.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            var dx = position.x - this._coord[0],
                dy = position.y - this._coord[1],
                distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < 2;
        }

        /**
         *  The rendered (px) coordinates of the point in [x, y] format
         *  @type Number[]
         *  @readonly
         */
        get coordinates() { return this._coord; }
    }
    
    utils.extend(Point.prototype, defaults);

    return Point;
    
});
