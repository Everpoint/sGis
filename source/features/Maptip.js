(function() {

    var defaultContent = document.createElement('div');
    defaultContent.innerHTML = 'New maptip';

    sGis.feature.Maptip = function(position, options) {
        this.__initialize(options);
        this.position = position;
    };

    sGis.feature.Maptip.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.maptip.Simple,
        _content: defaultContent,

        clearCache: function() {
            this._cache = null;
        }
    });

    Object.defineProperties(sGis.feature.Maptip.prototype, {
        position: {
            get: function() {
                return this._position.clone();
            },
            set: function(position) {
                if (position instanceof sGis.Point) {
                    this._position = position.projectTo(this._crs);
                } else if (utils.isArray(position) && utils.isNumber(position[0]) && utils.isNumber(position[1])) {
                    this._position = new sGis.Point(position[0], position[1], this._crs);
                } else {
                    utils.error('Point is expected but got ' + position + ' instead');
                }

                this.clearCache();
            }
        },

        content: {
            get: function() {
                return this._content;
            },
            set: function(content) {
                this._content = content;
                this.clearCache();
            }
        },

        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                if (!(crs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');
                this._crs = crs;
                this._point = this._point.projectTo(crs);
                this.clearCache();
            }
        },

        type: {
            get: function() {
                return 'maptip';
            }
        }
    });

})();