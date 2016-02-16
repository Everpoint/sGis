'use strict';

(function() {

    sGis.controls.Point = function(map, options) {
        if (!(map instanceof sGis.Map)) utils.error('Expected sGis.Map child, but got ' + map + ' instead');
        this._map = map;
        this._prototype = new sGis.feature.Point([0, 0]);

        utils.init(this, options);

        this._active = false;

        var self = this;

        this._addPoint = function(sGisEvent) {
            var pxPosition = sGisEvent.mouseOffset,
                point = self._map.getPointFromPxPosition(pxPosition.x, pxPosition.y);

            self.startNewFeature(point);

            sGisEvent.stopPropagation();
            sGisEvent.preventDefault();
        };
    };

    sGis.controls.Point.prototype = new sGis.Control({
        startNewFeature: function(point) {
            var feature = new sGis.feature.Point(point.getCoordinates(), {crs: this._map.crs, symbol: this._prototype.symbol, style: this._prototype.style});
            var activeLayer = this.activeLayer;

            activeLayer.add(feature);
            this._map.redrawLayer(activeLayer);
            this.fire('drawingFinish', {geom: feature});

            return feature;
        },

        activate: function() {
            if (!this._isActive) {
                if (!this._activeLayer) {
                    if (!this._tempLayer) this._tempLayer = new sGis.FeatureLayer();
                    this._map.addLayer(this._tempLayer);
                    this._activeLayer = this._tempLayer;
                }

                this._map.addListener('click.sGis-point', this._addPoint);
                this._isActive = true;
            }
        },


        deactivate: function() {
            if (this._isActive) {
                this._map.removeListener('click.sGis-point', this._addPoint);

                if (this._activeLayer === this._tempLayer) {
                    this._map.removeLayer(this._tempLayer);
                    this._tempLayer.features = [];
                    this._activeLayer = null;
                }

                this._isActive = false;
            }
        }
    });

    Object.defineProperties(sGis.controls.Point.prototype, {
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
        },

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
        }
    });

})();