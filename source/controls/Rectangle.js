(function() {

    sGis.controls.Rectangle = function(map, options) {
        if (!(map instanceof sGis.Map)) utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        options = options || {};

        if (options.activeLayer) this.activeLayer = options.activeLayer;
    };

    sGis.controls.Rectangle.prototype = new sGis.Control({
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
            var coord = point.getCoordinates(),
                rect = new sGis.feature.Polygon([coord, coord, coord, coord], { crs: point.crs });

            this.activeLayer.add(rect);
            this._activeFeature = rect;

            this._map.redrawLayer(this.activeLayer);
        },

        _updateRectangle: function(newPoint) {
            var coord = this._activeFeature.coordinates[0],
                pointCoord = newPoint.getCoordinates();

            coord = [coord[0], [coord[1][0], pointCoord[1]], pointCoord, [pointCoord[0], coord[3][1]]];

            this._activeFeature.coordinates = coord;
            this._map.redrawLayer(this.activeLayer);
        }
    });

    sGis.utils.proto.setProperties(sGis.controls.Rectangle.prototype, {
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