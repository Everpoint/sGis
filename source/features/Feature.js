sGis.module('Feature', [
    'utils',
    'CRS',
    'IEventHandler'
], function(utils, CRS, IEventHandler) {

    'use strict';

    /**
     * @namespace sGis.feature
     */

    var defaults = {
        _crs: CRS.geo,
        _symbol: null,
        _hidden: false
    };

    /**
     * Abstract feature object without any geometry. All other features inherit from this class. It can be used to store attributes in the way compatible with other features.
     * @alias sGis.Feature
     * @mixes sGis.IEventHandler
     */
    class Feature {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties = {}) {
            var copy = utils.extend({}, properties);
            if (copy.crs){
                this._crs = copy.crs;
                delete copy.crs;
            }

            utils.init(this, copy, true);
        }

        /**
         * Renders the feature with the given parameters.
         * @param {Number} resolution
         * @param {sGis.Crs} crs
         * @returns {sGis.IRender[]}
         */
        render(resolution, crs) {
            if (this._hidden || !this.symbol) return [];
            if (!this._needToRender(resolution, crs)) return this._rendered.renders;

            /**
             * @type {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
             * @private
             */
            this._rendered = {
                resolution: resolution,
                crs: crs,
                renders: this.symbol.renderFunction(this, resolution, crs)
            };

            return this._rendered.renders;
        }

        _needToRender(resolution, crs) {
            return !this._rendered || this._rendered.resolution !== resolution || this._rendered.crs !== crs;
        }

        /**
         * Returns the cached render of the feature.
         * @returns {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
         */
        getRenderCache() {
            return this._rendered;
        }

        /**
         * Resets the rendered cache of the feature, making it to redraw in the next redraw cycle.
         */
        redraw() {
            delete this._rendered;
        }

        /**
         * Prevents feature from rendering.
         */
        hide() { this._hidden = true; }

        /**
         * Allows feature to render after it was hidden.
         */
        show() { this._hidden = false; }

        /**
         * Sets a temporary symbol for the feature. This symbol is used instead of the original symbol until cleared.
         * @param {sGis.ISymbol} symbol
         */
        setTempSymbol(symbol) {
            this._tempSymbol = symbol;
            this.redraw();
        }

        /**
         * Clears the previously set temporary symbol, restoring the original symbol.
         */
        clearTempSymbol() {
            this._tempSymbol = null;
            this.redraw();
        }

        /**
         * Returns true, if a temporary symbol is currently set for this feature.
         * @returns {boolean}
         */
        get isTempSymbolSet() { return !!this._tempSymbol; }

        /**
         * Returns the original symbol of the feature. If temporary symbol is not set, the returned value will be same as value of the .symbol property.
         * @returns {sGis.ISymbol}
         */
        get originalSymbol() { return this._symbol; }

        /**
         * Coordinate system of the feature.
         * @readonly
         * @type sGis.Crs
         */
        get crs() { return this._crs; }

        /**
         * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
         * @type sGis.ISymbol
         */
        get symbol() { return this._tempSymbol || this._symbol; }
        set symbol(/** sGis.ISymbol */ symbol) {
            this._symbol = symbol;
            this.redraw();
        }

        /**
         * Specifies weather the feature is hidden by .hide() method.
         * @type Boolean
         * @readonly
         */
        get hidden() { return this._hidden; }
    }

    utils.extend(Feature.prototype, IEventHandler);
    utils.extend(Feature.prototype, defaults);
    
    return Feature;

});
