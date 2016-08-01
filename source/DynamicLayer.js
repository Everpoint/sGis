sGis.module('DynamicLayer', [
    'utils',
    'Layer',
    'feature.Image'
], function(utils, Layer, Image) {
    'use strict';

    var defaults = {
        _layers: null,
        delayedUpdate: true,
        crs: null,
        _transitionTime: sGis.browser.indexOf('Chrome') === 0 ? 0 : 200
    };

    class DynamicLayer extends sGis.Layer {
        getFeatures(bbox, resolution) {
            if (!this._display || this._layers && this._layers.length === 0) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];
            
            if (this.crs) {
                if (bbox.crs.canProjectTo(this.crs)) {
                    bbox = bbox.projectTo(this.crs);
                } else {
                    return [];
                }
            }
            
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
        }

        _createFeature(bbox) {
            var feature = new sGis.feature.Image(bbox, { crs: this.crs, opacity: this.opacity, style: { transitionTime: this._transitionTime, renderToCanvas: false }});
            this._features = [feature];
        }

        showSubLayer(id) {
            if (this._serverConnector) {
                this._serverConnector.showLayer(id);
            }
        }

        hideSubLayer(id) {
            if (this._serverConnector) {
                this._serverConnector.hideLayer(id);
            }
        }

        showLayers(layerArray) {
            this.layers = layerArray;
        }

        getDisplayedLayers() {
            return this._layers;
        }

        get layers() { return this._layers && this._layers.concat(); }
        set layers(layers) {
            if (!sGis.utils.isArray(layers)) sGis.utils.error('Array is expected but got ' + layers + ' instead');
            this._layers = layers;
        }

        get opacity() { return this._opacity; }
        set opacity(opacity) {
            if (!sGis.utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            if (this._features && this._features[0]) this._features[0].opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }
        
        get crs() { return this._crs; }
        set crs(crs) { this._crs = crs; }
    }

    sGis.utils.extend(DynamicLayer.prototype, defaults);

    return DynamicLayer;

});
