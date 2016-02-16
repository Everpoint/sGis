'use strict';

(function() {

    sGis.feature.Image = function(bbox, properties) {
        this.__initialize(properties);
        this.bbox = bbox;
    };

    sGis.feature.Image.prototype = new sGis.Feature({
        _src: null,
        _crs: null,
        _width: 256,
        _height: 256,
        _opacity: 1,
        _defaultSymbol: sGis.symbol.image.Image
    });

    Object.defineProperties(sGis.feature.Image.prototype, {
        type: {
            value: 'image'
        },

        src: {
            get: function() {
                return this._src;
            },
            set: function(source) {
                if (!utils.isString(source) && source !== null) utils.error('String is expected but got ' + source + ' instead');
                if (this._src !== source) {
                    this._src = source;
                    this._cache = null;
                }
            }
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
        },

        crs: {
            get: function() {
                return this._bbox && this._bbox.crs || this._crs;
            },
            set: function(crs) {
                if (this._crs !== crs) {
                    if (this._bbox) {
                        this._bbox.crs = crs;
                    }
                    this._crs = crs;
                    this._cache = null;
                }
            }
        },

        cache: {
            get: function() {
                return this._cache;
            }
        },

        width: {
            get: function() {
                return this._width;
            },
            set: function(width) {
                if (this._width !== width) {
                    this._width = width;
                    this._cache = null;
                }
            }
        },
        height: {
            get: function() {
                return this._height;
            },
            set: function(height) {
                if (this._height !== height) {
                    this._height = height;
                    this._cache = null;
                }
            }
        },
        opacity: {
            get: function() {
                return this._opacity;
            },
            set: function(opacity) {
                if (this._opacity !== opacity) {
                    this._opacity = opacity;
                    if (this._cache && this._cache[0].node) this._cache[0].node.style.opacity = opacity;
                }
            }
        }
    });

})();