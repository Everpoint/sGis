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
     * Simple rectangular area on a map
     * @class
     * @alias sGis.Bbox
     */
    class Bbox {
        /**
         * @constructor
         * @param {sGis.Point|number[]} point1
         * @param {sGis.Point|number[]} point2
         * @param {sGis.Crs} [crs=sGis.CRS.geo]
         */
        constructor(point1, point2, crs)
        {
            this._crs = crs || point1.crs || point2.crs || this._crs;

            var p1 = point1 instanceof Point ? point1.projectTo(this._crs).coordinates : point1;
            var p2 = point2 instanceof Point ? point2.projectTo(this._crs).coordinates : point2;
            this._p = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
        }

        /**
         * Returns a new Bbox in the specified coordinate system
         * @param {sGis.Crs} crs - target coordinate system
         * @returns {sGis.Bbox}
         */
        projectTo(crs) {
            return new Bbox(new Point(this._p[0], this._p[1], this._crs), new Point(this._p[2], this._p[3], this._crs), crs);
        }

        /**
         * Returns a copy of the bbox
         * @returns {sGis.Bbox}
         */
        clone() {
            return this.projectTo(this._crs);
        }

        /**
         * Returns true if the given bbox is equal (geographically) to the target bbox
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        equals(bbox) {
            var target = bbox.coordinates;
            for (var i = 0; i < 4; i++) if (this._p[i] !== target[i]) return false;
            return this._crs === bbox.crs;
        }

        /**
         * Returns true if at list one point of the given bbox lies inside the target bbox
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        intersects(bbox) {
            var proj = bbox.projectTo(this._crs);
            return this.xMax > proj.xMin && this.xMin < proj.xMax && this.yMax > proj.yMin && this.yMin < proj.yMax;
        }

        /**
         * Returns true, if the target point is inside the bbox
         * @param {sGis.Point} point
         * @returns {boolean}
         */
        contains(point) {
            var proj = point.projectTo(this.crs);
            return this.xMin <= proj.x && this.xMax >= proj.x && this.yMin <= proj.y && this.yMax >= proj.y;
        }

        /**
         * Coordinate system of the bbox
         * @type sGis.Crs
         */
        get crs() { return this._crs; }

        /**
         * Right border of the bbox
         */
        get xMax() { return this._p[2] }
        set xMax(value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }

        /**
         * Top border of the bbox
         */
        get yMax() { return this._p[3]; }
        set yMax(value) {
            if (value < this.yMin) sGis.utils.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }

        /**
         * Left border of the bbox
         */
        get xMin() { return this._p[0]; }
        set xMin(value) {
            if (value > this.xMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }

        /**
         * Bottom border of the bbox
         */
        get yMin() { return this._p[1]; }
        set yMin(value) {
            if (value > this.yMax) sGis.utils.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }

        /**
         * Width of the bbox
         * @type number
         */
        get width() { return this.xMax - this.xMin; }

        /**
         * Height of the bbox
         * @type number
         */
        get height() { return this.yMax - this.yMin; }

        /**
         * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax]
         * @type number[]
         */
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
