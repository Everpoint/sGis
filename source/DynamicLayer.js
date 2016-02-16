'use strict';

(function() {

    sGis.DynamicLayer = function(extention) {
        if (!extention.getImageUrl) utils.error('sGis.DynamicLayer child class must include .getImageUrl(bbox, resolution) method');
        for (var key in extention) {
            this[key] = extention[key];
        }
    };

    sGis.DynamicLayer.prototype = new sGis.Layer({
        _layers: null,
        _delayedUpdate: true,
        _crs: null,
        _transitionTime: sGis.browser.indexOf('Chrome') === 0 ? 0 : 200,

        getFeatures: function(bbox, resolution) {
            if (!this._display || this._layers && this._layers.length === 0) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            if (this._features && this._features[0].crs !== bbox.crs) this._features = null;

            if (!this._features) this._createFeature(bbox);
            var width  = bbox.width / resolution;
            var height = bbox.height / resolution;
            if (this._forceUpdate || !this._features[0].bbox.equals(bbox) || this._features[0].width !== width || this._features[0].height !== height) {
                var url = this.getImageUrl(bbox, resolution);
                this._features[0].src = url;
                this._features[0].bbox = bbox;
                this._features[0].width = bbox.width / resolution;
                this._features[0].height = bbox.height / resolution;
            }

            return this._features;
        },

        _createFeature: function(bbox) {
            var feature = new sGis.feature.Image(bbox, { opacity: this.opacity, style: { transitionTime: this._transitionTime, renderToCanvas: false }});
            this._features = [feature];
        },

        getObjectType: function() {
            return 'img';
        },

        showSubLayer: function(id) {
            if (this._serverConnector) {
                this._serverConnector.showLayer(id);
            }
        },

        hideSubLayer: function(id) {
            if (this._serverConnector) {
                this._serverConnector.hideLayer(id);
            }
        },

        showLayers: function(layerArray) {
            this.layers = layerArray;
        },

        getDisplayedLayers: function() {
            return this._layers;
        }
    });

    Object.defineProperties(sGis.DynamicLayer.prototype, {
        layers: {
            get: function() {
                return this._layers && this._layers.concat();
            },
            set: function(layers) {
                if (!utils.isArray(layers)) utils.error('Array is expected but got ' + layers + ' instead');
                this._layers = layers;
            }
        },

        crs: {
            get: function() {
                return this._crs;
            },
            set: function(crs) {
                if (crs && !(crs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');
                this._crs = crs;
            }
        },

        opacity: {
            get: function() {
                return this._opacity;
            },

            set: function(opacity) {
                if (!utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
                opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
                this._opacity = opacity;
                if (this._features && this._features[0]) this._features[0].opacity = opacity;
                this.fire('propertyChange', {property: 'opacity'});
            }
        }
    });

})();