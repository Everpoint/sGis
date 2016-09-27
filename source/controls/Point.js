sGis.module('controls.Point', [
    'Control',
    'symbol.point.Point'
], function(/** sGis.Control */ Control, PointSymbol) {
    'use strict';

    /**
     * Control for creating point features. When active, any click on the map will create a new point feature and add it
     * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
     * @alias sGis.controls.Point
     * @extends sGis.Control
     * @fires sGis.controls.Point#drawingFinish
     */
    class PointControl extends Control {
        /**
         * @param {sGis.Map} map
         * @param {Object} properties - key-value set of properties to be set to the instance
         */
        constructor(map, properties) {
            super(map, properties);
            this._handleClick = this._handleClick.bind(this);
        }

        _activate() {
            this.map.addListener('click', this._handleClick);
        }

        _deactivate() {
            this.map.removeListener('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            sGisEvent.stopPropagation();

            let point = sGisEvent.point.projectTo(this.map.crs);
            var feature = new sGis.feature.Point(point.position, {crs: this.map.crs, symbol: this.symbol});

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { feature: feature });
        }
    }

    /**
     * Symbol of the points that are created by the control.
     * @member {sGis.Symbol} sGis.controls.Point#symbol
     * @default new sGis.symbol.point.Point()
     */
    PointControl.prototype.symbol = new PointSymbol();
    
    return PointControl;

    /**
     * A point is drawn and is added to the active layer (if set).
     * @event sGis.controls.Point#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.Point} feature - point that was created.
     */
});
