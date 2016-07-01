sGis.module('render.Arc', [
    'utils'
], function(utils) {
    
    'use strict';

    var defaults = {
        /**
         * The center of the arc in [x, y] format
         * @type Array
         * @instance
         * @memberof sGis.render.Arc
         */
        center: null,

        /**
         * The radius of the arc
         * @type Number
         * @instance
         * @memberof sGis.render.Arc
         * @default 5
         */
        radius: 5,

        /**
         * The stroke color of the arc (outline color). The value can be any valid css color string.
         * @type String
         * @instance
         * @memberof sGis.render.Arc
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * The stroke width of the arc.
         * @type Number
         * @instance
         * @memberof sGis.render.Arc
         * @default 1
         */
        strokeWidth: 1,

        /**
         * The fill color of the arc. The value can be any valid css color string.
         * @type String
         * @instance
         * @memberof sGis.render.Arc
         * @default "transparent"
         */
        fillColor: 'transparent',

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
     * Rendered arc (circle) on a map.
     * @alias sGis.render.Arc
     */
    class Arc {
        /**
         * @constructor
         * @param {Number[]} center - the center of the arc, in the [x, y] format.
         * @param {Object} [options] - key-value options of any Arc parameters
         */
        constructor(center, options) {
            utils.init(this, options);
            this.center = center;
        }

        /**
         * Returns true if 'position' is inside the rendered arc.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            var dx = position.x - this.center[0];
            var dy = position.y - this.center[1];
            var distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < this.radius + 2;
        }

        get isVector() { return true; }
    }
    
    utils.extend(Arc.prototype, defaults);
    
    return Arc;
    
});
