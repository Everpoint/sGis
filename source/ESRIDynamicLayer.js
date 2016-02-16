'use strict';

(function() {

    sGis.ESRIDynamicLayer = function(source, options) {
        if (!source) {
            error('The source of dynamic service is not specified');
        }

        this.__initialize();

        utils.init(this, options);
        this._source = source;
    };

    sGis.ESRIDynamicLayer.prototype = new sGis.DynamicLayer({
        _additionalParameters: null,

        getImageUrl: function(bbox, resolution) {
            var imgWidth = Math.round((bbox.p[1].x - bbox.p[0].x) / resolution),
                imgHeight = Math.round((bbox.p[1].y - bbox.p[0].y) / resolution),
                layersString = getLayersString(this.getDisplayedLayers()),
                sr = encodeURIComponent(bbox.p[0].crs.ESRIcode || JSON.stringify(bbox.p[0].crs.description)),
                layerDefs = this._layerDefs ? '&layerDefs=' + encodeURIComponent(this._layerDefs) + '&' : '',

                url = this._source + 'export?' +
                    'dpi=96&' +
                    'transparent=true&' +
                    'format=png8&' +
                    'bbox='+
                    bbox.p[0].x + '%2C' +
                    bbox.p[0].y + '%2C' +
                    bbox.p[1].x + '%2C' +
                    bbox.p[1].y + '&' +
                    'bboxSR=' + sr + '&' +
                    'imageSR=' + sr + '&' +
                    'size=' + imgWidth + '%2C' + imgHeight + '&' +
                    layersString + '&' +
                    layerDefs +
                    'f=image';

            if (this._forceUpdate) {
                url += '&ts=' + new Date().valueOf();
                this._forceUpdate = false;
            }

            if (this._additionalParameters) {
                url += '&' + this._additionalParameters;
            }

            return url;
        },

        forceUpdate: function() {
            this._forceUpdate = true;
        }
    });

    Object.defineProperties(sGis.ESRIDynamicLayer.prototype, {
        layerDefinitions: {
            set: function(layerDefs) {
                this._layerDefs = layerDefs;
                this.fire('propertyChange', {property: 'layerDefinitions'});
            }
        },

        additionalParameters: {
            get: function() {
                return this._additionalParameters;
            },

            set: function(param) {
                this._additionalParameters = param;
            }
        }
    });

    function getLayersString(layers) {
        if (!layers || layers.length === 0) return '';
        return 'layers=show:' + layers.join('%2C') + '&';
    }

})();