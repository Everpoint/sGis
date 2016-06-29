sGis.module('feature.Label', [
    'utils',
    'Feature',
    'Crs',
    'Point',
    'Bbox',
    'symbol.label'
], function(utils, Feature, Crs, Point, Bbox, labelSymbols) {
    'use strict';

    var defaults = {
        _content: '',
        _symbol: new labelSymbols.Label()
    };

    class Label extends Feature {
        constructor(position, properties) {
            super(properties);
            this.coordinates = position;
        }
    }
    
    utils.extend(Label.prototype, defaults);

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
            }
        },

        point: {
            get: function() {
                return this._point.clone();
            }
        },

        content: {
            get: function() {
                return this._content;
            },

            set: function(content) {
                this._content = content;
                this.redraw();
            }
        },

        type: {
            value: 'label'
        }
    });

    return Label;
    
});
