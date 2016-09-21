sGis.module('TileScheme', [
    'utils',
    'math'
], function(utils, math) {

    /**
     * @class
     * @alias sGis.TileScheme
     */
    class TileScheme {
        constructor(parameters = {}) {
            utils.init(this, parameters, true);
        }

        get levels() { return this._levels; }
        set levels(levels) {
            this._levels = levels.sort((a, b) => a.resolution - b.resolution);
        }

        getLevel(resolution) {
            if (!this.levels) utils.error('Tile scheme levels are not set');

            for (var i = 0; i < this.levels.length; i++) {
                if (resolution <= this.levels[i].resolution + math.tolerance) return i;
            }
            return i-1;
        }

        get maxResolution() {
            var maxResolution = 0;
            var levels = Object.keys(this.levels);
            for (var i = 0; i < levels.length; i++) {
                maxResolution = Math.max(maxResolution, this.levels[levels[i]].resolution);
            }
            return maxResolution;
        }

        get minResolution() {
            var minResolution = Infinity;
            var levels = Object.keys(this.levels);
            for (var i = 0; i < levels.length; i++) {
                minResolution = Math.min(minResolution, this.levels[levels[i]].resolution);
            }

            return minResolution;
        }
        
        
    }

    var defaultLevels = [{
        resolution: 156543.03392800014,
        scale: 591657527.591555,
        indexCount: 1
    }];

    for (var i = 1; i < 18; i ++) {
        defaultLevels[i] = {
            resolution: defaultLevels[i-1].resolution / 2,
            scale: defaultLevels[i-1].scale / 2,
            indexCount: defaultLevels[i-1] * 2
        };
    }

    TileScheme.default = new TileScheme({
        tileWidth: 256,
        tileHeight: 256,
        origin: {
            x: -20037508.342787,
            y: 20037508.342787
        },
        levels: defaultLevels
    });

    return TileScheme;

});