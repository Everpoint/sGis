import {TileScheme} from "./TileScheme";
import {Layer, LayerConstructorParams, PropertyChangeEvent} from "./Layer";
import {webMercator, Crs} from "./Crs";
import {Feature} from "./features/Feature";
import {Bbox} from "./Bbox";
import {ImageFeature} from "./features/ImageFeature";
import {Point} from "./Point";
import {ImageSymbol} from "./symbols/Image";
import {ImageRender} from "./renders/Image";

export interface TileLayerConstructorParams extends LayerConstructorParams {
    /** @see [[TileLayer.tileScheme]] */
    tileScheme?: TileScheme,
    /** @see [[TileLayer.crs]] */
    crs?: Crs,
    /** @see [[TileLayer.cycleX]] */
    cycleX?: boolean,
    /** @see [[TileLayer.cycleY]] */
    cycleY?: boolean,

    /**
     * Size of feature cache of the tile layer.
     */
    cacheSize?: number,

    /** @see [[TileLayer.transitionTime]] */
    transitionTime?: number
}

/**
 * A layer that is drawn as a set of tile images received from server. The layer calculates tile indexes (x, y, z)
 * according to the tile scheme and requested resolution, then inserts them into url mask and creates ImageFeatures
 * for each tile. The features are cached by the layer to prevent unnecessary recalculations and garbage collection.
 * @alias sGis.TileLayer
 */
export class TileLayer extends Layer {
    private _symbol: ImageSymbol;
    private readonly _tileCache: {[key: string]: ImageFeature} = {};
    private readonly _urlMask: string;
    private readonly _cacheSize: number;
    private _transitionTime: number;

    /** Layer's tile scheme. */
    readonly tileScheme: TileScheme;

    /** Layer's coordinate system. */
    readonly crs: Crs;

    /** Whether to repeat the tiles along x axis. Creates the effect of continuous map when panning horizontally. */
    cycleX: boolean;

    /** Whether to repeat the tiles along y axis. Creates the effect of continuous map when panning vertically. */
    cycleY: boolean;

    /**
     * @param urlMask - url of the source for tiles in format http(s)://...../..{x}..{y}..{z} - where x an y are indexes of tiles for the scale level z
     * @param __namedParameters - properties to be set to the corresponding fields
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance
     */
    constructor(urlMask, {
        tileScheme = TileScheme.default,
        crs = webMercator,
        cycleX = true,
        cycleY = false,
        cacheSize = 256,
        transitionTime = 200,
        ...LayerParams
    }: TileLayerConstructorParams = {}, extensions?: Object) {
        super(LayerParams, extensions);

        this._urlMask = urlMask;
        this.tileScheme = tileScheme;
        this.crs = crs;
        this.cycleX = cycleX;
        this.cycleY = cycleY;
        this._cacheSize = cacheSize;
        this._transitionTime = transitionTime;

        this._updateSymbol();
    }

    /**
     * Returns url of a tile.
     * @param xIndex - index of tile along x axis.
     * @param yIndex - index of tile along y axis.
     * @param level - scale level of the tile.
     */
    getTileUrl(xIndex: number, yIndex: number, level: number): string {
        return this._urlMask.replace('{x}', xIndex.toString())
            .replace('{y}', yIndex.toString())
            .replace('{z}', level.toString());
    }

    getFeatures(bbox: Bbox, resolution: number): Feature[] {
        if (!this.crs.canProjectTo(bbox.crs)) return [];
        if (!this.checkVisibility(resolution)) return [];

        let level = this.tileScheme.getLevel(resolution);
        if (level < 0) return [];

        let trimmedBbox = this._getTrimmedBbox(bbox.projectTo(this.crs));
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

        let tiles = this._tileCache;
        let features = [];
        for (let xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
            let xIndexAdj = this.cycleX ? this._getAdjustedIndex(xIndex, level) : xIndex;

            for (let yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                let yIndexAdj = this.cycleY ? this._getAdjustedIndex(yIndex, level) : yIndex;
                let tileId = TileLayer._getTileId(this.tileScheme.levels[level].zIndex, xIndex, yIndex);

                if (!tiles[tileId]) {
                    let imageBbox = this._getTileBbox(level, xIndex, yIndex);
                    let tileUrl = this.getTileUrl(xIndexAdj, yIndexAdj, this.tileScheme.levels[level].zIndex);
                    tiles[tileId] = new ImageFeature(imageBbox, { src: tileUrl, symbol: this._symbol, crs: this.crs });
                }

                features.push(tiles[tileId]);
            }
        }

        this._cutCache();
        return features;
    }

    private _getTileBbox(level: number, xIndex: number, yIndex: number): Bbox {
        let resolution = this.tileScheme.levels[level].resolution;

        let minY = this.tileScheme.reversedY ? yIndex * this.tileHeight * resolution + this.tileScheme.origin[1] : -(yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1];
        let startPoint = new Point([xIndex * this.tileWidth * resolution + this.tileScheme.origin[0], minY], this.crs);

        let maxY = this.tileScheme.reversedY ? (yIndex + 1) * this.tileHeight * resolution + this.tileScheme.origin[1] : -yIndex * this.tileHeight * resolution + this.tileScheme.origin[1];
        let endPoint = new Point([(xIndex + 1) * this.tileWidth * resolution + this.tileScheme.origin[0], maxY], this.crs);

        return new Bbox(startPoint.position, endPoint.position, this.crs);
    }

    private static _getTileId(level: number, xIndex: number, yIndex: number): string {
        return [level, xIndex, yIndex].join(',');
    }

    _getAdjustedIndex(index: number, level: number): number {
        let desc = this.tileScheme.levels[level];
        if (!desc.indexCount || desc.indexCount <= 0 || (index >= 0 && index < desc.indexCount)) return index;
        while (index < 0) index += desc.indexCount;
        return index % desc.indexCount;
    }

    _cutCache(): void {
        let keys = Object.keys(this._tileCache);
        if (keys.length > this._cacheSize) {
            let forDeletion = keys.slice(0, keys.length - this._cacheSize);
            forDeletion.forEach((key) => {
                delete this._tileCache[key];
            });
        }
    }

    /**
     * Width of the tiles in px. Same as tile scheme's tileWidth.
     */
    get tileWidth(): number { return this.tileScheme.tileWidth; }

    /**
     * Height of the tiles in px. Same as tile scheme's tileHeight.
     */
    get tileHeight(): number { return this.tileScheme.tileHeight; }

    get opacity(): number { return this._opacity; }
    set opacity(opacity: number) {
        opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
        this._opacity = opacity;
        if (this._symbol) {
            this._symbol.opacity = opacity;
            this._updateFeatures();
            this.fire(new PropertyChangeEvent('opacity'));
        }
    }

    private _updateSymbol(): void {
        this._symbol = new ImageSymbol({opacity: this.opacity, transitionTime: this.transitionTime})
    }

    /**
     * Opacity transition time in milliseconds with which tiles are added to the map.
     */
    get transitionTime(): number { return this._transitionTime; }
    set transitionTime(time: number) {
        this._transitionTime = time;

        if (this._symbol) {
            this._symbol.transitionTime = time;
            this._updateFeatures();
            this.fire('propertyChange', {property: 'transitionTime'});
        }
    }

    private _updateFeatures(): void {
        if (!this._tileCache) return;

        Object.keys(this._tileCache).forEach(key => {
            let cache = this._tileCache[key].getRenderCache();
            if (!cache || !cache.renders || !cache.renders[0]) return;
            let image = (<ImageRender>cache.renders[0]).getCache();
            if (image) image.style.opacity = this._symbol.opacity.toString();
        });
    }

    private _getTrimmedBbox(bbox: Bbox): Bbox {
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
