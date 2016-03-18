sGis.module('ESRIDynamicLayer', [
    'utils',
    'DynamicLayer'
], function(utils, DynamicLayer) {
    'use strict';

    var defaults = {
        additionalParameters: null
    };

    class ESRIDynamicLayer extends sGis.DynamicLayer {
        constructor(source, options) {
            super();
            sGis.utils.init(this, options);
            this._source = source;
        }

        getImageUrl(bbox, resolution) {
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

            if (this.additionalParameters) {
                url += '&' + this.additionalParameters;
            }

            return url;
        }

        forceUpdate() {
            this._forceUpdate = true;
        }

        get layerDefinitions() { return this._layerDefs; }
        set layerDefinitions(layerDefs) {
            this._layerDefs = layerDefs;
            this.fire('propertyChange', {property: 'layerDefinitions'});
        }
    }

    function getLayersString(layers) {
        if (!layers || layers.length === 0) return '';
        return 'layers=show:' + layers.join('%2C') + '&';
    }

    sGis.utils.extend(ESRIDynamicLayer.prototype, defaults);

    return ESRIDynamicLayer;

});
