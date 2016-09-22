sGis.module('TileLayer', [
    'utils',
    'TileScheme',
    'Layer',
    'Point',
    'Bbox',
    'feature.Image',
    'CRS',
    'symbol.image.Image'
], function(utils, TileScheme, Layer, Point, Bbox, ImageF, CRS, ImageSymbol) {
    'use strict';

    var defaults = {
        /**
         * Layer's tile scheme.
         * @type sGis.TileScheme
         * @memberof sGis.TileLayer
         * @default sGis.TileScheme.default
         */
        tileScheme: TileScheme.default,
        /**
         * Layer's coordinate system.
         * @type sGis.Crs
         * @memberof sGis.TileLayer.
         * @default sGis.CRS.webMercator
         */
        crs: CRS.webMercator,
        /**
         * Whether to repeat the tiles along x axis. Creates the effect of continuous map when sliding horizontally.
         * @type boolean
         * @memberof sGis.TileLayer
         * @default
         */
        cycleX: true,
        /**
         * Whether to repeat the tiles along y axis. Creates the effect of continuous map when sliding vertically.
         * @type boolean
         * @memberof sGis.TileLayer
         * @default
         */
        cycleY: false,
        /**
         * If this value is grater then 0, the tiles will appear with css opacity transition effect. Specified in milliseconds.
         * @type number
         * @memberof sGis.TileLayer
         * @default
         */
        _transitionTime: 200,
        _cacheSize: 256
    };

    /**
     * @alias sGis.TileLayer
     * @extends sGis.Layer
     */
    class TileLayer extends Layer {
        /**
         * @constructor
         * @param {String} tileSource - Url of the source for tiles in format http(s)://...../..{x}..{y}..{z} - where x an y are indexes of tiles for the scale level z
         * @param {Object} [options] - Set of properties to override
         */
        constructor(tileSource, options) {
            super(options);
            this._updateSymbol();

            this._source = tileSource;
            this._tiles = {};
        }

        /**
         * Returns url of a tile
         * @param {Number} xIndex - Index of tile along x axis
         * @param {Number} yIndex - Index of tile along y axis
         * @param {Number} scale - Scale level of the tile
         * @returns {string}
         */
        getTileUrl(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];

            let ownCrs = this.crs || bbox.crs;
            var level = this.tileScheme.getLevel(resolution);
            if (level < 0) return [];

            bbox = bbox.projectTo(ownCrs);

            var layerResolution = this.tileScheme.levels[level].resolution;
            if (layerResolution * 2 < resolution) return [];
            
            var xStartIndex = Math.floor((bbox.p[0].x - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
            var xEndIndex = Math.ceil((bbox.p[1].x - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
            var yStartIndex = Math.floor((this.tileScheme.origin[1] - bbox.p[1].y) / this.tileHeight / layerResolution);
            var yEndIndex = Math.ceil((this.tileScheme.origin[1] - bbox.p[0].y) / this.tileHeight / layerResolution);

            var tiles = this._tiles;
            var features = [];
            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                    var tileId = TileLayer.getTileId(this.tileScheme.levels[level].zIndex, xIndex, yIndex);

                    if (!tiles[tileId]) {
                        var imageBbox = this._getTileBbox(level, xIndex, yIndex);
                        var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, this.tileScheme.levels[level].zIndex);
                        tiles[tileId] = new ImageF(imageBbox, { src: tileUrl, symbol: this._symbol, crs: this.crs });
                    }

                    features.push(tiles[tileId]);
                }
            }

            this._cutCache();
            return features;
        }

        _getTileBbox(level, xIndex, yIndex) {
            var resolution = this.tileScheme.levels[level].resolution;
            var startPoint = new Point([xIndex * this.tileWidth * resolution + this.tileScheme.origin[0], -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1]], this.crs);
            var endPoint = new Point([(xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin[0], -yIndex * this.tileHeight * resolution + this.tileScheme.origin[1]], this.crs);

            return new Bbox(startPoint.position, endPoint.position, this.crs);
        }

        static getTileId(level, xIndex, yIndex) {
            return [level, xIndex, yIndex].join(',');
        }

        _getAdjustedIndex(index, level) {
            var desc = this.tileScheme.levels[level];
            if (!desc.indexCount || desc.indexCount <= 0 || (index >= 0 && index < desc.indexCount)) return index;
            while (index < 0) index += desc.indexCount;
            return index % desc.indexCount;
        }

        _cutCache() {
            var keys = Object.keys(this._tiles);
            if (keys.length > this._cacheSize) {
                var forDeletion = keys.slice(0, keys.length - this._cacheSize);
                forDeletion.forEach((key) => {
                    delete this._tiles[key];
                });
            }
        }

        /**
         * Width of the tiles in px
         * @type {number}
         */
        get tileWidth() { return this.tileScheme.tileWidth; }

        /**
         * Height of the tiles in px
         * @type {number}
         */
        get tileHeight() { return this.tileScheme.tileHeight; }

        get opacity() { return this._opacity; }
        set opacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this._symbol.opacity = opacity;

            this._updateFeatures();

            this.fire('propertyChange', {property: 'opacity'});
        }

        _updateSymbol() {
            this._symbol = new ImageSymbol({opacity: this.opacity, transitionTime: this.transitionTime})
        }

        /**
         * Time of fade in animation for the tiles
         * @type {Number}
         * @default 200
         */
        get transitionTime() { return this._transitionTime; }
        set transitionTime(/** Number */ time) {
            this._transitionTime = this._symbol.transitionTime = time;
            this._updateFeatures();

            this.fire('propertyChange', {property: 'transitionTime'});
        }

        _clearFeaturesCache() {
            Object.keys(this._tiles).forEach((key) => {
                this._tiles[key].redraw();
            });
        }

        _updateFeatures() {
            Object.keys(this._tiles).forEach(key => {
                let cache = this._tiles[key].getRenderCache();
                if (!cache || !cache.renders || !cache.renders[0]) return;
                let image = cache.renders[0].getCache();
                if (image) image.style.opacity = this._symbol.opacity;
            });
        }
    }

    utils.extend(TileLayer.prototype, defaults);

    return TileLayer;

});
