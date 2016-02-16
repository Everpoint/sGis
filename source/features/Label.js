(function() {

    var defaultDiv = document.createElement('div');
    defaultDiv.innerHTML = 'New label';
    defaultDiv.style.textAlign = 'center';

    sGis.feature.Label = function(position, options) {
        this.__initialize(options);
        this.coordinates = position;

        this._resetCache();
    };

    sGis.feature.Label.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.label.Label,
        _content: defaultDiv.cloneNode(true),
        _crs: sGis.CRS.geo,
        currentBbox: null,

        _resetCache: function() {
            this.currentBbox = null;
            this._cache = null;
        }
    });

    Object.defineProperties(sGis.feature.Label.prototype, {
        coordinates: {
            get: function() {
                return this._point.getCoordinates();
            },

            set: function(point) {
                if (point instanceof sGis.Point) {
                    this._point = point.projectTo(this._crs);
                } else if (utils.isArray(point)) {
                    this._point = new sGis.Point(point[0], point[1], this._crs);
                } else {
                    utils.error('Coordinates are expected but got ' + point + ' instead');
                }
                this._resetCache();
            }
        },

        point: {
            get: function() {
                return this._point.clone();
            }
        },

        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                if (!(crs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');
                if (this._point) this._point = this._point.projectTo(crs);
                this._crs = crs;
            }
        },

        content: {
            get: function() {
                return this._content;
            },

            set: function(content) {
                if (utils.isString(content)) {
                    var node = document.createTextNode(content);
                    this._content = node;
                } else if (utils.isNode) {
                    this._content = content;
                } else {
                    utils.error('DOM node is expected but got ' + content + ' instead');
                }
                this._resetCache();
            }
        },

        type: {
            value: 'label'
        },

        bbox: {
            get: function() {
                return this.currentBbox || new sGis.Bbox(this._point, this._point);
            }
        }
    });

})();