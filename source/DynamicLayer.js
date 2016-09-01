sGis.module('DynamicLayer', [
    'utils',
    'Layer',
    'feature.Image',
    'symbol.image.Image'
], function(utils, /** sGis.Layer.constructor */ Layer, Image, ImageSymbol) {
    'use strict';

    /**
     * Represents a layer that is fully drawn by server and is displayed as an image overlay.
     * @alias sGis.DynamicLayer
     * @extends sGis.Layer
     */
    class DynamicLayer extends Layer {
        /**
         * @constructor
         * @param {function(sGis.Bbox, Number)} getUrlDelegate
         * @param {Object} [properties] - key-value set of properties to be assigned to the instance
         */
        constructor(getUrlDelegate, properties) {
            super(properties);
            this._getUrl = getUrlDelegate;
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];
            
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
                var url = this._getUrl(bbox, resolution);
                if (url == null) return [];
                if (this._forceUpdate) {
                    url += '&ts=' + Date.now();
                    this._forceUpdate = false;
                }

                this._features[0].src = url;
                this._features[0].bbox = bbox;
                this._features[0].width = bbox.width / resolution;
                this._features[0].height = bbox.height / resolution;
            }

            return this._features;
        }

        /**
         * Ensures update of the layer image
         */
        forceUpdate() {
            this._forceUpdate = true;
            this.fire('propertyChange', {property: 'source'});
        }

        _createFeature(bbox) {
            var feature = new Image(bbox, { crs: this.crs || bbox.crs, opacity: this.opacity});
            this._features = [feature];
            this._updateSymbol();
        }

        get opacity() { return this.getOpacity(); }
        set opacity(opacity) {
            this.setOpacity(opacity);
            this._updateSymbol();
        }

        /**
         * Coordinate system of the layer
         * @type {sGis.Crs}
         * @default null
         */
        get crs() { return this._crs; }
        set crs(/** sGis.Crs */ crs) { this._crs = crs; }

        /**
         * Base url of the service
         * @type {String}
         */
        get url() { return this._url; }
        
        _updateSymbol() {
            if (this._features) this._features[0].symbol = new ImageSymbol({ opacity: this.opacity });
        }
    }

    /**
     * Additional url parameters to be added to the image url as a key-value set.
     * @member {Object} additionalParameters
     * @memberof sGis.DynamicLayer
     * @instance
     * @default {}
     */
    DynamicLayer.prototype.additionalParameters = {};

    /**
     * @default true
     */
    DynamicLayer.prototype.delayedUpdate = true;

    DynamicLayer.prototype._crs = null;

    return DynamicLayer;

});
