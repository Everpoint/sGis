sGis.module('render.Point', [], () => {

    'use strict';

    /**
     * Point geometry rendered to the screen coordinates for drawing.
     * @alias sGis.render.Point
     * @implements sGis.IRender
     */
    class Point {
        /**
         * @param {Number[]} coordinates - the rendered (px) coordinates of the point in [x, y] format.
         * @param {Object} [properties] - key-value list of any sGis.render.Point properties.
         */
        constructor(coordinates, properties) {
            this._coord = coordinates;
            Object.assign(this, properties);
        }

        get isVector() { return true; }
        
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
    /**
     * The color of the point. Can be any valid css color string.
     * @member {String} sGis.render.Point#color
     * @default "black"
     */
    Point.prototype.color = 'black';

    /**
     * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
     * @member {Boolean} sGis.render.Point#ignoreEvents
     * @default false
     */
    Point.prototype.ignoreEvents = false;

    return Point;

});
