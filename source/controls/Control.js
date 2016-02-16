'use strict';

(function() {

    sGis.controls = {};

    sGis.Control = function(extention) {
        for (var key in extention) {
            this[key] = extention[key];
        }
    };

    sGis.Control.prototype = {
        _activeLayer: null,

        activate: function() {
            if (!this._active) {
                this._setActiveStatus(true);
            }
        },

        deactivate: function() {
            if (this._active) {
                this._setActiveStatus(false);
                if (this._selfActiveLayer) {
                    this._map.removeLayer(this._activeLayer);
                    this._activeLayer = null;
                    this._selfActiveLayer = false;
                }
            }
        }
    };

    Object.defineProperties(sGis.Control.prototype, {
        activeLayer: {
            get: function() {
                if (this._activeLayer) {
                    return this._activeLayer;
                } else {
                    var layer = new sGis.FeatureLayer();
                    this._map.addLayer(layer);
                    this._activeLayer = layer;
                    return layer;
                }
            },

            set: function(layer) {
                if (!(layer instanceof sGis.FeatureLayer)) utils.error('Expected sGis.FeatureLayer instance but got ' + layer + ' instead');
                if (this.isActive) utils.error('Cannot set active layer for an acitve control');
                if (this._map && this._map.getLayerIndex(layer) === -1) utils.error('The layer does not belong to control\'s map');
                this._activeLayer = layer;
            }
        },

        isActive: {
            get: function() {
                return this._active;
            },

            set: function(bool) {
                if (bool === true) {
                    this.activate();
                } else if (bool === false) {
                    this.deactivate();
                } else {
                    utils.error('Boolean is expected but got ' + bool + ' instead');
                }
            }
        },

        map: {
            get: function() {
                return this._map;
            }
        }
    });

    sGis.utils.proto.setMethods(sGis.Control.prototype, sGis.IEventHandler);

})();