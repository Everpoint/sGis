sGis.module('Control', [
    'utils',
    'FeatureLayer',
    'EventHandler'
], function(utils, FeatureLayer, EventHandler) {
    'use strict';
    
    class Control extends EventHandler {
        constructor(extension) {
            super();
            for (var key in extension) {
                this[key] = extension[key];
            }
        }

        activate () {
            if (!this._active) {
                this._setActiveStatus(true);
            }
        }

        deactivate () {
            if (this._active) {
                this._setActiveStatus(false);
                if (this._selfActiveLayer) {
                    this._map.removeLayer(this._activeLayer);
                    this._activeLayer = null;
                    this._selfActiveLayer = false;
                }
            }
        }
    }
    
    Control.prototype._activeLayer = null;

    Object.defineProperties(Control.prototype, {
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
                if (!(layer instanceof sGis.FeatureLayer)) sGis.utils.error('Expected sGis.FeatureLayer instance but got ' + layer + ' instead');
                if (this.isActive) sGis.utils.error('Cannot set active layer for an acitve control');
                if (this._map && this._map.indexOf(layer) === -1) sGis.utils.error('The layer does not belong to control\'s map');
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
                    sGis.utils.error('Boolean is expected but got ' + bool + ' instead');
                }
            }
        },

        map: {
            get: function() {
                return this._map;
            }
        }
    });
    
    return Control;

});
