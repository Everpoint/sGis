'use strict';

(function() {

    var standardTileScheme = (function() {
        var scheme = {
            tileWidth: 256,
            tileHeight: 256,
            dpi: 96,
            origin: {
                x: -20037508.342787,
                y: 20037508.342787
            },
            matrix: {
                '0': {
                    resolution: 156543.03392800014,
                    scale: 591657527.591555
                }
            }
        };

        for (var i = 1; i < 18; i ++) {
            scheme.matrix[i] = {
                resolution: scheme.matrix[i-1].resolution / 2,
                scale: scheme.matrix[i-1].scale / 2
            };
        }

        return scheme;
    })();


    sGis.TileLayer = function(tileSource, options) {
        if (!tileSource || !utils.isString(tileSource)) utils.error('URL string is expected but got ' + tileSource + ' instead');
        this.__initialize();
        utils.init(this, options);

        this._source = tileSource;
        this._tiles = [];
        this._cache = [];
    };

    sGis.TileLayer.prototype = new sGis.Layer({
        _tileScheme: standardTileScheme,
        _crs: sGis.CRS.webMercator,
        _cycleX: true,
        _cycleY: false,
        _cacheSize: 256,
        _transitionTime: sGis.browser.indexOf('Chrome') === 0 ? 0 : 200,

        getTileUrl: function(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        },

        getFeatures: function(bbox, resolution) {
            if (!(bbox instanceof sGis.Bbox)) utils.error('sGis.Bbox instance is expected but got ' + bbox + ' instead');
            if (!resolution) utils.error('Obligatory parameter resolution is omitted');

            if (!this._display || bbox.p[0].crs !== this.crs && (!bbox.p[0].crs.from || !this.crs.from)) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var scale = getScaleLevel(this, resolution);
            if (scale < 0) return [];
            var baseBbox = {
                    minX: this._tileScheme.origin.x,
                    maxY: this._tileScheme.origin.y,
                    maxX: this._tileScheme.origin.x + this._tileScheme.tileWidth * this._tileScheme.matrix[0].resolution,
                    minY: this._tileScheme.origin.y - this._tileScheme.tileHeight * this._tileScheme.matrix[0].resolution
                };

            var tiles = this._tiles,
                layerCrs = this.crs,
                features = [],
                scaleAdj = bbox.p[0].crs.from ? Math.round(standardTileScheme.matrix[0].resolution / this._tileScheme.matrix[scale].resolution) : 2 << (scale - 1);

            bbox = bbox.projectTo(layerCrs);

            var layerResolution = getResolution(this, scale),
                xStartIndex = Math.floor((bbox.p[0].x - baseBbox.minX) / this.tileWidth / layerResolution),
                xEndIndex = Math.ceil((bbox.p[1].x - baseBbox.minX) / this.tileWidth / layerResolution),
                yStartIndex = Math.floor((baseBbox.maxY - bbox.p[1].y) / this.tileHeight / layerResolution),
                yEndIndex = Math.ceil((baseBbox.maxY - bbox.p[0].y) / this.tileHeight / layerResolution);

            if (!tiles[scale]) tiles[scale] = [];

            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = xIndex;
                if (this._cycleX && xIndexAdj < 0) xIndexAdj = scaleAdj === 0 ? 0 : xIndexAdj % scaleAdj + scaleAdj;
                if (this._cycleX && xIndexAdj >= scaleAdj) xIndexAdj = scaleAdj === 0 ? 0 : xIndexAdj % scaleAdj;

                if (!tiles[scale][xIndex]) tiles[scale][xIndex] = [];

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj= yIndex;
                    if (this._cycleY && yIndexAdj < 0) yIndexAdj = scaleAdj === 0 ? 0 : yIndexAdj % scaleAdj + scaleAdj;
                    if (this._cycleY && yIndexAdj >= scaleAdj) yIndexAdj = scaleAdj === 0 ? 0 : yIndexAdj % scaleAdj;

                    if (!tiles[scale][xIndex][yIndex]) {
                        var imageBbox = getTileBoundingBox(scale, xIndex, yIndex, this);
                        var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, scale);
                        tiles[scale][xIndex][yIndex] = new sGis.feature.Image(imageBbox, { src: tileUrl, style: { transitionTime: this._transitionTime, renderToCanvas: false }, opacity: this.opacity });
                        this._cache.push(scale + ',' + xIndex + ',' + yIndex);
                    }
                    features.push(tiles[scale][xIndex][yIndex]);

                }
            }

            this._cutCache();
            return features;
        },

        getObjectType: function() {
            return 'img';
        },

        _cutCache: function() {
            while (this._cache.length > this._cacheSize) {
                var indexes = this._cache[0].split(',');
                delete this._tiles[indexes[0]][indexes[1]][indexes[2]];
                this._cache.shift();
            }
        }
    });

    Object.defineProperties(sGis.TileLayer.prototype, {
        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                if (!(crs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');
                this._crs = crs;
            }
        },

        tileWidth: {
            get: function() {
                return this._tileScheme.tileWidth;
            }
        },

        tileHeight: {
            get: function() {
                return this._tileScheme.tileHeight;
            }
        },

        tileScheme: {
            get: function() {
                return this._tileScheme;
            },

            set: function(scheme) {
                if (!(scheme instanceof Object)) utils.error('Object is expected but got ' + scheme + ' instead');
                this._tileScheme = scheme;
            }
        },

        cycleX: {
            get: function() {
                return this._cycleX;
            },
            set: function(bool) {
                this._cycleX = bool;
            }
        },

        cycleY: {
            get: function() {
                return this._cycleY;
            },
            set: function(bool) {
                this._cycleY = bool;
            }
        },

        transitionTime: {
            get: function() {
                return this._transitionTime;
            },
            set: function(time) {
                this._transitionTime = time;
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

                for (var scale in this._tiles) {
                    for (var x in this._tiles[scale]) {
                        for (var y in this._tiles[scale][x]) {
                            this._tiles[scale][x][y].opacity = opacity;
                        }
                    }
                }
                this.fire('propertyChange', {property: 'opacity'});
            }
        }
    });

    function getScaleLevel(layer, resolution) {
        for (var i in layer._tileScheme.matrix) {
            if (resolution > layer._tileScheme.matrix[i].resolution && !utils.softEquals(resolution, layer._tileScheme.matrix[i].resolution)) {
                if (i == 0 && resolution / layer._tileScheme.matrix[0].resolution > 2) return -1;
                return i === "0" ? 0 : i - 1;
            }
        }

        if (i == 0 && layer._tileScheme.matrix[0].resolution / resolution > 2) return -1;

        return i;
    }

    function getResolution(layer, scale) {
        return layer._tileScheme.matrix[scale].resolution;
    };

    function getTileId(x, y, scale) {
        return scale + '/' + x + '/' + y;
    }

    function getTileBoundingBox(scale, xIndex, yIndex, layer) {
        var resolution = getResolution(layer, scale),
            startPoint = new sGis.Point(xIndex * layer.tileWidth * resolution + layer.tileScheme.origin.x, -(yIndex + 1) * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs),
            endPoint = new sGis.Point((xIndex + 1) * layer.tileWidth * resolution + layer.tileScheme.origin.x, -yIndex * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs);

        return new sGis.Bbox(startPoint, endPoint);
    }

})();