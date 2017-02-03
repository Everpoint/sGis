sGis.module('Bbox', [
    'utils',
    'CRS',
    'Point'
], function(utils, CRS, Point) {
    'use strict';

    let defaults = {
        _crs: CRS.geo
    };

    /**
     * Object representing a rectangular area on a map between two point.
     * @alias sGis.Bbox
     */
    class Bbox {
        /**
         * @constructor
         * @param {Position} point1 - first corner point of rectangle
         * @param {Position} point2 - second corner point of rectangle
         * @param {sGis.Crs} [crs=sGis.CRS.geo] - coordinate system of the point coordinates
         */
        constructor(point1, point2, crs)
        {
            if (crs) this._crs = crs;
            this._p = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1]), Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])];
        }

        /**
         * Returns a new Bbox in the specified coordinate system.
         * @param {sGis.Crs} crs - target coordinate system
         * @throws If the instance coordinates cannot be projected into the target crs.
         * @returns {sGis.Bbox}
         */
        projectTo(crs) {
            let projected1 = new Point(this._p.slice(0,2), this._crs).projectTo(crs).position;
            let projected2 = new Point(this._p.slice(2,4), this._crs).projectTo(crs).position;
            return new Bbox(projected1, projected2, crs);
        }

        /**
         * Center point of the bounding box
         * @type sGis.Point
         * @readonly
         */
        get center() { return new Point([(this.xMax + this.xMin)/2, (this.yMax + this.yMin)/2], this.crs); }

        /**
         * Returns a copy of the bbox
         * @returns {sGis.Bbox}
         */
        clone() {
            return this.projectTo(this._crs);
        }

        /**
         * Returns true if the given bbox is equal (geographically) to the target bbox. It will return false if the target
         * bbox is set in different coordinate system or if any of the 4 coordinates are different by more then 0.0001%.
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}
         */
        equals(bbox) {
            let target = bbox.coordinates;
            for (let i = 0; i < 4; i++) if (!utils.softEquals(this._p[i], target[i])) return false;
            return this._crs.equals(bbox.crs);
        }

        intersect(bbox) {
            bbox = bbox.crs === this.crs ? bbox : bbox.projectTo(this.crs);
            return new Bbox([Math.min(this.xMin, bbox.xMin), Math.min(this.yMin, bbox.yMin)], [Math.max(this.xMax, bbox.xMax), Math.max(this.yMax, bbox.yMax)], this.crs);
        }

        /**
         * Returns true if at list one point of the given bbox lies inside the target bbox. NOTE that this method will return true
         * if on of the bboxes is completely inside the other. It will return false if bboxes are adjustened, e.g. a side of one bbox
         * touches a side of another one.
         * @param {sGis.Bbox} bbox - target bbox
         * @returns {boolean}>
         */
        intersects(bbox) {
            let projected = bbox.projectTo(this._crs);
            return this.xMax > projected.xMin && this.xMin < projected.xMax && this.yMax > projected.yMin && this.yMin < projected.yMax;
        }

        /**
         * Returns true, if the target point is inside the bbox.
         * @param {sGis.Point} point
         * @returns {boolean}
         */
        contains(point) {
            let projected = point.projectTo(this.crs);
            return this.xMin <= projected.x && this.xMax >= projected.x && this.yMin <= projected.y && this.yMax >= projected.y;
        }

        /**
         * Coordinate system of the bbox.
         * @type sGis.Crs
         * @readonly
         */
        get crs() { return this._crs; }

        /**
         * Coordinate of the right border of the bbox. Cannot be assigned value less then xMin.
         * @type Number
         */
        get xMax() { return this._p[2] }
        set xMax(/** Number */ value) {
            if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
            this._p[2] = value;
        }

        /**
         * Coordinate of the top border of the bbox. Cannot be assigned value less then yMin.
         * @type Number
         */
        get yMax() { return this._p[3]; }
        set yMax(/** Number */ value) {
            if (value < this.yMin) utils.error('Max value cannot be lower than the min value');
            this._p[3] = value;
        }

        /**
         * Coordinate of the left border of the bbox. Cannot be assigned value larger then xMax.
         * @type Number
         */
        get xMin() { return this._p[0]; }
        set xMin(/** Number */ value) {
            if (value > this.xMax) utils.error('Min value cannot be higher than the max value');
            this._p[0] = value;
        }

        /**
         * Coordinate of the bottom border of the bbox. Cannot be assigned value larger then yMax.
         * @type Number
         */
        get yMin() { return this._p[1]; }
        set yMin(/** Number */ value) {
            if (value > this.yMax) utils.error('Min value cannot be higher than the max value');
            this._p[1] = value;
        }

        /**
         * Width of the bbox.
         * @type Number
         * @readonly
         */
        get width() { return this.xMax - this.xMin; }

        /**
         * Height of the bbox.
         * @type number
         * @readonly
         */
        get height() { return this.yMax - this.yMin; }

        /**
         * Coordinates of the bbox in the form [xMin, yMin, xMax, yMax].
         * @type number[]
         * @readonly
         */
        get coordinates() { return utils.copyArray(this._p); }
    }

    utils.extend(Bbox.prototype, defaults);

    return Bbox;

});
