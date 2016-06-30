sGis.module('TileLayer', [
    'utils',
    'TileScheme',
    'Layer',
    'Point',
    'Bbox',
    'feature.Image',
    'CRS'
], function(utils, TileScheme, Layer, Point, Bbox, ImageF, CRS) {
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
        transitionTime: 200,
        _cacheSize: 256
    };

    /**
     * @class
     * @alias sGis.TileLayer
     * @extends sGis.Layer
     * @extends sGis.IEventHandler
     */
    class TileLayer extends Layer {
        /**
         * @constructor
         * @param {String} tileSource - Url of the source for tiles in format http(s)://...../..{x}..{y}..{z} - where x an y are indexes of tiles for the scale level z
         * @param {Object} [options] - Set of properties to override
         */
        constructor(tileSource, options) {
            super();
            utils.init(this, options);

            this._source = tileSource;
            this._tiles = {};
            this._setSymbol();
        }

        /**
         * Returns url of a tile
         * @param {Number} xIndex - Index of tile along x axis
         * @param {Number} yIndex - Index of tile along y axis
         * @param {Scale} scale - Scale level of the tile
         * @returns {string}
         */
        getTileUrl(xIndex, yIndex, scale) {
            var url = this._source;
            return url.replace('{x}', xIndex).replace('{y}', yIndex).replace('{z}', scale);
        }

        /**
         * Returns the set of tile features for the given bbox.
         * @param {sGis.Bbox} bbox - Bounding box of the area, which should be fully covered by returned tiles.
         * @param {Number} resolution - Resolution of tiles to get.
         * @returns {sGis.Feature[]}
         */
        getFeatures(bbox, resolution) {
            if (!this._display || !bbox.crs.projectionTo(this.crs)) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var level = this.tileScheme.getLevel(resolution);
            if (level < 0) return [];

            bbox = bbox.projectTo(this.crs);

            var layerResolution = this.tileScheme.levels[level].resolution;
            var xStartIndex = Math.floor((bbox.p[0].x - this.tileScheme.origin.x) / this.tileWidth / layerResolution);
            var xEndIndex = Math.ceil((bbox.p[1].x - this.tileScheme.origin.x) / this.tileWidth / layerResolution);
            var yStartIndex = Math.floor((this.tileScheme.origin.y - bbox.p[1].y) / this.tileHeight / layerResolution);
            var yEndIndex = Math.ceil((this.tileScheme.origin.y - bbox.p[0].y) / this.tileHeight / layerResolution);

            var tiles = this._tiles;
            var features = [];
            for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
                var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

                for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                    var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                    var tileId = TileLayer.getTileId(level, xIndex, yIndex);

                    if (!tiles[tileId]) {
                        var imageBbox = this._getTileBbox(level, xIndex, yIndex);
                        var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, level);
                        tiles[tileId] = new ImageF(imageBbox, { src: tileUrl, symbol: this._symbol });
                    }

                    features.push(tiles[tileId]);
                }
            }

            this._cutCache();
            return features;
        }

        _getTileBbox(level, xIndex, yIndex) {
            var resolution = this.tileScheme.levels[level].resolution;
            var startPoint = new Point(xIndex * this.tileWidth * resolution + this.tileScheme.origin.x, -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin.y, this.crs);
            var endPoint = new Point((xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin.x, -yIndex * this.tileHeight * resolution + this.tileScheme.origin.y, this.crs);

            return new Bbox(startPoint, endPoint);
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

        /**
         * Opacity of the layer
         * @fires "propertyChange"
         */
        get opacity() { return this._opacity; }
        set opacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;

            Object.keys(this._tiles).forEach((key) => {
                this._tiles[key].opacity = opacity;
            });

            this._setSymbol();

            this.fire('propertyChange', {property: 'opacity'});
        }

        get transitionTime() { return this._transitionTime; }
        set transitionTime(time) {
            this._transitionTime = time;
            this._setSymbol();
        }

        _setSymbol() {
            this._symbol = new sGis.symbol.image.Image({transitionTime: this.transitionTime, opacity: this.opacity});
        }
    }

    utils.extend(TileLayer.prototype, defaults);

    return TileLayer;

});
