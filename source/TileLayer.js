(function() {

    'use strict';

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

    var defaults = {
        tileScheme: standardTileScheme,
        crs: sGis.CRS.webMercator,
        cycleX: true,
        cycleY: false,
        _cacheSize: 256,
        transitionTime: sGis.browser.indexOf('Chrome') === 0 ? 0 : 200
    };

    class TileLayer extends sGis.Layer {
        constructor(tileSource, options) {
            if (!tileSource || !sGis.utils.isString(tileSource)) sGis.utils.error('URL string is expected but got ' + tileSource + ' instead');
            super();

            sGis.utils.init(this, options);

            this._source = tileSource;
            this._tiles = [];
            this._cache = [];
        }

        getTileUrl(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        }

        getFeatures(bbox, resolution) {
            if (!(bbox instanceof sGis.Bbox)) sGis.utils.error('sGis.Bbox instance is expected but got ' + bbox + ' instead');
            if (!resolution) sGis.utils.error('Obligatory parameter resolution is omitted');

            if (!this._display || bbox.p[0].crs !== this.crs && (!bbox.p[0].crs.from || !this.crs.from)) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var scale = getScaleLevel(this, resolution);
            if (scale < 0) return [];
            var baseBbox = {
                minX: this.tileScheme.origin.x,
                maxY: this.tileScheme.origin.y,
                maxX: this.tileScheme.origin.x + this.tileScheme.tileWidth * this.tileScheme.matrix[0].resolution,
                minY: this.tileScheme.origin.y - this.tileScheme.tileHeight * this.tileScheme.matrix[0].resolution
            };

            var tiles = this._tiles,
                layerCrs = this.crs,
                features = [],
                scaleAdj = bbox.p[0].crs.from ? Math.round(standardTileScheme.matrix[0].resolution / this.tileScheme.matrix[scale].resolution) : 2 << (scale - 1);

            bbox = bbox.projectTo(layerCrs);

            var layerResolution = getResolution(this, scale),
                xStartIndex = Math.floor((bbox.p[0].x - baseBbox.minX) / this.tileWidth / layerResolution),
                xEndIndex = Math.ceil((bbox.p[1].x - baseBbox.minX) / this.tileWidth / layerResolution),
                yStartIndex = Math.floor((baseBbox.maxY - bbox.p[1].y) / this.tileHeight / layerResolution),
                yEndIndex = Math.ceil((baseBbox.maxY - bbox.p[0].y) / this.tileHeight / layerResolution);

            if (!tiles[scale]) tiles[scale] = [];

            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = xIndex;
                if (this.cycleX && xIndexAdj < 0) xIndexAdj = scaleAdj === 0 ? 0 : xIndexAdj % scaleAdj + scaleAdj;
                if (this.cycleX && xIndexAdj >= scaleAdj) xIndexAdj = scaleAdj === 0 ? 0 : xIndexAdj % scaleAdj;

                if (!tiles[scale][xIndex]) tiles[scale][xIndex] = [];

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj= yIndex;
                    if (this.cycleY && yIndexAdj < 0) yIndexAdj = scaleAdj === 0 ? 0 : yIndexAdj % scaleAdj + scaleAdj;
                    if (this.cycleY && yIndexAdj >= scaleAdj) yIndexAdj = scaleAdj === 0 ? 0 : yIndexAdj % scaleAdj;

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
        }

        _cutCache() {
            while (this._cache.length > this._cacheSize) {
                var indexes = this._cache[0].split(',');
                delete this._tiles[indexes[0]][indexes[1]][indexes[2]];
                this._cache.shift();
            }
        }

        get tileWidth() { return this.tileScheme.tileWidth; }
        get tileHeight() { return this.tileScheme.tileHeight; }

        get opacity() { return this._opacity; }
        set opacity(opacity) {
            if (!sGis.utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
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

    function getScaleLevel(layer, resolution) {
        for (var i in layer.tileScheme.matrix) {
            if (resolution > layer.tileScheme.matrix[i].resolution && !sGis.utils.softEquals(resolution, layer.tileScheme.matrix[i].resolution)) {
                if (i == 0 && resolution / layer.tileScheme.matrix[0].resolution > 2) return -1;
                return i === "0" ? 0 : i - 1;
            }
        }

        if (i == 0 && layer.tileScheme.matrix[0].resolution / resolution > 2) return -1;

        return i;
    }

    function getResolution(layer, scale) {
        return layer.tileScheme.matrix[scale].resolution;
    }

    function getTileBoundingBox(scale, xIndex, yIndex, layer) {
        var resolution = getResolution(layer, scale),
            startPoint = new sGis.Point(xIndex * layer.tileWidth * resolution + layer.tileScheme.origin.x, -(yIndex + 1) * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs),
            endPoint = new sGis.Point((xIndex + 1) * layer.tileWidth * resolution + layer.tileScheme.origin.x, -yIndex * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs);

        return new sGis.Bbox(startPoint, endPoint);
    }

    sGis.utils.extend(TileLayer.prototype, defaults);

    sGis.TileLayer = TileLayer;

})();