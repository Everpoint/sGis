import {error} from "./utils/utils";
import {Coordinates, RectCoordinates} from "./baseTypes";

const TOLERANCE = 0.001;

const defaultLevels: LevelDefinition[] = [{
    resolution: 156543.03392800014,
    indexCount: 1,
    zIndex: 0
}];

for (let i = 1; i < 18; i ++) {
    defaultLevels[i] = {
        resolution: defaultLevels[i-1].resolution / 2,
        indexCount: defaultLevels[i-1].indexCount * 2,
        zIndex: i
    };
}

/**
 * Properties of one level in tile scheme.
 */
export type LevelDefinition = {
    /**
     * Resolution of the level.
     */
    resolution: number,

    /**
     * Index by which the level is referenced. This is usually requested from server as Z coordinate.
     */
    zIndex: number,

    /**
     * Max index of tiles in this level.
     */
    indexCount: number
};

export interface TileSchemeConstructorParams {
    /**
     * The origin of tile indexes for the tile scheme. It means that the tile with index [0, 0] will have this value as it's
     * coordinates.
     */
    origin: Coordinates,

    /**
     * Definition of levels of the tile scheme. Only levels given in this set will be used when rendering tile layer.
     * These values are also used to calculate min and max resolution for tile scheme and indexes of tiles in each
     * level.
     */
    levels: LevelDefinition[]

    /**
     * If set to true, the origin point will be considered to be the bottom left corner and increasing tile indexes increase
     * the value of the Y coordinate. If false, the origin point is top left corner, and increasing tile indexes decrease
     * Y coordinate (tiles go from top to bottom).
     */
    reversedY?: boolean,

    /**
     * Width of a tile in pixels.
     */
    tileWidth?: number,

    /**
     * Height of a tile in pixels.
     */
    tileHeight?: number,

    /**
     * Coordinate limits in which the tile scheme can be applied. It is a rectangle in which the tiles exists and should
     * be calculated and requested. Outside of this boundary tiles considered to be not existent.
     */
    limits?: RectCoordinates,
}

/**
 * Tile scheme used by tile layers to calculate indexes and coordinates of the tiles.
 * @alias sGis.TileScheme
 */
export class TileScheme {
    private _levels: LevelDefinition[];
    private _origin: Coordinates;

    /** @see [[TileSchemeConstructorParams.reversedY]] */
    reversedY: boolean;
    /** @see [[TileSchemeConstructorParams.tileWidth]] */
    tileWidth: number;
    /** @see [[TileSchemeConstructorParams.tileHeight]] */
    tileHeight: number;
    /** @see [[TileSchemeConstructorParams.limits]] */
    readonly limits: RectCoordinates;

    constructor({origin, levels, limits = [-Infinity, -Infinity, Infinity, Infinity], reversedY = false, tileWidth = 256, tileHeight = 256}: TileSchemeConstructorParams) {
        this._levels = levels.sort((a, b) => a.resolution - b.resolution);
        this._origin = origin;

        this.reversedY = reversedY;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.limits = limits;
    }

    /** @see [[TileSchemeConstructorParams.levels]] */
    get levels(): LevelDefinition[] { return this._levels; }

    /**
     * Returns resolution of the closest level in the tile scheme in the given direction. If no such level is found, returns smallest or largest possible resolution.
     * @param resolution - resolution that will be used as a base for search
     * @param direction - if false, will return resolution smaller then given, if true, will return resolution larger then given
     */
    getAdjustedResolution(resolution: number, direction: boolean = false): number {
        return this.levels[this.getLevel(resolution, direction)].resolution;
    }

    /**
     * Returns closest level index in the tile scheme that has resolution in the given direction. If no such level is found, returns the last level index.
     * @param resolution - resolution that will be used as a base for search
     * @param direction - if false, resolution level with smaller resolution will be returned. If true, resolution level with larger resolution will be returned.
     */
    getLevel(resolution: number, direction: boolean = false): number {
        if (!this.levels ||this.levels.length === 0) error('Tile scheme levels are not set');

        let i;
        for (i = 0; i < this.levels.length; i++) {
            if (resolution <= this.levels[i].resolution + TOLERANCE) {
                if (direction) {
                    return i === 0 ? i : i - 1;
                }
                return i;
            }
        }
        return i-1;
    }

    /**
     * Maximum resolution in the scheme
     */
    get maxResolution(): number {
        return this.levels[this.levels.length - 1].resolution;
    }

    /**
     * Minimum resolution in the scheme
     */
    get minResolution(): number {
        return this.levels[0].resolution;
    }

    /** @see [[TileSchemeConstructorParams.origin]] */
    get origin(): Coordinates { return this._origin; }

    /** Default tile scheme used for Mercator projections. */
    static default =  new TileScheme({
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels,
        tileWidth: 256,
        tileHeight: 256,
        reversedY: false,
        limits: [-Infinity, -20037508.342787, Infinity, 20037508.342787]
    });
}

