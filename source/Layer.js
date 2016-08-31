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
     * @mixes sGis.IEventHandler
     */
    class Layer {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties) {
            utils.init(this, properties);
        }
        
        /**
         * Returns the array of features to be drawn for given parameters.
         * @param {sGis.Bbox} bbox - bounding box of the area to get features from
         * @param {Number} resolution - current resolution 
         * @returns {sGis.Feature[]}
         */
        getFeatures(bbox, resolution) {
            return [];
        }
        
        /**
         * Whether the layer is drawn to map
         * @type Boolean
         * @default true
         * @fires sGis.Layer#propertyChange
         */
        get isDisplayed() { return this._isDisplayed; }
        set isDisplayed(/** Boolean */ bool) {
            this._isDisplayed = bool;
            this.fire('propertyChange', {property: 'display'});
        }

        /**
         * Makes the layer visible
         * @fires sGis.Layer#propertyChange
         */
        show() {
            this.isDisplayed = true;
        }

        /**
         * Makes the layer invisible
         * @fires sGis.Layer#propertyChange
         */
        hide() {
            this.isDisplayed = false;
        }

        /**
         * Opacity of the layer. It sets the opacity of all objects in this layer. Valid values: [0..1].
         * @type Number
         * @default 1
         * @fires sGis.Layer#propertyChange
         */
        get opacity() { return this.getOpacity(); }
        set opacity(/** Number */ opacity) { this.setOpacity(opacity); }
        
        getOpacity() { return this._opacity; }
        setOpacity(opacity) {
            opacity = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity;
            this._opacity = opacity;
            this.fire('propertyChange', {property: 'opacity'});
        }

        /**
         * Min and max resolution between which the layer will be displayed. Must be in [min, max] format. Negative and 0 values are treated as no limit.
         * @type Number[]
         * @default [-1, -1]
         * @fires sGis.Layer#propertyChange
         * @fires sGis.Layer#propertyChange
         */
        get resolutionLimits() { return this._resolutionLimits; }
        set resolutionLimits(/** Number[] */ limits) {
            this._resolutionLimits = limits;
            this.fire('propertyChange', {property: 'resolutionLimits'});
        }

        /**
         * Forces redrawing of the layer
         * @fires sGis.Layer#propertyChange
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

    /**
     * A property of the layer has changed. Fired when redrawing is required.
     * @event sGis.Layer#propertyChange
     * @type {Object}
     * @mixes sGisEvent
     * @prop {String} property - the name of the property that has been changed
     */

    /**
     * @typedef {function(Object)} sGis.Layer.constructor
     * @returns sGis.Layer
     */
});
