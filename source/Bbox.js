sGis.module('Bbox', [
    'utils',
    'CRS',
    'Point'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS, /** sGis.Point */ Point) {
    'use strict';

    var defaults = {
        _crs: CRS.geo
    };

    /**
     * @class
     * @alias sGis.Bbox
     */
    class Bbox {
        constructor(point1, point2, crs)
        {
            this._crs = crs || point1.crs || point2.crs || this._crs;

            var p1 = point1 instanceof Point ? point1.projectTo(this._crs).coordinates : point1;
            var p2 = point2 instanceof Point ? point2.projectTo(this._crs).coordinates : point2;
            this._p = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
        }

        projectTo(crs) {
            return new Bbox(new Point(this._p[0], this._p[1], this._crs), new Point(this._p[2], this._p[3], this._crs), crs);
        }

        clone() {
            return this.projectTo(this._crs);
        }

        equals(bbox) {
            var target = bbox.coordinates;
            for (var i = 0; i < 4; i++) if (this._p[i] !== target[i]) return false;
            return this._crs === bbox.crs;
        }

        intersects(bbox) {
            var proj = bbox.projectTo(this._crs);
            return this.xMax > proj.xMin && this.xMin < proj.xMax && this.yMax > proj.yMin && this.yMin < proj.yMax;
        }

        get crs() { return this._crs; }

        get xMax() { return this._p[2] }
        set xMax(value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }

        get yMax() { return this._p[3]; }
        set yMax(value) {
            if (value < this.yMin) sGis.utils.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }

        get xMin() { return this._p[0]; }
        set xMin(value) {
            if (value > this.xMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }

        get yMin() { return this._p[1]; }
        set yMin(value) {
            if (value > this.yMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }

        get width() { return this.xMax - this.xMin; }

        get height() { return this.yMax - this.yMin; }

        get coordinates() { return utils.copyArray(this._p); }

        /** @deprecated */
        get p() { return [this.p1, this.p2]; }

        /** @deprecated */
        get p1() { return new Point(this._p[0], this._p[1], this._crs); }
        set p1(point){ this._setPoint(0, point); }

        /** @deprecated */
        get p2() { return new Point(this._p[2], this._p[3]); }
        set p2(point) { this._setPoint(1, point); }

        /** @deprecated */
        _setPoint(index, point) {
            if (point instanceof Point) {
                var projected = point.projectTo(this._crs);
                this._p[index * 2] = projected.x;
                this._p[1 + index * 2] = projected.y;
            } else if (sGis.utils.isArray(point)) {
                this._p[index * 2] = point[0];
                this._p[1 + index * 2] = point[1];
            } else {
                sGis.utils.error('Point is expected but got ' + point + ' instead');
            }
        }
    }

    utils.extend(Bbox.prototype, defaults);

    return Bbox;

});
