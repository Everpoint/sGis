'use strict';

(function() {

    sGis.feature = {};

    sGis.Feature = function(extention) {
        for (var key in extention) {
            this[key] = extention[key];
        }
    };

    sGis.Feature.prototype = {
        _bbox: null,
        _attributes: null,
        _crs: sGis.CRS.geo,
        _hidden: false,

        render: function(resolution, crs) {
            if (this._hidden) {
                return [];
            } else {
                return this.symbol.renderFunction(this, resolution, crs);
            }
        },

        hide: function() {
            this._hidden = true;
        },

        show: function() {
            this._hidden = false;
        },

        __initialize: function(options) {
            if (options && options.id) {
                this.id = options.id;
                delete options.id;
            } else {
                this._id = utils.getGuid();
            }

            if (!options || !options.symbol && this._defaultSymbol) {
                this._symbol = new this._defaultSymbol();
            }

            sGis.utils.init(this, options);
        },

        setTempSymbol: function(symbol) {
            this._tempSymbol = symbol;
        },

        clearTempSymbol: function() {
            this._tempSymbol = null;
        }
    };

    Object.defineProperties(sGis.Feature.prototype, {
        id: {
            get: function() {
                return this._id;
            },

            set: function(id) {
                this._id = id;
            }
        },

        attributes: {
            get: function() {
                return this._attributes;
            },

            set: function(attributes) {
                this._attributes = attributes;
            }
        },

        crs: {
            get: function() {
                return this._crs;
            }
        },

        symbol: {
            get: function() {
                return this._tempSymbol || this._symbol;
            },

            set: function(symbol) {
                if (!(symbol instanceof sGis.Symbol)) utils.error('sGis.Symbol instance is expected but got ' + symbol + ' instead');
                //if (symbol.type !==  this.type) utils.error('sGis.feature.Point object requere symbol of the type "' + this.type + '" but got ' + symbol.type + ' instead');

                this._symbol = symbol;
            }
        },

        style: {
            get: function() {
                return this.symbol;
            },

            set: function(style) {
                var keys = Object.keys(style);
                for (var i = 0; i < keys.length; i++) {
                    this._symbol[keys[i]] = style[keys[i]];
                }
            }
        },

        hidden: {
            get: function() {
                return this._hidden;
            },
            set: function(bool) {
                if (bool === true) {
                    this.hide();
                } else if (bool === false) {
                    this.show();
                } else {
                    utils.error('Boolean is expected but got ' + bool + ' instead');
                }
            }
        },

        isTempSymbolSet: {
            get: function() {
                return !!this._tempSymbol;
            }
        },

        originalSymbol: {
            get: function() {
                return this._symbol;
            }
        }
    });

    sGis.utils.proto.setMethods(sGis.Feature.prototype, sGis.IEventHandler);

    //todo: remove this
    var id = 0;

    sGis.Feature.getNewId = function() {
        return utils.getGuid();
    };

})();