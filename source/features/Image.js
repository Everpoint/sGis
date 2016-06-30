sGis.module('feature.Image', [
    'utils',
    'Feature',
    'symbol.image'
], function(utils, Feature, imageSymbols) {
    
    'use strict';

    var defaults = {
        _src: null,
        _symbol: new imageSymbols.image.Image()
    };

    /**
     * @alias sGis.feature.Image
     * @extends sGis.Feature
     */
    class ImageF extends Feature {
        /**
         * @constructor
         * @param {sGis.Bbox} bbox - bbox that the image will fit 
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(bbox, properties) {
            super(properties);
            this.bbox = bbox;
        }

        /**
         * @override
         */
        _needToRender(resolution, crs) {
            return !this.getRenderCache();
        }

        /**
         * Source of the image. Can be html address or data:url string.
         * @type String
         * @default null
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this.redraw();
        }
    }
    
    utils.extend(ImageF.prototype, defaults);

    Object.defineProperties(ImageF.prototype, {
        bbox: {
            get: function() {
                return this._bbox.projectTo(this.crs);
            },
            set: function(bbox) {
                var adjBbox;
                if (bbox instanceof sGis.Bbox) {
                    if (this._crs) {
                        adjBbox = bbox.projectTo(this._crs);
                    } else {
                        adjBbox = bbox;
                        this._crs = bbox.crs;
                    }
                } else {
                    adjBbox = new sGis.Bbox(bbox[0], bbox[1], this._crs || sGis.CRS.geo);
                }
                if (!this._bbox || !this._bbox.equals(adjBbox)) {
                    this._bbox = adjBbox;
                    this._cache = null;
                }
            }
        }
    });
    
    return ImageF;
    
});
