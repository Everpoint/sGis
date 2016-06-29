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
    
    class ImageF extends Feature {
        constructor(bbox, properties) {
            super(properties);
            this.bbox = bbox;
        }
        
        get src() { return this._src; }
        set src(src) {
            this._src = src;
            this.redraw();
        }
    }
    
    utils.extend(ImageF.prototype, defaults);

    Object.defineProperties(ImageF.prototype, {
        type: {
            value: 'image'
        },

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
