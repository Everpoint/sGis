sGis.module('Map', [
    'utils',
    'Crs',
    'CRS',
    'EventHandler',
    'Point',
    'Bbox',
    'LayerGroup'
], function(utils, Crs, CRS, EventHandler, Point, Bbox, LayerGroup) {
    'use strict';

    let defaults = {
        _crs: CRS.webMercator,
        _position: new Point([55.755831, 37.617673]).projectTo(CRS.webMercator).position,
        _resolution: 611.4962262812505 / 2,
        _animationTime: 300,
        _tileScheme: null,
        changeEndDelay: 300
    };

    /**
     *
     * @alias sGis.Map
     * @extends sGis.LayerGroup
     */
    class Map extends LayerGroup {
        constructor(properties = {}) {
            super();
            if (properties.crs) this.crs = properties.crs;
            utils.init(this, properties);

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
         * @param {sGis.Point} basePoint - /optional/ Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        changeScale (scalingK, basePoint, doNotAdjust) {
            let resolution = this.resolution;
            this.setResolution(resolution * scalingK, basePoint, doNotAdjust);
        }

        /**
         * Changes the scale of map by scalingK with animation
         * @param {float} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} basePoint - /optional/ Base point of zooming
         */
        animateChangeScale (scalingK, basePoint) {
            this.animateSetResolution(this.resolution * scalingK, basePoint);
        }

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

        adjustResolution () {
            let resolution = this.resolution;
            let newResolution = this.getAdjustedResolution(resolution);
            let ratio = newResolution / resolution;
            if (ratio > 1.1 || ratio < 0.9) {
                this.animateSetResolution(newResolution);
                return true;
            } else if (ratio > 1.0001 || ratio < 0.9999) {
                this.setResolution(newResolution);
                return false;
            }
        }

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
            this._animateTo(newPosition, adjustedResolution);
            this.fire('animationStart');
        }
        
        animateTo(position, resolution) {
            this._animateTo(position, resolution);
        }

        _animateTo (position, resolution) {
            this.stopAnimation();

            let originalPosition = this.centerPoint;
            let originalResolution = this.resolution;
            let dx = position.x - originalPosition.x;
            let dy = position.y - originalPosition.y;
            let dr = resolution - originalResolution;
            let startTime = Date.now();
            this._animationStopped = false;
            this._animationTarget = [position, resolution];

            let self = this;
            this._animationTimer = setInterval(function() {
                let time = Date.now() - startTime;
                if (time >= self._animationTime || self._animationStopped) {
                    self.setPosition(position, resolution);
                    self.stopAnimation();
                    self.fire('animationEnd');
                } else {
                    let x = self._easeFunction(time, originalPosition.x, dx, self._animationTime);
                    let y = self._easeFunction(time, originalPosition.y, dy, self._animationTime);
                    let r = self._easeFunction(time, originalResolution, dr, self._animationTime);
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

        stopAnimation () {
            this._animationStopped = true;
            this._animationTarget = null;
            clearInterval(this._animationTimer);
        }

        _easeFunction (t, b, c, d) {
            return b + c * t / d;
        }

        setPosition (position, resolution) {
            this.prohibitEvent('bboxChange');
            this.centerPoint = position;
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

        get position() { return this._position; }
        set position(position) {
            this._position = position;
            this.fire('bboxChange');
        }

        get centerPoint() { return new Point(this.position, this.crs); }
        set centerPoint(point) {
            this.position = point.projectTo(this.crs).position;
        }

        get crs() { return this._crs; }
        set crs(crs) {
            let projection = this._crs.projectionTo(crs);
            this._crs = crs;
            if (projection) {
                this.position = projection(this.position);
            } else {
                this.position = [0, 0];
            }
        }
    }
    
    utils.extend(Map.prototype, defaults);

    Object.defineProperties(Map.prototype, {
        /**
         * Returns or sets the resolution of the map. Triggers the "bboxChange" event if assigned. Throws an exception if assigned value is invalid.<br>
         * Valid values are any positive numbers;
         */
        resolution: {
            get: function() {
                return this._resolution;
            },

            set: function(resolution) {
                this._resolution = resolution;
                this.fire('bboxChange');
            }
        },

        /**
         * Sets and returns the tile scheme of the map. If set to null (by default), the tile scheme of the first tile layer in the layer list is used.
         */
        tileScheme: {
            get: function() {
                if (this._tileScheme !== null) {
                    return this._tileScheme;
                } else {
                    let layers = this.getLayers(true);
                    let tileScheme = null;
                    for (let i = 0, len = layers.length; i < len; i++) {
                        if (layers[i].tileScheme) {
                            tileScheme = layers[i].tileScheme;
                            break;
                        }
                    }
                    return tileScheme;
                }
            },
            set: function(scheme) {
                this._tileScheme = scheme;
            }
        },

        /**
         * Sets and returns the maxim resolution allowed for the map. If set to null, the tileScheme settings will be used. If no tileScheme is set, no limit will be used.
         */
        maxResolution: {
            get: function() {
                return this._maxResolution || this.tileScheme && this.tileScheme.maxResolution;
            },
            set: function(resolution) {
                if (resolution !== null) {
                    let minResolution = this.minResolution;
                    if (resolution < minResolution) utils.error('maxResolution cannot be less then minResolution');
                }
                this._maxResolution = resolution;
                if (this.resolution > this.maxResolution) this.resolution = resolution;
            }
        },

        minResolution: {
            get: function() {
                return this._minResolution || this.tileScheme && this.tileScheme.minResolution;
            },
            set: function(resolution) {
                if (resolution !== null) {
                    let maxResolution = this.maxResolution;
                    if (resolution < maxResolution) utils.error('maxResolution cannot be less then minResolution');
                }
                this._maxResolution = resolution;
                if (this.resolution > this.minResolution) this.resolution = resolution;
            }
        }
    });

    return Map;

    /**
     * A layer is added to the map
     * @event sGis.Map#layerAdd
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - added layer
     */

    /**
     * A layer is removed from the map
     * @event sGis.Map#layerRemove
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - removed layer
     */

    /**
     * Position of one of the layers on the map is changed
     * @event sGis.Map#layerOrderChange
     * @mixes sGisEvent
     * @type {Object}
     * @property {sGis.Layer} layer - the layer that was moved
     */

});
