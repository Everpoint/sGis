sGis.module('TileLayer', [
    'utils',
    'TileScheme',
    'Layer',
    'Point',
    'Bbox',
    'feature.Image'
], function(utils, TileScheme, Layer, Point, Bbox, Image) {
    'use strict';

    var defaults = {
        tileScheme: TileScheme.default,
        crs: sGis.CRS.webMercator,
        cycleX: true,
        cycleY: false,
        _cacheSize: 256,
        transitionTime: sGis.browser.indexOf('Chrome') === 0 ? 0 : 200
    };

    class TileLayer extends Layer {
        constructor(tileSource, options) {
            super();
            utils.init(this, options);

            this._source = tileSource;
            this._tiles = [];
            this._cache = [];
        }

        getTileUrl(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        }

        getFeatures(bbox, resolution) {
            if (!this._display || !bbox.crs.projectionTo(this.crs)) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var level = this.tileScheme.getLevel(resolution);
            if (level < 0) return [];

            var tiles = this._tiles,
                layerCrs = this.crs,
                features = [];

            bbox = bbox.projectTo(layerCrs);

            var layerResolution = this.tileScheme.levels[level].resolution,
                xStartIndex = Math.floor((bbox.p[0].x - this.tileScheme.origin.x) / this.tileWidth / layerResolution),
                xEndIndex = Math.ceil((bbox.p[1].x - this.tileScheme.origin.x) / this.tileWidth / layerResolution),
                yStartIndex = Math.floor((this.tileScheme.origin.y - bbox.p[1].y) / this.tileHeight / layerResolution),
                yEndIndex = Math.ceil((this.tileScheme.origin.y - bbox.p[0].y) / this.tileHeight / layerResolution);

            if (!tiles[level]) tiles[level] = {};

            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

                if (!tiles[level][xIndex]) tiles[level][xIndex] = [];

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;

                    if (!tiles[level][xIndex][yIndex]) {
                        var imageBbox = getTileBoundingBox(level, xIndex, yIndex, this);
                        var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, level);
                        tiles[level][xIndex][yIndex] = new sGis.feature.Image(imageBbox, { src: tileUrl, style: { transitionTime: this._transitionTime, renderToCanvas: false }, opacity: this.opacity });
                        this._cache.push(level + ',' + xIndex + ',' + yIndex);
                    }

                    features.push(tiles[level][xIndex][yIndex]);
                }
            }

            this._cutCache();
            return features;
        }

        _getAdjustedIndex(index, level) {
            var desc = this.tileScheme.levels[level];
            if (!desc.indexCount || desc.indexCount <= 0 || (index >= 0 && index < desc.indexCount)) return index;
            while (index < 0) index += desc.indexCount;
            return index % desc.indexCount;
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

    function getResolution(layer, scale) {
        return layer.tileScheme.levels[scale].resolution;
    }

    function getTileBoundingBox(scale, xIndex, yIndex, layer) {
        var resolution = getResolution(layer, scale),
            startPoint = new sGis.Point(xIndex * layer.tileWidth * resolution + layer.tileScheme.origin.x, -(yIndex + 1) * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs),
            endPoint = new sGis.Point((xIndex + 1) * layer.tileWidth * resolution + layer.tileScheme.origin.x, -yIndex * layer.tileHeight * resolution + layer.tileScheme.origin.y, layer.crs);

        return new sGis.Bbox(startPoint, endPoint);
    }

    sGis.utils.extend(TileLayer.prototype, defaults);

    return TileLayer;

});
