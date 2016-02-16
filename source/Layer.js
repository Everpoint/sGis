'use strict';

(function() {

    sGis.Layer = function(extention) {
        for (var key in extention) {
            this[key] = extention[key];
        }
    };

    sGis.Layer.prototype = {
        _display: true,
        _opacity: 1.0,
        _needAnimate: sGis.browser.indexOf('Chrome') === 0 ? false : true,
        _name: null,
        _delayedUpdate: false,
        _resolutionLimits: [-1, -1],

        __initialize: function() {
            this._id = utils.getGuid();
        },

        show: function() {
            this._display = true;
            this.fire('propertyChange', {property: 'display'});
        },

        hide: function() {
            this._display = false;
            this.fire('propertyChange', {property: 'display'});
        }
    };

    Object.defineProperties(sGis.Layer.prototype, {
        id: {
            get: function() {
                return this._id;
            }
        },

        opacity: {
            get: function() {
                return this._opacity;
            },

            set: function(opacity) {
                if (!utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
                opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
                this._opacity = opacity;
                this.fire('propertyChange', {property: 'opacity'});
            }
        },

        name: {
            get: function() {
                return this._name ? this._name : this._id;
            },

            set: function(name) {
                if (!utils.isString(name)) utils.error('String is expected but got ' + name + ' instead');
                this._name = name;
                this.fire('propertyChange', {property: 'name'});
            }
        },

        needAnimate: {
            get: function() {
                return this._needAnimate;
            },

            set: function(bool) {
                this._needAnimate = bool;
            }
        },

        isDisplayed: {
            get: function() {
                return this._display;
            },

            set: function(bool) {
                if (bool === true) {
                    this.show();
                } else if (bool === false) {
                    this.hide();
                } else {
                    utils.error('Boolean is expected but got ' + bool + ' instead');
                }
            }
        },

        delayedUpdate: {
            get: function() {
                return this._delayedUpdate;
            },

            set: function(bool) {
                this._delayedUpdate = bool;
            }
        },

        resolutionLimits: {
            get: function() {
                return this._resolutionLimits;
            },
            set: function(limits) {
                this._resolutionLimits = limits;
                this.fire('propertyChange', {property: 'resolutionLimits'});
            }
        }
    });

    sGis.utils.proto.setMethods(sGis.Layer.prototype, sGis.IEventHandler);

})();