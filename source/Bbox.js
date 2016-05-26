sGis.module('Bbox', [
    'utils',
    'CRS',
    'Point'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS, /**sGis.Point*/ Point) {
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
            this.p = [];
            this.p1 = point1;
            this.p2 = point2;
        }

        projectTo(crs) {
            return new Bbox(this.p[0].projectTo(crs), this.p[1].projectTo(crs));
        }

        clone() {
            return this.projectTo(this.crs);
        }

        equals(bbox) {
            return this.p[0].x === bbox.p[0].x &&
            this.p[0].y === bbox.p[0].y &&
            this.p[1].x === bbox.p[1].x &&
            this.p[1].y === bbox.p[1].y &&
            this.crs === bbox.crs;
        }

        intersects(bbox) {
            var proj = bbox.projectTo(this.p[0].crs);
            return this.xMax > proj.xMin && this.xMin < proj.xMax && this.yMax > proj.yMin && this.yMin < proj.yMax;
        }

        get crs() {
            return this._crs;
        }

        get xMax() {
            return Math.max(this.p1.x, this.p2.x);
        }
        set xMax(value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');

            if (this.p1.x > this.p2.x) {
                this.p1.x = value;
            } else {
                this.p2.x = value;
            }
        }

        get yMax() {
            return Math.max(this.p1.y, this.p2.y);
        }
        set yMax(value) {
            if (value < this.yMin) sGis.utils.error('Max value cannot be lower than the min value');

            if (this.p1.y > this.p2.y) {
                this.p1.y = value;
            } else {
                this.p2.y = value;
            }
        }

        get xMin() {
            return Math.min(this.p1.x, this.p2.x);
        }
        set xMin(value) {
            if (value > this.xMax) sGis.utils.error('Min value cannot be higher than the max value');
            if (this.p1.x > this.p2.x) {
                this.p2.x = value;
            } else {
                this.p1.x = value;
            }
        }

        get yMin() {
            return Math.min(this.p1.y, this.p2.y);
        }
        set yMin(value) {
            if (value > this.yMax) sGis.utils.error('Min value cannot be higher than the max value');
            if (this.p1.y > this.p2.y) {
                this.p2.y = value;
            } else {
                this.p1.y = value;
            }
        }

        get width() {
            return this.xMax - this.xMin;
        }

        get height() {
            return this.yMax - this.yMin;
        }

        get p1() {
            return this.p[0];
        }
        set p1(point){
            this._setPoint(0, point);
        }

        get p2() {
            return this.p[1];
        }
        set p2(point) {
            this._setPoint(1, point);
        }

        _setPoint(index, point) {
            if (point instanceof Point) {
                this.p[index] = point.projectTo(this._crs);
            } else if (sGis.utils.isArray(point)) {
                this.p[index] = new Point(point[0], point[1], this.crs);
            } else {
                sGis.utils.error('Point is expected but got ' + point + ' instead');
            }
        }
    }

    utils.extend(Bbox.prototype, defaults);

    return Bbox;

});
