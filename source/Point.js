sGis.module('Point', [
    'utils',
    'CRS'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS) {
    'use strict';

    var defaults = {
        /**
         * First coordinate of the point.
         * @type number
         * @memberof sGis.Point
         */
        x: 0,
        /**
         * Second coordinate of the point.
         * @type number
         * @memberof sGis.Point
         */
        y: 0,

        /**
         * Coordinate system of the point
         * @type sGis.Crs
         * @memberof sGis.Point
         * @internal
         */
        _crs: CRS.geo
    };

    /**
     * Simple geographical point
     * @class
     * @alias sGis.Point
     */
    class Point {
        /**
         * @constructor
         * @param {number} x - first coordinate
         * @param {number} y - second coordinate
         * @param {sGis.Crs} [crs=sGis.CRS.geo]
         */
        constructor(x, y, crs) {
            this.x = x;
            this.y = y;
            if (crs !== undefined) this._crs = crs;
        }

        /**
         * Returns a new point with same position in new crs
         * @param {sGis.Crs} newCrs - target coordinate system
         * @returns {sGis.Point}
         * @throws Cannot project to specified crs.
         */
        projectTo(newCrs) {
            var projection = this.crs.projectionTo(newCrs);
            if (projection === null) utils.error("Cannot project point to crs: " + newCrs.stringDescription);

            var [x, y] = projection([this.x, this.y]);
            return new Point(x, y, newCrs);
        }

        /**
         * Returns a copy of the point
         * @returns {sGis.Point}
         */
        clone() {
            return new Point(this.x, this.y, this.crs);
        }

        /**
         * Coordinates of the point in format [x, y]
         */
        get coordinates() {
            return [this.x, this.y];
        }
        set coordinates(coord) {
            this.x = coord[0];
            this.y = coord[1];
        }

        /**
         * Coordinate system of the point
         * @type sGis.Crs
         */
        get crs() {
            return this._crs;
        }
    }

    utils.extend(Point.prototype, defaults);

    return Point;
});