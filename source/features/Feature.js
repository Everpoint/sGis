sGis.module('Feature', [
    'utils',
    'CRS',
    'IEventHandler'
], function(utils, CRS, IEventHandler) {

    'use strict';

    var defaults = {
        attributes: [],

        _crs: CRS.geo,
        _symbol: null,
        _hidden: false
    };

    class Feature {
        constructor(properties = {}) {
            if (properties.crs){
                this._crs = properties.crs;
                delete properties.crs;
            }
            
            utils.init(this, properties);
            this.attributes = [];
        }

        render(resolution, crs) {
            if (this._hidden || !this.symbol) return [];
            if (!this._needToRender(resolution, crs)) return this._rendered.renders;

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

        redraw() {
            delete this._rendered;
        }

        hide() { this._hidden = true; }
        show() { this._hidden = false; }

        setTempSymbol(symbol) { this._tempSymbol = symbol; }
        clearTempSymbol() { this._tempSymbol = null; }
        
        get isTempSymbolSet() { return !!this._tempSymbol; }
        get originalSymbol() { return this._symbol; }
        
        get crs() { return this._crs; }
        
        get symbol() { return this._tempSymbol || this._symbol; }
        set symbol(symbol) {
            this._symbol = symbol;
            this.redraw();
        }
        
        get hidden() { return this._hidden; }
    }

    utils.extend(Feature.prototype, IEventHandler);
    utils.extend(Feature.prototype, defaults);
    
    return Feature;

});
