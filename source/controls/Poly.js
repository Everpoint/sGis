'use strict';

(function() {

    sGis.controls.Poly = function(extention) {
        for (var key in extention) {
            this[key] = extention[key];
        }
    };

    sGis.controls.Poly.prototype = new sGis.Control({
        _featureClass: null,

        _initialize: function(map, options) {
            if (!(map instanceof sGis.Map)) utils.error('Expected sGis.Map child, but got ' + map + ' instead');
            this._map = map;

            options = options || {};
            if (options.activeLayer) this.activeLayer = options.activeLayer;
            this._prototype = new this._featureClass([[]], {style: options.style, symbol: options.symbol});


            utils.init(this, options);

            this._active = false;
            var self = this;

            this._clickHandler = function(sGisEvent) {
                setTimeout(function() {
                    if (Date.now() - self._dblClickTime < 30) return;
                    var pxPosition = sGisEvent.mouseOffset,
                        point = self._map.getPointFromPxPosition(pxPosition.x, pxPosition.y);

                    if (self._activeFeature) {
                        if (sGisEvent.ctrlKey) {
                            self.startNewRing();
                        } else {
                            self._activeFeature.addPoint(point, self._activeFeature.coordinates.length - 1);
                        }
                        self.fire('pointAdd');
                    } else {
                        self.startNewFeature(point);

                        self._activeFeature.prohibitEvent('click');

                        self.fire('drawingBegin');
                        self.fire('pointAdd');
                    }

                    self._map.redrawLayer(self.activeLayer);
                }, 10);
                sGisEvent.stopPropagation();
                sGisEvent.preventDefault();
            };

            this._mousemoveHandler = function(sGisEvent) {
                var pxPosition = sGisEvent.mouseOffset,
                    point = self._map.getPointFromPxPosition(pxPosition.x, pxPosition.y),
                    ring = self._activeFeature.coordinates.length - 1;

                self._activeFeature.removePoint(ring, self._activeFeature.coordinates[ring].length - 1);

                if (self._activeFeature.coordinates.length > ring) {
                    self._activeFeature.addPoint(point, ring);
                } else {
                    self._activeFeature.setRing(ring, [point]);
                }

                self._map.redrawLayer(self.activeLayer);
            };

            this._dblclickHandler = function(sGisEvent) {
                finishDrawing(self, sGisEvent);
                sGisEvent.preventDefault();
                self._dblClickTime = Date.now();
            };
        },

        startNewFeature: function(point) {
            this.activate();
            this.cancelDrawing();
            this._activeFeature = createFeature(this.activeLayer, point, {style: this._prototype.style, symbol: this._prototype.symbol, crs: this._map.crs}, this._featureClass);

            this._map.addListener('mousemove.sGis-polygon', this._mousemoveHandler);
            this._map.addListener('dblclick.sGis-polygon', this._dblclickHandler);

            return this._activeFeature;

        },

        _setActiveStatus: function(isActive) {
            if (isActive) {
                this._map.addListener('click.sGis-polygon', this._clickHandler);
            } else {
                if (this._activeFeature) finishDrawing(this);
                this._map.removeListener('click.sGis-polygon');
            }
            this._active = isActive;
        },

        cancelDrawing: function() {
            if (this._activeFeature) {
                var coordinates = this._activeFeature.coordinates;
                if (coordinates.length > 1) {
                    coordinates.pop();
                } else {
                    coordinates = [[[0, 0]]];
                }

                this._activeFeature.coordinates = coordinates;
                this.prohibitEvent('drawingFinish');
                finishDrawing(this);
                this.allowEvent('drawingFinish');
            }
        },

        startNewRing: function() {
            var coordinates = this._activeFeature.coordinates;
            var ringIndex = coordinates.length;
            var point = coordinates.pop().pop();
            this._activeFeature.setRing(ringIndex, [point]);
        },

        activate: function() {
            if (!this.isActive) {
                if (!this.activeLayer) {
                    if (!this._tempLayer) this._tempLayer = new sGis.FeatureLayer();
                    this._map.addLayer(this._tempLayer);
                    this.activeLayer = this._tempLayer;
                }

                this._map.addListener('click.sGis-polygon', this._clickHandler);
                this._isActive = true;
            }
        },

        deactivate: function() {
            if (this.isActive) {
                if (this.activeFeature) {
                    this.cancelDrawing();
                }

                if (this.activeLayer === this._tempLayer) {
                    this._map.removeLayer(this._tempLayer);
                    this._tempLayer.features = [];
                    this.activeLayer = null;
                }

                this._map.off('click.sGis-polygon');
                this._isActive = false;
            }
        },


    });

    Object.defineProperties(sGis.controls.Poly.prototype, {
        activeLayer: {
            get: function() {
                return this._activeLayer;
            },
            set: function(layer) {
                if (!(layer instanceof sGis.FeatureLayer) && layer !== null) utils.error('sGis.FeatureLayer instance is expected but got ' + layer + ' instead');
                this._activeLayer = layer;
            }
        },

        style: {
            get: function() {
                return this._prototype.style;
            },
            set: function(style) {
                this._prototype.style = style;
            }
        },

        symbol: {
            get: function() {
                return this._prototype.symbol;
            },
            set: function(symbol) {
                this._prototype.symbol = symbol;
            }
        },

        activeFeature: {
            get: function() {
                return this._activeFeature;
            },

            set: function(feature) {
                if (!(feature instanceof this._featureClass)) utils.error('sGis.feature.Polygon instance is expected but got ' + feature + ' instead');
                if (this._activeFeature) {
                    if (feature === this._activeFeature) return;
                    this.canceDrawing();
                }

                this._activeFeature = feature;
                this._map.addListener('mousemove.sGis-polygon', this._mousemoveHandler);
                this._map.addListener('dblclick.sGis-polygon', this._dblclickHandler);

                this._activeFeature.prohibitEvent('click');

                this.activate();
            }
        },

        isActive: {
            get: function() {
                return this._isActive;
            },
            set: function(bool) {
                if (bool) {
                    this.activate();
                } else {
                    this.deactivate();
                }
            }
        }
    });

    function createFeature(layer, point, options, featureClass) {
        var polygon = new featureClass([[point.x, point.y], [point.x, point.y]], options);
        layer.add(polygon);
        return polygon;
    }

    function finishDrawing(control, sGisEvent) {
        var ring = control._activeFeature.coordinates.length - 1;
        if (control._activeFeature.coordinates[ring].length < 3) {
            control.activeLayer.remove(control._activeFeature);
        } else {
            control._activeFeature.removePoint(ring, control._activeFeature.coordinates[ring].length - 1);
            var geom = control._activeFeature;
        }

        control._activeFeature.allowEvent('click');

        control._map.removeListener('mousemove.sGis-polygon');
        control._map.removeListener('dblclick.sGis-polygon');
        control._activeFeature = null;

        control._map.redrawLayer(control.activeLayer);
        if (geom) control.fire('drawingFinish', { geom: geom, browserEvent: sGisEvent && sGisEvent.browserEvent });
    }

})();