sGis.module('TileScheme', [
    'utils',
    'math'
], function(utils, math) {

    /**
     * @class
     * @alias sGis.TileScheme
     */
    class TileScheme {
        constructor(parameters) {
            utils.extend(this, parameters);
        }

        getLevel(resolution) {
            if (!this.levels) return -1;
            var keys = Object.keys(this.levels);
            for (var i = 0; i < keys.length; i++) {
                var level = this.levels[keys[i]];
                if (resolution > level.resolution + math.tolerance) {
                    if (keys[i] === '0') {
                        return resolution / level.resolution > 2 ? -1 : 0;
                    }
                    return keys[i] - 1;
                }
            }

            if (this.levels[keys[i-1]].resolution / resolution > 2) return -1;

            return keys[i-1];
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