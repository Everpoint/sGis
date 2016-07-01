sGis.module('feature.Label', [
    'utils',
    'Feature',
    'symbol.label.Label'
], function(utils, Feature, LabelSymbol) {
    'use strict';

    var defaults = {
        _content: '',
        _symbol: new LabelSymbol()
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
         * Position of the label
         * @type {sGis.Point}
         */
        get point() { return this._point; }
        set point(/** sGis.Point */ point) {
            this._point = point.projectTo(this.crs);
            this.redraw();
        }

        /**
         * Position of the label
         * @type {Number[]}
         */
        get coordinates() { return this._point; }
        set coordinates(/** Number[] */ point) {
            this.point = new sGis.Point(point[0], point[1], this.crs);
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
