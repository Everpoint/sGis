(function() {

    var MultiPoint = function(map, options) {
        this._map = map;
        this._ns = '.' + utils.getGuid();

        utils.init(this, options);
    };

    MultiPoint.prototype = new sGis.Control({
        symbol: new sGis.symbol.point.Point(),

        activate: function() {
            if (!this._isActive) {
                if (!this.activeLayer) {
                    if (!this._tempLayer) this._tempLayer = new sGis.FeatureLayer();
                    this._map.addLayer(this._tempLayer);
                    this.activeLayer = this._tempLayer;
                }

                this._map.addListener('click' + this._ns, this._clickHandler.bind(this));
                this._map.on('dblclick' + this._ns, this._dblClickHandler.bind(this));
                this._isActive = true;
            }
        },

        deactivate: function() {
            if (this._isActive) {
                if (this.activeFeature) {
                    this.cancelDrawing();
                }

                if (this.activeLayer === this._tempLayer) {
                    this._map.removeLayer(this._tempLayer);
                    this._tempLayer.features = [];
                    this.activeLayer = null;
                }

                this._map.off('click' + this._ns);
                this._isActive = false;
            }
        },

        _clickHandler: function(sGisEvent) {
            var self = this;
            setTimeout(function() {
                if (sGisEvent.isCanceled() || self._isDblClick) return;
                if (self._activeFeature) {
                    self._addPoint(sGisEvent.point);
                } else {
                    self.startNewFeature(sGisEvent.point);
                }
            }, 0);
        },

        _dblClickHandler: function(sGisEvent) {
            this._isDblClick = true;

            this.activeFeature = null;
            var self = this;
            setTimeout(function() {
                self._isDblClick = false;
            }, 0);

            sGisEvent.preventDefault();
            this.deactivate();
        },

        _addPoint: function(point) {
            if (!this._activeFeature) return;
            this._activeFeature.addPoint(point);
            this._map.redrawLayer(this._activeLayer);
            this.fire('pointAdd');
        },

        startNewFeature: function(point) {
            if (!this._isActive) return;
            this.activeFeature = new sGis.feature.MultiPoint([point], {symbol: this.symbol, crs: point.crs});
            this._map.redrawLayer(this._activeLayer);
            this.fire('drawingBegin');
            this.fire('pointAdd');
        }
    });

    sGis.utils.proto.setProperties(MultiPoint.prototype, {
        activeFeature: {
            get: function() { return this._activeFeature; },
            set: function(feature) {
                if (!(feature instanceof sGis.feature.MultiPoint) && feature !== null) utils.error('sGis.feature.MultiPoint is expected');
                if (!this._isActive) return;

                if (this._activeFeature && this._activeFeature !== feature) this.fire('drawingFinish', {geom: this._activeFeature});

                if (feature) this.activeLayer.add(feature);
                this._activeFeature = feature;
            }
        }
    });

    sGis.controls.MultiPoint = MultiPoint;

})();