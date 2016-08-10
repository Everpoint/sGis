sGis.module('Map', [
    'utils',
    'Crs',
    'Event',
    'IEventHandler',
    'Point',
    'Bbox',
    'LayerGroup',
    'feature.Point'
], function(utils, Crs, Event, IEventHandler, Point, Bbox, PointF) {
    'use strict';

    /**
     *
     * @mixes sGis.IEventHandler.prototype
     * @param {Object} [options]
     * @param {sGis.Crs} [options.crs=sGis.CRS.webMercator] - setting a crs that cannot be converted into WGS resets default values of position to [0, 0].
     * @param {sGis.Point|sGis.feature.Point|Array} [options.position] - the start position of the map. If the array is specified as [x, y], it should be in map crs. By default center it is of Moscow.
     * @param {Number} [options.resolution=305.74811] - initial resolution of the map
     * @param {String} [options.wrapper] - Id of the DOM container that will contain the map. It should be block element. If not specified, the map will not be displayed.
     * @param {sGis.Layer} [options.layers[]] - the list of layers that will be initially on the map. The first in the list will be displayed at the bottom.
     * @constructor
     */

    var Map = function(options) {
        this._initLayerGroup();
        if (options && options.crs) this.crs = options.crs;
        sGis.utils.init(this, options);
    };

    Map.prototype = {
        _crs: sGis.CRS.webMercator,
        _position: new sGis.Point([55.755831, 37.617673]).projectTo(sGis.CRS.webMercator),
        _resolution: 611.4962262812505 / 2,
        _tileScheme: null,

        _initLayerGroup: function() {
            this._layerGroup = new sGis.LayerGroup();
            var self = this;
            this._layerGroup.on('layerAdd layerRemove layerOrderChange', function(sGisEvent) {
                self.forwardEvent(sGisEvent);
            });
        },

        /**
         * Adds a layer to the map
         * @param {sGis.Layer} layer - the layer to be added. If the layer is already on the map, an exception will be thrown.
         * @fires sGis.Map#layerAdd
         */
        addLayer: function(layer) {
            this._layerGroup.addLayer(layer);
        },

        /**
         * Adds a layer to the map
         * @param {sGis.Layer} layer - the layer to be added. If the layer is already on the map, an exception will be thrown.
         * @param {number} index - inserted index
         * @fires sGis.Map#layerAdd || sGis.Map#layerOrderChange
         */
        insertLayer: function(layer, index) {
            this._layerGroup.insertLayer(layer, index);
        },

        /**
         * Removes the layer from the map
         * @param {sGis.Layer} layer - the layer to be removed. If the layer is not on the map, an exception will be thrown.
         * @fires sGis.Map#layerRemove
         */
        removeLayer: function(layer) {
            this._layerGroup.removeLayer(layer);
        },

        /**
         * Changes order of layers, moves layer to the specified index. If the layer is not on the map, it will be added to the map.
         * @param {sGis.Layer} layer - layer to be moved.
         * @param {Number} index - new index of the layer.
         * @fires sGis.Map#layerOrderChange - in case the layer is on the map
         * @fires sGis.Map#layerAdd - in case the layer is not on the map
         * @deprecated
         */
        moveLayerToIndex: function(layer, index) {
            this._layerGroup.insertLayer(layer, index);
        },

        /**
         * Moves the layer to the end of the layer list. If the layer is not on the map, it will be added to the map.
         * @param {sGis.Layer} layer - layer to be moved.
         * @fires sGis.Map#layerOrderChange - in case the layer is on the map
         * @fires sGis.Map#layerAdd - in case the layer is not on the map
         */
        moveLayerToTop: function(layer) {
            this.moveLayerToIndex(layer, -1);
        },

        /**
         * Returns the order of the layer on the map
         * @param {type} layer
         * @returns {int}
         */
        getLayerIndex: function(layer) {
            return this._layerGroup.indexOf(layer);
        },

        /**
         * Moves the map position by the specified offset
         * @param {Number} dx - Offset along X axis in map coordinates, positive direction is right
         * @param {Number} dy - Offset along Y axis in map coordinates, positive direction is down
         */
        move: function(dx, dy) {
            if (!sGis.utils.isNumber(dx) || !sGis.utils.isNumber(dy)) sGis.utils.error('Number, Number is expected but got ' + dx + ', ' + dy + ' instead');
            var position = this.position;
            position.x += dx;
            position.y += dy;
            this.position = position;
        },

        /**
         * Changes the scale of map by scalingK
         * @param {Number} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} basePoint - /optional/ Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        changeScale: function(scalingK, basePoint, doNotAdjust) {
            var resolution = this.resolution;
            this.setResolution(resolution * scalingK, basePoint, doNotAdjust);
        },

        /**
         * Changes the scale of map by scalingK with animation
         * @param {float} scalingK - Coefficient of scaling (Ex. 5 -> 5 times zoom in)
         * @param {sGis.Point} basePoint - /optional/ Base point of zooming
         */
        animateChangeScale: function(scalingK, basePoint) {
            this.animateSetResolution(this.resolution * scalingK, basePoint);
        },

        zoom: function(k, basePoint) {
            var tileScheme = this.tileScheme;

            if (this._animationTarget) {
                var currResolution = this._animationTarget[1];
            } else {
                currResolution = this.resolution;
            }

            var resolution;
            if (tileScheme) {
                var levels = Object.keys(tileScheme.levels);
                for (var i = 0; i < levels.length; i++) {
                    var ratio = currResolution / tileScheme.levels[levels[i]].resolution;
                    if (ratio > 0.9) {
                        var newLevel = parseInt(i) + k;
                        while (!tileScheme.levels[newLevel]) {
                            newLevel += k > 0 ? -1 : 1;
                        }
                        resolution = tileScheme.levels[newLevel].resolution;
                        break;
                    }
                }
                if (!resolution) resolution = tileScheme.levels[levels[i]] && tileScheme.levels[levels[i]].resolution || currResolution;
            } else {
                resolution = currResolution * Math.pow(2, -k);
            }

            this.animateSetResolution(resolution, basePoint);
        },

        adjustResolution: function() {
            var resolution = this.resolution;
            var newResolution = this.getAdjustedResolution(resolution);
            var ratio = newResolution / resolution;
            if (ratio > 1.1 || ratio < 0.9) {
                this.animateSetResolution(newResolution);
                return true;
            } else if (ratio > 1.0001 || ratio < 0.9999) {
                this.setResolution(newResolution);
                return false;
            }
        },

        getAdjustedResolution: function(resolution) {
            var tileScheme = this.tileScheme;
            if (tileScheme) {
                var minDifference = Infinity;
                var index;
                var levels = Object.keys(tileScheme.levels);
                for (var i = 0; i < levels.length; i++) {
                    var difference = Math.abs(resolution - tileScheme.levels[levels[i]].resolution);
                    if (difference < minDifference) {
                        minDifference = difference;
                        index = levels[i];
                    }
                }
                return tileScheme.levels[index].resolution;
            } else {
                return resolution;
            }
        },

        /**
         * Sets new resolution to the map with animation
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @returns {undefined}
         */
        animateSetResolution: function(resolution, basePoint) {
            var adjustedResolution = this.getAdjustedResolution(resolution);
            var newPosition = this._getScaledPosition(adjustedResolution, basePoint);
            this._animateTo(newPosition, adjustedResolution);
            this.fire('animationStart');
        },

        _animationTime: 300,

        _animateTo: function(position, resolution) {
            this.stopAnimation();

            var originalPosition = this.position;
            var originalResolution = this.resolution;
            var dx = position.x - originalPosition.x;
            var dy = position.y - originalPosition.y;
            var dr = resolution - originalResolution;
            var startTime = Date.now();
            this._animationStopped = false;
            this._animationTarget = [position, resolution];

            var self = this;
            this._animationTimer = setInterval(function() {
                var time = Date.now() - startTime;
                if (time >= self._animationTime || self._animationStopped) {
                    self.setPosition(position, resolution);
                    self.stopAnimation();
                    self.fire('animationEnd');
                } else {
                    var x = self._easeFunction(time, originalPosition.x, dx, self._animationTime);
                    var y = self._easeFunction(time, originalPosition.y, dy, self._animationTime);
                    var r = self._easeFunction(time, originalResolution, dr, self._animationTime);
                    self.setPosition(new sGis.Point([x, y], self.crs), r);
                }
            }, 1000 / 60);
        },

        _getScaledPosition: function(newResolution, basePoint) {
            var position = this.position;
            basePoint = basePoint ? basePoint.projectTo(this.crs) : position;
            var resolution = this.resolution;
            var scalingK = newResolution / resolution;
            return new sGis.Point([(position.x - basePoint.x) * scalingK + basePoint.x, (position.y - basePoint.y) * scalingK + basePoint.y], position.crs);
        },

        stopAnimation: function() {
            this._animationStopped = true;
            this._animationTarget = null;
            clearInterval(this._animationTimer);
        },

        _easeFunction: function(t, b, c, d) {
            return b + c * t / d;
        },

        setPosition: function(position, resolution) {
            this.prohibitEvent('bboxChange');
            this.position = position;
            if (resolution) this.resolution = resolution;
            this.allowEvent('bboxChange');
            this.fire('bboxChange');
        },

        /**
         * Sets new resolution to the map
         * @param {Number} resolution
         * @param {sGis.Point} [basePoint] - Base point of zooming
         * @param {Boolean} [doNotAdjust=false] - do not adjust resolution to the round ones
         */
        setResolution: function(resolution, basePoint, doNotAdjust) {
            this.setPosition(this._getScaledPosition(this.resolution, basePoint), doNotAdjust ? resolution : this.getAdjustedResolution(resolution));
        },

        _defaultHandlers: {
            bboxChange: function () {
                var map = this;
                var CHANGE_END_DELAY = 300;
                if (map._changeTimer) clearTimeout(map._changeTimer);
                map._changeTimer = setTimeout((function (map) {
                    return function () {
                        map.fire('bboxChangeEnd', {map: map});
                        map._changeTimer = null;
                    };
                })(map), CHANGE_END_DELAY);
            }
        }
    };

    Object.defineProperties(Map.prototype, {
        /**
         * Returns a copy of the list of layers on the map. The first layer in the list is displayed on the bottom.<br>
         * If assigned, first removes all layers from the map (triggering "layerRemove" event) and then adds layers one by one (triggering "layerAdd" event for each).
         */
        layers: {
            get: function() {
                return this._layerGroup.layers;
            },

            set: function(layers) {
                this._layerGroup.layers = layers;
            }
        },

        /**
         * Sets or returns the CRS of the map. If the old crs cannot be projected to the new one, the position and resolution of the map are discharged.
         */
        crs: {
            get: function() {
                return this._crs;
            },
            set: function(crs) {
                if (!(crs instanceof sGis.Crs)) sGis.utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');

                var currentCrs = this._crs;
                this._crs = crs;

                if (currentCrs !== crs && (!currentCrs.to || !crs.to)) {
                    this.setPosition(new sGis.Point([0, 0], crs), 1);
                } else {
                    this.position = this.position.projectTo(crs);
                }
            }
        },

        /**
         * Returns or sets the resolution of the map. Triggers the "bboxChange" event if assigned. Throws an exception if assigned value is invalid.<br>
         * Valid values are any positive numbers;
         */
        resolution: {
            get: function() {
                return this._resolution;
            },

            set: function(resolution) {
                if (!sGis.utils.isNumber(resolution) || resolution <= 0) sGis.utils.error('Positive number is expected but got ' + resolution + ' instead');
                this._resolution = resolution;
                this.fire('bboxChange');
            }
        },

        /**
         * The position of the center of the map. Returns a copy of position object (sGis.Point). Triggers "bboxChange" event if assigned.<br>
         * Accepted values are sGis.Point and sGis.feature.Point instances or [x,y] array. Throws an exception if new position cannot be projected into map crs.
         * If the assigned value, the coordinates are considered to be in map crs.
         */
        position: {
            get: function() {
                return this._position.projectTo(this.crs);
            },

            set: function(position) {
                var point;
                if (position instanceof sGis.feature.Point || (sGis.utils.isArray(position) && position.length === 2 && sGis.utils.isNumber(position[0]) && sGis.utils.isNumber(position[1]))) {
                    var coordinates = position.coordinates || position;
                    point = new sGis.Point([coordinates[0], coordinates[1]], position.crs || this.crs);
                } else if (position instanceof sGis.Point) {
                    point = position;
                } else {
                    sGis.utils.error('sGis.Point or sGis.feature.Point instance is expected but got ' + position + ' instead');
                }

                this._position = point.projectTo(this.crs);
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
                    var layers = this.layers;
                    var tileScheme = null;
                    for (var i = 0, len = layers.length; i < len; i++) {
                        if (layers[i] instanceof sGis.TileLayer) {
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
                if (this._maxResolution) {
                    return this._maxResolution;
                } else {
                    var tileScheme = this.tileScheme;
                    if (tileScheme && tileScheme.levels) {
                        var maxResolution = 0;
                        var levels = Object.keys(tileScheme.levels);
                        for (var i = 0; i < levels.length; i++) {
                            maxResolution = Math.max(maxResolution, tileScheme.levels[levels[i]].resolution);
                        }
                        return maxResolution;
                    }
                }
            },
            set: function(resolution) {
                if (resolution !== null) {
                    if ((!sGis.utils.isNumber(resolution) || resolution <= 0)) sGis.utils.error('Positive number is expected but got ' + resolution + ' instead');
                    var minResolution = this.minResolution;
                    if (resolution < minResolution) sGis.utils.error('maxResolution cannot be less then minResolution');
                }
                this._maxResolution = resolution;
                if (this.resolution > this.maxResolution) this.resolution = resolution;
            }
        },

        minResolution: {
            get: function() {
                var tileScheme = this.tileScheme;
                if (tileScheme) {
                    var minResolution = Infinity;
                    var levels = Object.keys(tileScheme.levels);
                    for (var i = 0; i < levels.length; i++) {
                        minResolution = Math.min(minResolution, tileScheme.levels[levels[i]].resolution);
                    }

                    return minResolution;
                }
            }
        }
    });

    sGis.utils.proto.setMethods(Map.prototype, sGis.IEventHandler);

    return Map;

});
