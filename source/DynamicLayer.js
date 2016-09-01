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
         * @param {String} url - base part of the map service url
         * @param {Object} [properties] - key-value set of properties to be assigned to the instance
         */
        constructor(url, properties) {
            super(properties);
            this._url = url;
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
                var url = this.getImageUrl(bbox, resolution);
                if (url == null) return [];

                this._features[0].src = url;
                this._features[0].bbox = bbox;
                this._features[0].width = bbox.width / resolution;
                this._features[0].height = bbox.height / resolution;
            }

            return this._features;
        }

        /**
         * Returns the full url of a layer image
         * @param {sGis.Bbox} bbox - bounding box of the area to be drawn
         * @param {Number} resolution - resolution of the map
         * @returns {string}
         */
        getImageUrl(bbox, resolution) {
            var imgWidth = Math.round((bbox.xMax - bbox.xMin) / resolution);
            var imgHeight = Math.round((bbox.yMax - bbox.yMin) / resolution);
            var sr = encodeURIComponent(bbox.crs.wkid || JSON.stringify(bbox.crs.description));

            var url = this._url + 'export?' +
                'dpi=96&' +
                'transparent=true&' +
                'bbox='+
                bbox.xMin + '%2C' +
                bbox.yMin + '%2C' +
                bbox.xMax + '%2C' +
                bbox.yMax + '&' +
                'bboxSR=' + sr + '&' +
                'imageSR=' + sr + '&' +
                'size=' + imgWidth + '%2C' + imgHeight + '&' +
                'f=image';

            if (this._forceUpdate) {
                url += '&ts=' + new Date().valueOf();
                this._forceUpdate = false;
            }

            if (this.additionalParameters){
                var keys = Object.keys(this.additionalParameters);
                keys.forEach(key => {
                    url += `&${key}=${this.additionalParameters[key]}`;
                });
            }

            return url;
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
