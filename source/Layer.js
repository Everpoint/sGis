sGis.module('Layer', [
    'utils',
    'IEventHandler'
], function(utils, IEventHandler) {
    'use strict';

    var defaults = {
        _isDisplayed: true,
        _opacity: 1.0,
        _resolutionLimits: [-1, -1]
    };

    /**
     * Base class for all map layers.
     * @alias sGis.Layer
     */
    class Layer {
        /**
         * Whether the layer is drawn to map
         * @type Boolean
         * @default true
         */
        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(/** Boolean */ bool) {
            this._isDisplayed = bool;
            this.fire('propertyChange', {property: 'display'});
        }

        /**
         * Makes the layer visible
         */
        show() {
            this.isDisplayed = true;
        }

        /**
         * Makes the layer invisible
         */
        hide() {
            this.isDisplayed = false;
        }

        /**
         * Opacity of the layer. It sets the opacity of all objects in this layer. Valid values: [0..1].
         * @type Number
         * @default 1
         */
        get opacity() { return this._opacity; }
        set opacity(/** Number */ opacity) {
            if (!sGis.utils.isNumber(opacity)) error('Expected a number but got "' + opacity + '" instead');
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }

        /**
         * Min and max resolution between which the layer will be displayed. Must be in [min, max] format. Negative and 0 values are treated as no limit.
         * @type Number[]
         * @default [-1, -1]
         */
        get resolutionLimits() { return this._resolutionLimits; }
        set resolutionLimits(/** Number[] */ limits) {
            this._resolutionLimits = limits;
            this.fire('propertyChange', {property: 'resolutionLimits'});
        }

        /**
         * Forces redrawing of the layer
         */
        redraw() {
            this.fire('propertyChange', {property: 'content'});
        }
    }

    /**
     * If set to true, the layer will be updated only after map position change has ended (e.g. pan or zoom end). If set to true, the layer will be redrawn on every change.
     * @member {Boolean} delayedUpdate
     * @memberof sGis.Layer
     * @instance
     * @default false
     */
    Layer.prototype.delayedUpdate = false;

    sGis.utils.extend(Layer.prototype, defaults);
    sGis.utils.extend(Layer.prototype, IEventHandler);

    return Layer;
});
