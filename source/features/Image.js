sGis.module('feature.Image', [
    'utils',
    'Feature',
    'symbol.image.Image'
], function(utils, Feature, imageSymbols) {

    'use strict';

    var defaults = {
        _src: null,
        _symbol: new imageSymbols.Image()
    };

    /**
     * @alias sGis.feature.Image
     * @extends sGis.Feature
     */
    class ImageF extends Feature {
        /**
         * @constructor
         * @param {sGis.Bbox} bbox - bbox that the image will fit
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(bbox, properties) {
            super(properties);
            this.bbox = bbox;
        }

        /**
         * @override
         * @private
         */
        _needToRender(resolution, crs) {
            return !this.getRenderCache();
        }

        /**
         * Source of the image. Can be html address or data:url string.
         * @type String
         * @default null
         */
        get src() { return this._src; }
        set src(/** String */ src) {
            this._src = src;
            this.redraw();
        }

        /**
         * Bbox that the image will fit
         * @type sGis.Bbox
         */
        get bbox() { return this._bbox; }
        set bbox(/** sGis.Bbox */ bbox) {
            this._bbox = bbox.projectTo(this.crs);
            this.redraw();
        }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Image
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.image.Image()
     */

    utils.extend(ImageF.prototype, defaults);

    return ImageF;

});
