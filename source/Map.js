sGis.module('Map', [
    'utils',
    'CRS',
    'Point',
    'Bbox',
    'LayerGroup',
    'TileScheme'
], function(utils, CRS, Point, Bbox, LayerGroup, TileScheme) {
    'use strict';

    /**
     * Map object with set of layers, specified position, resolution, coordinate system.
     * @alias sGis.Map
     * @extends sGis.LayerGroup
     */
    class Map extends LayerGroup {
        /**
         * @constructor
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(properties = {}) {
            super();
            if (properties.crs) this.crs = properties.crs;
            this.position = properties.position || [this.position[0], this.position[1]];
            utils.extend(this, properties, true);

            this._listenForBboxChange();
        }

        _listenForBboxChange () {
            this.on('bboxChange', () => {
                if (this._changeTimer) clearTimeout(this._changeTimer);
                this._changeTimer = setTimeout(() => {
                    this._changeTimer = null;
                    this.fire('bboxChangeEnd');
                }, this.changeEndDelay);
            });
        }

        /**
         * Moves the map position by the specified offset
         * @param {Number} dx - Offset along X axis in map coordinates, positive direction is right
         * @param {Number} dy - Offset along Y axis in map coordinates, positive direction is down
         */
        move (dx, dy) {
            this._position[0] += dx;
            this._position[1] += dy;
            this.fire('bboxChange');
        }

        /**
         * Changes the scale of map by scalingK
         * @param {Number} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        changeScale (scalingK, basePoint, doNotAdjust) {
            let resolution = this.resolution;
            this.setResolution(resolution * scalingK, basePoint, doNotAdjust);
        }

        /**
         * Changes the scale of map by scalingK with animation
         * @param {float} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} [basePoint] - Base point of zooming
         */
        animateChangeScale (scalingK, basePoint) {
            this.animateSetResolution(this.resolution * scalingK, basePoint);
        }

        /**
         * Changes resolution of the map by k zoom levels. Positive values represent zoom in.
         * @param {Number} k - number of levels to zoom
         * @param {sGis.Point} [basePoint] - zooming base point
         */
        zoom (k, basePoint) {
            let tileScheme = this.tileScheme;
            let currResolution = this._animationTarget ? this._animationTarget[1] : this.resolution;

            let resolution;
            if (tileScheme) {
                let level = tileScheme.getLevel(currResolution) + (k > 0 ? -1 : 1);
                resolution = tileScheme.levels[level] ? tileScheme.levels[level].resolution : currResolution;
            } else {
                resolution = currResolution * Math.pow(2, -k);
            }

            resolution = Math.min(Math.max(resolution, this.minResolution || 0), this.maxResolution || Number.MAX_VALUE);
            this.animateSetResolution(resolution, basePoint);
        }

        /**
         * Changes resolution of the map so that the new resolution corresponds to an even tile scheme level. Resolution is changed with animation.
         */
        adjustResolution () {
            let resolution = this.resolution;
            let newResolution = this.getAdjustedResolution(resolution);
            let ratio = newResolution / resolution;
            if (ratio > 1.1 || ratio < 0.9) {
                this.animateSetResolution(newResolution);
            } else if (ratio > 1.0001 || ratio < 0.9999) {
                this.setResolution(newResolution);
            }
        }

        /**
         * Returns closest resolution to the given one that corresponds to an even tile scheme level.
         * @param {Number} resolution - target resolution
         * @returns {Number}
         */
        getAdjustedResolution (resolution) {
            if (!this.tileScheme) return resolution;
            return this.tileScheme.getAdjustedResolution(resolution);
        }

        /**
         * Sets new resolution to the map with animation
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @returns {undefined}
         */
        animateSetResolution (resolution, basePoint) {
            let adjustedResolution = this.getAdjustedResolution(resolution);
            let newPosition = this._getScaledPosition(adjustedResolution, basePoint);
            this.animateTo(newPosition, adjustedResolution);
            this.fire('animationStart');
        }

        /**
         * Changes position and resolution of the map with animation
         * @param {sGis.IPoint} point - target center point of the map
         * @param {Number} resolution - target resolution;
         */
        animateTo (point, resolution) {
            this.stopAnimation();

            let originalPosition = this.centerPoint;
            let originalResolution = this.resolution;
            let dx = point.x - originalPosition.x;
            let dy = point.y - originalPosition.y;
            let dr = resolution - originalResolution;
            let startTime = Date.now();
            this._animationStopped = false;
            this._animationTarget = [point, resolution];

            let self = this;
            this.animationTimer = setInterval(function() {
                let time = Date.now() - startTime;
                if (time >= self.animationTime || self._animationStopped) {
                    self.setPosition(point, resolution);
                    self.stopAnimation();
                    self.fire('animationEnd');
                } else {
                    let x = self._easeFunction(time, originalPosition.x, dx, self.animationTime);
                    let y = self._easeFunction(time, originalPosition.y, dy, self.animationTime);
                    let r = self._easeFunction(time, originalResolution, dr, self.animationTime);
                    self.setPosition(new Point([x, y], self.crs), r);
                }
            }, 1000 / 60);
        }

        _getScaledPosition (newResolution, basePoint) {
            let position = this.centerPoint;
            basePoint = basePoint ? basePoint.projectTo(this.crs) : position;
            let resolution = this.resolution;
            let scalingK = newResolution / resolution;
            return new Point([(position.x - basePoint.x) * scalingK + basePoint.x, (position.y - basePoint.y) * scalingK + basePoint.y], position.crs);
        }

        /**
         * Stops all animations of the map
         */
        stopAnimation () {
            this._animationStopped = true;
            this._animationTarget = null;
            clearInterval(this.animationTimer);
        }

        _easeFunction (t, b, c, d) {
            return b + c * t / d;
        }

        /**
         * Sets new position and resolution to the map
         * @param {sGis.Point} point - new center point of the map
         * @param {Number} resolution - new resolution of the map
         */
        setPosition (point, resolution) {
            this.prohibitEvent('bboxChange');
            this.centerPoint = point;
            if (resolution) this.resolution = resolution;
            this.allowEvent('bboxChange');
            this.fire('bboxChange');
        }

        /**
         * Sets new resolution to the map
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        setResolution (resolution, basePoint, doNotAdjust) {
            this.setPosition(this._getScaledPosition(this.resolution, basePoint), doNotAdjust ? resolution : this.getAdjustedResolution(resolution));
        }

        /**
         * Geographical position of the center of the map given in map coordinate system
         * @type {Position}
         */
        get position() { return this._position; }
        set position(/** Position */ position) {
            this._position = position;
            this.fire('bboxChange');
        }

        /**
         * Center point of the map
         * @type {sGis.Point}
         */
        get centerPoint() { return new Point(this.position, this.crs); }
        set centerPoint(/** sGis.Point */ point) {
            this.position = point.projectTo(this.crs).position;
        }

        /**
         * Coordinate system of the map. If the value is set and old crs cannot be projected to the new one, position of the map is set to [0, 0].
         * Otherwise position is projected to the new crs.
         * @type {sGis.Crs}
         */
        get crs() { return this._crs; }
        set crs(/** sGis.Crs */ crs) {
            let projection = this._crs.projectionTo(crs);
            this._crs = crs;
            if (projection) {
                this.position = projection(this.position);
            } else {
                this.position = [0, 0];
            }
        }

        /**
         * Resolution of the map. Can be any positive number.
         * @type {Number}
         */
        get resolution() { return this._resolution; }
        set resolution(/** Number */ resolution) {
            this._resolution = resolution;
            this.fire('bboxChange');
        }

        /**
         * Minimum allowed resolution of the map. If not set, the minimum value from the map tile scheme will be used. Must be smaller then max resolution.
         * If current resolution is smaller that the newly assigned minResolution, the current resolution will be adjusted accordingly.
         * @type {Number}
         */
        get minResolution() { return this._minResolution || this.tileScheme && this.tileScheme.minResolution; }
        set minResolution(/** Number */ resolution) {
            if (resolution !== null) {
                let maxResolution = this.maxResolution;
                if (resolution < maxResolution) utils.error('maxResolution cannot be less then minResolution');
            }
            this._minResolution = resolution;
            if (this.resolution > this.minResolution) this.resolution = resolution;
        }

        /**
         * Maximum allowed resolution of the map. If not set, the maximum value from the map tile scheme will be used. Must be larger then min resolution.
         * If current resolution is larger that the newly assigned maxResolution, the current resolution will be adjusted accordingly.
         * @type {Number}
         */
        get maxResolution() { return this._maxResolution || this.tileScheme && this.tileScheme.maxResolution; }
        set maxResolution(/** Number */ resolution) {
            if (resolution !== null) {
                let minResolution = this.minResolution;
                if (resolution < minResolution) utils.error('maxResolution cannot be less then minResolution');
            }
            this._maxResolution = resolution;
            if (this.resolution > this.maxResolution) this.resolution = resolution;
        }
    }

    Object.assign(Map.prototype, {
        _crs: CRS.webMercator,
        _position: new Point([55.755831, 37.617673]).projectTo(CRS.webMercator).position,
        _resolution: 611.4962262812505 / 2,

        /**
         * Tile scheme of the map
         * @member {sGis.TileScheme} sGis.Map.tileScheme
         * @default TileScheme.default
         */
        tileScheme: TileScheme.default,

        /**
         * Length of the map animations in milliseconds. Set higher values for slower animations.
         * @member {Number} sGis.Map.animationTime
         * @default 300
         */
        animationTime: 300,

        /**
         * Delay value before bboxChangeEnd event is fired.
         * @member {Number} sGis.Map.changeEndDelay
         * @default 300
         */
        changeEndDelay: 300
    });

    return Map;

});
