sGis.module('feature.Point', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.point.Point'
], function(utils, Feature, Crs, Point, Bbox, PointSymbol) {

    'use strict';

    var defaults = {
        _symbol: new PointSymbol()
    };

    /**
     * @alias sGis.feature.Point
     * @extends sGis.Feature
     * @implements sGis.IPoint
     */
    class PointF extends Feature {
        constructor(position, properties) {
            super(properties);
            this._position = position;
        }

        projectTo(crs) {
            var projected = Point.prototype.projectTo.call(this, crs);
            return new PointF(projected.position, { crs: crs, symbol: this.symbol });
        }

        clone() {
            return this.projectTo(this.crs);
        }
        
        get position() { return [].concat(this._position); }
        set position(position) {
            this._position = position;
            this.redraw();
        }
        
        get point() { return new sGis.Point(this.position, this.crs); }
        set point(point) { this.position = point.projectTo(this.crs).position; }

        get bbox() { return new Bbox(this._position, this._position, this.crs); }

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
    }

    utils.extend(PointF.prototype, defaults);

    return PointF;

});
