sGis.module('Point', [
    'utils',
    'CRS'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS) {
    'use strict';

    var defaults = {
        position: [0,0],
        
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
     * @implements sGis.IPoint
     */
    class Point {
        /**
         * @constructor
         * @param position
         * @param {sGis.Crs} [crs=sGis.CRS.geo]
         */
        constructor(position, crs) {
            if (crs !== undefined) this._crs = crs;
            this.position = position;
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

            return new Point(projection(this.position), newCrs);
        }
        
        get position() { return [].concat(this._position); }
        set position(position) { this._position = position; }

        /**
         * Returns a copy of the point
         * @returns {sGis.Point}
         */
        clone() {
            return new Point(this.position, this.crs);
        }
        
        get point() { return this.clone(); }
        set point(point) { this.position = point.projectTo(this.crs).position; }
        
        get x() { return this._position[0]; }
        set x(x) { this._position[0] = x; }
        
        get y() { return this._position[1]; }
        set y(y) { this._position[1] = y; }

        /**
         * Coordinate system of the point
         * @type sGis.Crs
         */
        get crs() { return this._crs; }

        /**
         * Returns true if the target point has the same position and crs as the current one
         * @param {sGis.Point} point - target point for comparison
         * @returns {boolean}
         */
        equals(point) {
            return utils.softEquals(point.x, this.x) && utils.softEquals(point.y, this.y) && point.crs.equals(this.crs);
        }

        get coordinates() { return this.position.slice(); }
        set coordinates(position) { this.position = position.slice(); }
    }

    utils.extend(Point.prototype, defaults);

    /**
     * @typedef {function(Number, Number, {sGis.Crs})} sGis.Point.constructor
     * @returns sGis.Point
     */
    
    return Point;
});