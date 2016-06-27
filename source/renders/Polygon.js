sGis.module('render.Polygon', [
    'utils',
    'geotools'
], function(utils, geotools) {
    
    'use strict';
    
    var defaults = {
        /**
         * Fill style of the polygon. Possible values: "color", "image".
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "color"
         */
        fillStyle: 'color',

        /**
         * Fill color of the polygon. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "transparent"
         */
        fillColor: 'transparent',

        /**
         * Fill image of the polygon
         * @type HTMLImageElement
         * @memberof sGis.render.Polygon
         * @instance
         * @default null
         */
        fillImage: null,

        /**
         * Stroke color of the polygon. Can be any valid css color string.
         * @type String
         * @memberof sGis.render.Polygon
         * @instance
         * @default "black"
         */
        strokeColor: 'black',

        /**
         * Stroke width of the polygon.
         * @type Number
         * @memberof sGis.render.Polygon
         * @instance
         * @default 1
         */
        strokeWidth: 1,

        /**
         * Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events.
         * @type Boolean
         * @instance
         * @memberof sGis.render.Arc
         * @default false
         */
        ignoreEvents: false,

        /**
         * The distance (px) from the drawn line inside which the event is still considered to be inside the line.
         * @type Number
         * @instance
         * @memberof sGis.render.Polygon
         * @default 2
         */
        lineContainsTolerance: 2
    };

    /**
     * @alias sGis.render.Polygon
     */
    class Polygon {
        /**
         * @constructor
         * @param {Number[][][]} coordinates - the coordinates of the polygon: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
         * @param {Object} [options] - key-value list of any properties of sGis.render.Polygon
         */
        constructor(coordinates, options) {
            utils.init(this, options);
            this.coordinates = coordinates;
        }
        
        static get isVector() { return true; }
        
        /**
         * Returns true if 'position' is inside the rendered polygon.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            return geotools.contains(this.coordinates, position, this.width / 2 + this.lineContainsTolerance);
        }
    }
    
    utils.extend(Polygon.prototype, defaults);

    return Polygon;
    
});
