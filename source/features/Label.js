sGis.module('feature.Label', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.label'
], function(utils, Feature, Crs, Point, Bbox, labelSymbols) {
    'use strict';

    var defaultDiv = document.createElement('div');
    defaultDiv.innerHTML = 'New label';
    defaultDiv.style.textAlign = 'center';

    var Label = function(position, options) {
        this.__initialize(options);
        this.coordinates = position;

        this._resetCache();
    };

    Label.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.label.Label,
        _content: '',
        _crs: sGis.CRS.geo,
        currentBbox: null,

        _resetCache: function() {
            this.currentBbox = null;
            this._cache = null;
        }
    });

    Object.defineProperties(Label.prototype, {
        coordinates: {
            get: function() {
                return this._point.getCoordinates();
            },

            set: function(point) {
                if (point instanceof sGis.Point) {
                    this._point = point.projectTo(this._crs);
                } else if (sGis.utils.isArray(point)) {
                    this._point = new sGis.Point(point[0], point[1], this._crs);
                } else {
                    sGis.utils.error('Coordinates are expected but got ' + point + ' instead');
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
                if (!(crs instanceof sGis.Crs)) sGis.utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');
                if (this._point) this._point = this._point.projectTo(crs);
                this._crs = crs;
            }
        },

        content: {
            get: function() {
                return this._content;
            },

            set: function(content) {
                this._content = content;
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

    return Label;
    
})
