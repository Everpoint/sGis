sGis.module('render.Polyline', [
    'utils',
    'geotools'
], function(utils, geotools) {

    'use strict';

    var defaults = {
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

    class Polyline {
        /**
         * @constructor
         * @param {Number[][][]} coordinates - the coordinates of the polyline: [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...]].
         * @param {Object} [options] - key-value list of any properties of sGis.render.Polyline
         */
        constructor(coordinates, options) {
            if (!coordinates) coordinates = [];
            if (!utils.isArray(coordinates[0])) coordinates = [coordinates];
            if (!utils.isArray(coordinates[0][0])) coordinates = [coordinates];
            
            utils.init(this, options);
            this.coordinates = coordinates;
        }

        get isVector() { return true; }

        /**
         * Returns true if 'position' is inside the rendered polygon.
         * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
         * @returns {boolean}
         */
        contains(position) {
            for (var ring = 0, l = this.coordinates.length; ring < l; ring++) {
                for (var i = 1, m = this.coordinates[ring].length; i < m; i++) {
                    if (geotools.pointToLineDistance(position, [this.coordinates[ring][i-1], this.coordinates[ring][i]]) < this.strokeWidth / 2 + this.lineContainsTolerance) return [ring, i - 1];
                }
            }
            return false;
        }
    }
    
    utils.extend(Polyline.prototype, defaults);
    
    return Polyline;

});
