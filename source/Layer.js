sGis.module('Layer', [
    'utils',
    'utils.proto',
    'IEventHandler'
], function(utils, IEventHandler) {
    'use strict';

    var defaults = {
        _display: true,
        _opacity: 1.0,
        needAnimate: sGis.browser.indexOf('Chrome') !== 0,
        _name: null,
        delayedUpdate: false,
        _resolutionLimits: [-1, -1]
    };

    class Layer {
        constructor() {
            this.id = Symbol(this);
        }

        show() {
            this._display = true;
            this.fire('propertyChange', {property: 'display'});
        }

        hide() {
            this._display = false;
            this.fire('propertyChange', {property: 'display'});
        }

        get opacity() { return this._opacity; }
        set opacity(opacity) {
            if (!sGis.utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }

        get isDisplayed() { return this._display; }
        set isDisplayed(bool) {
            if (bool) {
                this.show();
            } else {
                this.hide();
            }
        }

        get resolutionLimits() { return this._resolutionLimits; }
        set resolutionLimits(limits) {
            this._resolutionLimits = limits;
            this.fire('propertyChange', {property: 'resolutionLimits'});
        }
    }

    sGis.utils.extend(Layer.prototype, defaults);
    sGis.utils.proto.setMethods(Layer.prototype, sGis.IEventHandler);

    return Layer;
});
