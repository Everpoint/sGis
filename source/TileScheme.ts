import {error} from "./utils/utils";
import {ResolutionLimits} from "./baseTypes";

const TOLERANCE = 0.001;

let defaultLevels = [{
    resolution: 156543.03392800014,
    scale: 591657527.591555,
    indexCount: 1,
    zIndex: 0
}];

for (let i = 1; i < 18; i ++) {
    defaultLevels[i] = {
        resolution: defaultLevels[i-1].resolution / 2,
        scale: defaultLevels[i-1].scale / 2,
        indexCount: defaultLevels[i-1].indexCount * 2,
        zIndex: i
    };
}

type LevelDefinition = {
    resolution: number,
    zIndex: number,
    scale?: number,
    indexCount: number
};

/**
 * Tile scheme used by tile layers to calculate indexes and coordinates of the tiles. The properties .levels and .origin must me set to a valid value before tile scheme can be used.
 * @alias sGis.TileScheme
 */
export class TileScheme {
    private _levels: LevelDefinition[];
    private _origin: [number, number];

    reversedY: false;
    tileWidth: number;
    tileHeight: number;
    limits: ResolutionLimits;

    /**
     * @param {Object} parameters - key-value set of properties to be set to the instance
     */
    constructor(parameters = {}) {
        if (parameters) Object.assign(this, parameters);
    }

    /**
     * Array of level definitions of the tile scheme
     */
    get levels() { return this._levels; }
    set levels(levels) {
        this._levels = levels.sort((a, b) => a.resolution - b.resolution);
    }

    /**
     * Returns resolution of the closest level in the tile scheme in the given direction. If no such level is found, returns smallest or largest possible resolution.
     * @param {Number} resolution - resolution that will be used as a base for search
     * @param {Boolean} [direction=false] - if false, will return resolution smaller then given, if true, will return resolution larger then given
     * @returns {Number}
     */
    getAdjustedResolution(resolution, direction = false) {
        return this.levels[this.getLevel(resolution, direction)].resolution;
    }

    /**
     * Returns closest level index in the tile scheme that has resolution in the given direction. If no such level is found, returns the last level index.
     * @param {Number} resolution - resolution that will be used as a base for search
     * @param {Boolean} [direction=false] - if false, resolution level with smaller resolution will be returned. If true, resolution level with larger resolution will be returned.
     * @returns {Number}
     */
    getLevel(resolution, direction = false) {
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
     * Returns maximum resolution in the scheme
     * @returns {Number}
     */
    get maxResolution() {
        return this.levels[this.levels.length - 1].resolution;
    }

    /**
     * Returns minimum resolution in the scheme
     * @return {Number}
     */
    get minResolution() {
        return this.levels[0].resolution;
    }

    /**
     * Left top coordinate of the tile scheme. Used as a base for tile coordinates calculation.
     * @type {Position}
     */
    get origin() { return this._origin; }
    set origin(/** Position */ origin) { this._origin = origin; }

    /** Default tile scheme used for Mercator projections. */
    static default =  new TileScheme({
        tileWidth: 256,
        tileHeight: 256,
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels,
        reversedY: false,
        limits: [-Infinity, -20037508.342787, Infinity, 20037508.342787]
    });
}

