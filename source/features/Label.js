sGis.module('feature.Label', [
    'utils',
    'Feature',
    'Point',
    'symbol.label'
], function(utils, Feature, Point, labelSymbols) {
    'use strict';

    var defaults = {
        _content: '',
        _symbol: new labelSymbols.Label()
    };

    /**
     * Text label on the map.
     * @alias sGis.feature.Label
     * @extends sGis.Feature
     */
    class Label extends Feature {
        /**
         * @constructor
         * @param {Number[]|sGis.Point} position - anchor point of the label. Array is in [x,y] format.
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(position, properties) {
            super(properties);
            this.coordinates = position;
        }

        /**
         * Anchor point of the label
         * @type {Number[]|sGis.Point}
         */
        get coordinates() { return this._point; }
        set coordinates(/** Number[]|sGis.Point */ point) {
            if (point instanceof Point) {
                this._point = point.projectTo(this.crs)
            } else {
                this._point = point;
            }
            this.redraw();
        }

        /**
         * Text of the label. Can be any html string.
         * @type String
         */
        get content() { return this._content; }
        set content(/** String */ content) {
            this._content = content;
            this.redraw();
        }
    }
    
    utils.extend(Label.prototype, defaults);

    return Label;
    
});
