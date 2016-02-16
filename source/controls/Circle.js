(function() {

    sGis.controls.Circle = function(map, options) {
        if (!(map instanceof sGis.Map)) utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        options = options || {};

        if (options.activeLayer) this.activeLayer = options.activeLayer;
    };

    sGis.controls.Circle.prototype = new sGis.Control({
        segmentNo: 36,

        activate: function() {
            if (!this._isActive) {
                var self = this;

                if (!this._activeLayer) {
                    if (!this._tempLayer) this._tempLayer = new sGis.FeatureLayer();
                    this._map.addLayer(this._tempLayer);
                    this._activeLayer = this._tempLayer;
                }

                this._map.on('dragStart.sGis-RectangleControl', function(sGisEvent) {
                    self._startDrawing(sGisEvent.point);

                    this.on('drag.sGis-RectangleControl', function(sGisEvent) {
                        self._updateRectangle(sGisEvent.point);
                        sGisEvent.stopPropagation();
                        sGisEvent.preventDefault();
                    });

                    this.on('dragEnd.sGis-RectangleControl', function(sGisEvent) {
                        var feature = self._activeFeature;
                        this.removeListener('drag dragEnd.sGis-RectangleControl');
                        this._activeFeature = null;
                        self.fire('drawingFinish', { geom: feature, browserEvent: sGisEvent.browserEvent });
                    });

                    self.fire('drawingStart', { geom: self._activeFeature });
                });

                this._isActive = true;
            }
        },

        deactivate: function() {
            if (this._isActive) {
                this._map.off('.sGis-RectangleControl');

                if (this._activeLayer === this._tempLayer) {
                    this._map.removeLayer(this._tempLayer);
                    this._tempLayer.features = [];
                    this._activeLayer = null;
                }

                this._isActive = false;
            }
        },

        _startDrawing: function(point) {
            var center = point.getCoordinates();
            var coordinates = [];
            for (var i = 0; i < this.segmentNo; i++) {
                coordinates.push(center);
            }

            var circle = new sGis.feature.Polygon(coordinates, { crs: point.crs });
            circle.center = center;

            this.activeLayer.add(circle);
            this._activeFeature = circle;

            this._map.redrawLayer(this.activeLayer);
        },

        _updateRectangle: function(newPoint) {
            var center = this._activeFeature.center;
            var newCoord = newPoint.coordinates;
            var radius = Math.sqrt(Math.pow(center[0] - newCoord[0], 2) + Math.pow(center[1] - newCoord[1], 2));
            var coordinates = [];
            for (var i = 0; i < this.segmentNo; i++) {
                var point = [
                    center[0] + radius * Math.sin(2 * Math.PI * i / this.segmentNo),
                    center[1] + radius * Math.cos(2 * Math.PI * i / this.segmentNo)
                ];
                coordinates.push(point);
            }

            this._activeFeature.coordinates = coordinates;
            this._map.redrawLayer(this.activeLayer);
        }
    });

    sGis.utils.proto.setProperties(sGis.controls.Circle.prototype, {
        isActive: {
            default: false,
            set: function(bool) {
                if (bool) {
                    this.activate();
                } else {
                    this.deactivate();
                }
            }
        },
        activeLayer: {
            default: null,
            set: function(layer) {
                if (!(layer instanceof sGis.FeatureLayer) && layer !== null) utils.error('sGis.FeatureLayer instance is expected but got ' + layer + ' instead');
                this._activeLayer = layer;
            }
        },
        tempLayer: {
            set: null
        }
    });

})();