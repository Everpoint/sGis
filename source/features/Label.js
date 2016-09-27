sGis.module('feature.Label', [
    'utils',
    'Feature',
    'symbol.label.Label',
    'Bbox',
    'Point'
], function(utils, Feature, LabelSymbol, Bbox, Point) {
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

        get position() { return this._position; }
        set position(position) {
            this._position = position;
            this.redraw();
        }

        /**
         * Position of the label
         * @type {sGis.Point}
         */
        get point() { return new Point(this.position, this.crs); }
        set point(/** sGis.Point */ point) {
            this.position  = point.projectTo(this.crs).position;
        }

        /**
         * Position of the label
         * @type {Number[]}
         */
        get coordinates() { return this._position.slice(); }
        set coordinates(/** Number[] */ point) {
            this.position = point.slice();
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

        get bbox() {
            return new Bbox(this.position, this.position, this.crs);
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Label
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.label.Label()
     */

    utils.extend(Label.prototype, defaults);

    return Label;

});
