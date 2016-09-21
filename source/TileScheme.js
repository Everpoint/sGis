sGis.module('TileScheme', [
    'utils',
    'math'
], function(utils, math) {

    /**
     * Tile scheme used by tile layers to calculate indexes and coordinates of the tiles. The properties .levels and .origin must me set to a valid value before tile scheme can be used.
     * @alias sGis.TileScheme
     */
    class TileScheme {
        /**
         * @param {Object} parameters - key-value set of properties to be set to the instance
         */
        constructor(parameters = {}) {
            utils.init(this, parameters, true);
        }

        /**
         * Array of level definitions of the tile scheme
         * @type {sGis.TileScheme.LevelDefinition[]} 
         */
        get levels() { return this._levels; }
        set levels(/** sGis.TileScheme.LevelDefinition[] */ levels) {
            this._levels = levels.sort((a, b) => a.resolution - b.resolution);
        }

        /**
         * Returns resolution of the closest level in the tile scheme that has resolution smaller that the given one. If no such level is found, returns smallest possible resolution.
         * @param {Number} resolution - resolution that will be used as a base for search
         * @returns {Number}
         */
        getAdjustedResolution(resolution) {
            return this.levels[this.getLevel(resolution)].resolution;
        }

        /**
         * Returns closest level index in the tile scheme that has resolution smaller then the given one. If no such level is found, returns the last level index.
         * @param {Number} resolution - resolution that will be used as a base for search
         * @returns {Number}
         */
        getLevel(resolution) {
            if (!this.levels ||this.levels.length === 0) utils.error('Tile scheme levels are not set');

            for (var i = 0; i < this.levels.length; i++) {
                if (resolution <= this.levels[i].resolution + math.tolerance) return i;
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
    }

    var defaultLevels = [{
        resolution: 156543.03392800014,
        scale: 591657527.591555,
        indexCount: 1,
        zIndex: 0
    }];

    for (var i = 1; i < 18; i ++) {
        defaultLevels[i] = {
            resolution: defaultLevels[i-1].resolution / 2,
            scale: defaultLevels[i-1].scale / 2,
            indexCount: defaultLevels[i-1] * 2,
            zIndex: i
        };
    }

    /**
     * Default tile scheme used for Mercator projections.
     * @type {TileScheme}
     */
    TileScheme.default = new TileScheme({
        tileWidth: 256,
        tileHeight: 256,
        origin: [-20037508.342787, 20037508.342787],
        levels: defaultLevels
    });

    return TileScheme;

    /**
     * @typedef {Object} sGis.TileScheme.LevelDefinition
     * @prop {Number} resolution
     * @prop {Number} zIndex
     * @prop {Number} indexCount
     */
    
});