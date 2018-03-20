import {TileScheme} from "../TileScheme";
import {Layer, LayerConstructorParams} from "./Layer";
import {webMercator, Crs} from "../Crs";
import {Bbox} from "../Bbox";
import {StaticHtmlImageRender} from "../renders/StaticHtmlImageRender";
import {Render} from "../renders/Render";

class TileRender extends StaticHtmlImageRender {
    isComplete: boolean = true;
}

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


export type TileIndex = {
    x: number;
    y: number;
    z: number;
    level: number;
}

/**
 * A layer that is drawn as a set of tile images received from server. The layer calculates tile indexes (x, y, z)
 * according to the tile scheme and requested resolution, then inserts them into url mask and creates ImageFeatures
 * for each tile. The features are cached by the layer to prevent unnecessary recalculations and garbage collection.
 * @alias sGis.TileLayer
 */
export class TileLayer extends Layer {
    private _tileCache: {[key: string]: TileRender} = {};
    private readonly _urlMask: string;
    private readonly _cacheSize: number;
    private _transitionTime: number;
    private _cachedIndexes: string[] = [];

    private _previousTiles: TileRender[] = [];

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
     * @param __namedParameters - properties to be set to the corresponding fields.
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance
     */
    constructor(urlMask, {
        tileScheme = TileScheme.default,
        crs = webMercator,
        cycleX = true,
        cycleY = false,
        cacheSize = 256,
        transitionTime = 500,
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

        this._tileFadeIn = this._tileFadeIn.bind(this);
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

    getRenders(bbox: Bbox, resolution: number): Render[] {
        let indexes = this._getTileIndexes(bbox, resolution);
        let renders: TileRender[] = [];

        let isSetComplete = true;
        for (let index of indexes) {
            let tile = this._getRender(index);
            if (tile.isReady && !tile.error) renders.push(tile);
            if (!tile.error && (!tile.isComplete || !tile.isReady)) isSetComplete = false;
        }

        if (isSetComplete) {
            this._previousTiles = [];
        } else {
            this._previousTiles.forEach(tile => {
                if (renders.indexOf(tile) < 0) renders.push(tile);
            });
        }

        this._previousTiles = renders;

        return renders;
    }

    private _getRender(index: TileIndex): TileRender {
        let tileId = TileLayer._getTileId(index.z, index.x, index.y);
        if (this._tileCache[tileId]) return this._tileCache[tileId];

        let adjX = this.cycleX ? this._getAdjustedIndex(index.x, index.level) : index.x;
        let adjY = this.cycleY ? this._getAdjustedIndex(index.y, index.level) : index.y;

        let bbox = this._getTileBbox(index);
        let tile = new TileRender({
            src: this.getTileUrl(adjX, adjY, index.z),
            width: this.tileWidth,
            height: this.tileHeight,
            bbox,
            onLoad: () => this.redraw()
        });

        this._cacheTile(tileId, tile);

        if (this.transitionTime <= 0) return tile;

        tile.node.style.opacity = '0';
        tile.node.style.transition = `opacity ${this.transitionTime / 1000}s`;
        tile.isComplete = false;

        tile.onDisplayed = () => {
            setTimeout(() => {
                tile.node.style.opacity = this.opacity.toString();
                setTimeout(() => {
                    tile.isComplete = true;
                    this.redraw();
                }, this.transitionTime);
            }, 0);
        };

        tile.onRemoved = () => {
            tile.node.style.opacity = '0';
            tile.isComplete = false;
        };

        return tile;
    }

    private _getTileBbox(index: TileIndex): Bbox {
        let resolution = this.tileScheme.levels[index.level].resolution;
        let width = this.tileWidth * resolution;
        let x = this.tileScheme.origin[0] + index.x * width;

        let height = this.tileHeight * resolution;
        if (!this.tileScheme.reversedY) height *= -1;
        let yOffset = index.y * height;
        let y = this.tileScheme.origin[1] + yOffset;

        return new Bbox([x, y], [x + width, y + height], this.crs);
    }

    private _cacheTile(id: string, tile: TileRender) {
        if (this._tileCache[id]) return;
        this._tileCache[id] = tile;
        this._cachedIndexes.push(id);

        if (this._cachedIndexes.length > this._cacheSize) {
            delete this._tileCache[this._cachedIndexes.shift()];
        }
    }

    private _getTileIndexes(bbox: Bbox, resolution: number): TileIndex[] {
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
            yStartIndex = Math.floor((trimmedBbox.yMin - this.tileScheme.origin[1]) / this.tileHeight / layerResolution);
            yEndIndex = Math.ceil((trimmedBbox.yMax - this.tileScheme.origin[1])/ this.tileHeight / layerResolution);
        } else {
            yStartIndex = Math.floor((this.tileScheme.origin[1] - trimmedBbox.yMax) / this.tileHeight / layerResolution);
            yEndIndex = Math.ceil((this.tileScheme.origin[1] - trimmedBbox.yMin) / this.tileHeight / layerResolution);
        }

        let indexes: TileIndex[] = [];
        for (let xIndex = xStartIndex; xIndex < xEndIndex; xIndex++) {
            for (let yIndex = yStartIndex; yIndex < yEndIndex; yIndex++) {
                indexes.push({x: xIndex, y: yIndex, z: this.tileScheme.levels[level].zIndex, level: level});
            }
        }
        return indexes;
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
        this._opacity = opacity;

        for (let tileId of Object.keys(this._tileCache)) {
            if (this._tileCache[tileId].isReady) this._tileCache[tileId].node.style.opacity = opacity.toString();
        }

        this.redraw();
    }

    clearCache(): void {
        this._tileCache = {};
        this._cachedIndexes = [];
        this._previousTiles = []
    }

    /**
     * Opacity transition time in milliseconds with which tiles are added to the map.
     */
    get transitionTime(): number { return this._transitionTime; }
    set transitionTime(time: number) {
        this._transitionTime = time;
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

    private _tileFadeIn(image: HTMLImageElement) {
        if (this._transitionTime <= 0) return;
        image.style.transition = 'opacity ' + this.transitionTime / 1000 + 's linear';
        image.style.opacity = this.opacity.toString();
    }
}
