import {TileScheme} from "./TileScheme";
import {Layer} from "./Layer";
import {webMercator} from "./Crs";
import {Feature} from "./features/Feature";
import {Bbox} from "./Bbox";
import {ImageFeature} from "./features/ImageFeature";
import {Point} from "./Point";
import {ImageSymbol} from "./symbols/Image";

/**
 * @alias sGis.TileLayer
 * @extends sGis.Layer
 */
export class TileLayer extends Layer {
    private _symbol: ImageSymbol;
    private _tiles;
    private _source: string;

    _cacheSize = 256;

    /** If this value is grater then 0, the tiles will appear with css opacity transition effect. Specified in milliseconds. */
    _transitionTime = 200;

    /** Layer's tile scheme. */
    tileScheme = TileScheme.default;

    /** Layer's coordinate system. */
    crs = webMercator;

    /** Whether to repeat the tiles along x axis. Creates the effect of continuous map when sliding horizontally. */
    cycleX = true;

    /** Whether to repeat the tiles along y axis. Creates the effect of continuous map when sliding vertically. */
    cycleY: false;

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

    getFeatures(bbox: Bbox, resolution: number): Feature[] {
        let ownCrs = this.crs || bbox.crs;
        if (!ownCrs.canProjectTo(bbox.crs)) return [];
        if (!this.checkVisibility(resolution)) return [];

        let level = this.tileScheme.getLevel(resolution);
        if (level < 0) return [];

        bbox = bbox.projectTo(ownCrs);
        let trimmedBbox = this._getTrimmedBbox(bbox);
        if (trimmedBbox.width === 0 || trimmedBbox.height === 0) return [];

        let layerResolution = this.tileScheme.levels[level].resolution;
        if (layerResolution * 2 < resolution) return [];

        let xStartIndex = Math.floor((trimmedBbox.xMin - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);
        let xEndIndex = Math.ceil((trimmedBbox.xMax - this.tileScheme.origin[0]) / this.tileWidth / layerResolution);

        let yStartIndex, yEndIndex;
        if (this.tileScheme.reversedY) {
            yStartIndex = Math.floor((trimmedBbox.yMin - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
            yEndIndex = Math.ceil((trimmedBbox.yMax - this.tileScheme.origin[0]) / this.tileHeight / layerResolution);
        } else {
            yStartIndex = Math.floor((this.tileScheme.origin[1] - trimmedBbox.yMax) / this.tileHeight / layerResolution);
            yEndIndex = Math.ceil((this.tileScheme.origin[1] - trimmedBbox.yMin) / this.tileHeight / layerResolution);
        }

        let tiles = this._tiles;
        let features = [];
        for (var xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
            var xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

            for (var yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                var yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                var tileId = TileLayer.getTileId(this.tileScheme.levels[level].zIndex, xIndex, yIndex);

                if (!tiles[tileId]) {
                    var imageBbox = this._getTileBbox(level, xIndex, yIndex);
                    var tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, this.tileScheme.levels[level].zIndex);
                    tiles[tileId] = new ImageFeature(imageBbox, { src: tileUrl, symbol: this._symbol, crs: this.crs });
                }

                features.push(tiles[tileId]);
            }
        }

        this._cutCache();
        return features;
    }

    _getTileBbox(level, xIndex, yIndex) {
        let resolution = this.tileScheme.levels[level].resolution;

        let minY = this.tileScheme.reversedY ? yIndex * this.tileHeight * resolution + this.tileScheme.origin[1] : -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1];
        let startPoint = new Point([xIndex * this.tileWidth * resolution + this.tileScheme.origin[0], minY], this.crs);

        let maxY = this.tileScheme.reversedY ? (yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1] : -yIndex * this.tileHeight * resolution + this.tileScheme.origin[1];
        let endPoint = new Point([(xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin[0], maxY], this.crs);

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

    _getTrimmedBbox(bbox) {
        if (!this.tileScheme.limits) return bbox;

        let limits = this.tileScheme.limits;
        let xMin = Math.max(bbox.xMin, limits[0]);
        let yMin = Math.max(bbox.yMin, limits[1]);
        let xMax = Math.min(bbox.xMax, limits[2]);
        let yMax = Math.min(bbox.yMax, limits[3]);

        if (xMax < xMin) xMax = xMin;
        if (yMax < yMin) yMax = yMin;

        return new Bbox([xMin, yMin], [xMax, yMax], bbox.crs);
    }
}
