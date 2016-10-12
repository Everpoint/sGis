sGis.module('feature.Point', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.point.Point'
], function(utils, Feature, Crs, Point, Bbox, PointSymbol) {

    'use strict';

    /**
     * Simple geographical point.
     * @alias sGis.feature.Point
     * @extends sGis.Feature
     * @implements sGis.IPoint
     */
    class PointF extends Feature {
        /**
         * @param {Position} position - coordinates of the point
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(position, properties) {
            super(properties);
            this._position = position;
        }

        projectTo(crs) {
            var projected = Point.prototype.projectTo.call(this, crs);
            return new PointF(projected.position, { crs: crs, symbol: this.symbol });
        }

        /**
         * Returns a copy of the point. The copy will include all sGis.Point properties, but will not copy of user defined properties or event listeners.
         */
        clone() {
            return this.projectTo(this.crs);
        }

        get bbox() { return new Bbox(this._position, this._position, this.crs); }

        get position() { return [].concat(this._position); }
        set position(position) {
            this._position = position;
            this.redraw();
        }
        
        get point() { return new sGis.Point(this.position, this.crs); }
        set point(point) { this.position = point.projectTo(this.crs).position; }

        get x() { return this._position[0]; }
        set x(x) {
            this._position[0] = x;
            this.redraw();
        }

        get y() { return this._position[1]; }
        set y(y) {
            this._position[1] = y;
            this.redraw();
        }

        get coordinates() { return this.position.slice(); }
        set coordinates(position) { this.position = position.slice(); }
    }

    /**
    * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
    * @member symbol
    * @memberof sGis.feature.Point
    * @type {sGis.Symbol}
    * @instance
    * @default new sGis.symbol.point.Point()
    */

    PointF.prototype._symbol = new PointSymbol(); 

    return PointF;

});
