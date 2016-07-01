sGis.module('feature.Maptip', [
    'utils',
    'Feature',
    'Point',
    'symbol.maptip.Simple'
], function(utils, Feature, Point, MaptipSymbol) {

    'use strict';

    var defaults = {
        _content: '',
        _symbol: new MaptipSymbol()
    };

    /**
     * @alias sGis.feature.Maptip
     * @extends sGis.Feature
     */
    class Maptip extends Feature {
        constructor(position, properties) {
            super(properties);
            this.position = position;
        }
    }

    utils.extend(Maptip.prototype, defaults);

    Object.defineProperties(Maptip.prototype, {
        position: {
            get: function() {
                return this._position.clone();
            },
            set: function(position) {
                if (position instanceof sGis.Point) {
                    this._position = position.projectTo(this._crs);
                } else if (sGis.utils.isArray(position) && sGis.utils.isNumber(position[0]) && sGis.utils.isNumber(position[1])) {
                    this._position = new sGis.Point(position[0], position[1], this._crs);
                } else {
                    sGis.utils.error('Point is expected but got ' + position + ' instead');
                }

                this.redraw();
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
            get: function() {
                return 'maptip';
            }
        }
    });

    return Maptip;

});
