sGis.module('render.Arc', [
    'utils'
], function(utils) {
    
    'use strict';

    var defaults = {
        /**
         * The center of the arc in [x, y] format
         * @member {Position} sGis.render.Arc#center
         */
        center: null,

        /**
         * The radius of the arc
         * @member {Number} sGis.render.Arc#radius
         * @default 5
         */
        radius: 5,

        /**
         * The stroke color of the arc (outline color). The value can be any valid css color string.
         * @member {String} sGis.render.Arc#strokeColor
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * The stroke width of the arc.
         * @member {Number} sGis.render.Arc#strokeWidth
         * @default 1
         */
        strokeWidth: 1,

        /**
         * The fill color of the arc. The value can be any valid css color string.
         * @member {String} sGis.render.Arc#fillColor
         * @default "transparent"
         */
        fillColor: 'transparent',

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @member {Boolean} sGis.render.Arc#ignoreEvents
         * @default false
         */
        ignoreEvents: false,

        /**
         * Start angle of the sector.
         * @member {Number} sGis.render.Arc#startAngle
         * @default 0
         */
        startAngle: 0,

        /**
         * End angle of the sector.
         * @member {Number} sGis.render.Arc#endAngle
         * @default 2 * Math.PI
         */
        endAngle: 2 * Math.PI,

        /**
         * Shows whether the arc is a sector of a circle rather then simple arc. Set to false if you need to draw a circle, for sector has all its boundaries outlined.
         * @member {Boolean} sGis.render.Arc#isSector
         * @default false
         */
        isSector: false,

        /**
         * Direction of the arc.
         * @member {Boolean} sGis.render.Arc#clockwise
         * @default true
         */
        clockwise: true
    };

    /**
     * Rendered arc (circle) on a map.
     * @alias sGis.render.Arc
     */
    class Arc {
        /**
         * @param {Position} center - the center of the arc, in the [x, y] format.
         * @param {Object} [options] - key-value options of any Arc parameters
         */
        constructor(center, options) {
            utils.init(this, options);
            this.center = center;
        }

        /**
         * Returns true if 'position' is inside the rendered arc.
         * @param {Position} position - position in the rendered (px) coordinates in [x,y] format.
         * @returns {boolean}
         */
        contains(position) {
            var dx = position[0] - this.center[0];
            var dy = position[1] - this.center[1];
            var distance2 = dx * dx + dy * dy;

            return distance2 < (this.radius + 2)*(this.radius + 2);
        }

        get isVector() { return true; }
    }

    utils.extend(Arc.prototype, defaults);
    
    return Arc;
    
});