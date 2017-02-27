sGis.module('controls.PolyDrag', [
    'Control',
    'FeatureLayer',
    'symbol.polygon.Simple'
], function(Control, FeatureLayer, PolygonSymbol) {

    'use strict';

    /**
     * Base class for controls that create polygon feature by dragging some area on the map. When the control is activated,
     * a new temporary layer is created and added to the map. The feature is drawn on that temp layer. After drawing is
     * finished, if the .activeLayer property is set, the feature is moved to the active layer.
     * @alias sGis.controls.PolyDrag
     * @extends sGis.Control
     * @fires sGis.controls.PolyDrag#drawingBegin
     * @fires sGis.controls.PolyDrag#drawingFinish
     */
    class PolyDrag extends Control {
        /**
         * @param {sGis.Map} map - map the control will work with
         * @param {Object} [properties] - key-value set of properties to be set to the instance
         */
        constructor(map, properties = {}) {
            super(map, properties);

            if (!this.symbol) this.symbol = new PolygonSymbol();

            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);

            this.isActive = properties.isActive;
        }

        _activate() {
            this.map.on('dragStart', this._handleDragStart);
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
        }

        _deactivate() {
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this._activeFeature = null;
            this._removeDragListeners();
            this.map.off('dragStart', this._handleDragStart);
        }

        _handleDragStart(sGisEvent) {
            this._startNewFeature(sGisEvent.point);
            this.map.on('drag', this._handleDrag);
            this.map.on('dragEnd', this._handleDragEnd);

            this.fire('drawingBegin');
        }

        _handleDrag(sGisEvent) {
            this._updateFeature(sGisEvent.point);
            this._tempLayer.redraw();
            sGisEvent.stopPropagation();
        }

        _handleDragEnd(sGisEvent) {
            let feature = this._activeFeature;
            this._activeFeature = null;
            this._tempLayer.features = [];
            this._removeDragListeners();

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }

        _removeDragListeners() {
            this.map.off('drag', this._handleDrag);
            this.map.off('dragEnd', this._handleDragEnd);
        }

        _startNewFeature(point) {
            // Abstract method, must be set in a child class
        }

        _updateFeature(point) {
            // Abstract method, must be set in a child class
        }

        /**
         * The feature being drawn.
         * @type sGis.feature.Polygon
         * @readonly
         */
        get activeFeature() { return this._activeFeature; }

        /**
         * Temporary layer for feature drawing
         * @type sGis.FeatureLayer
         * @readonly
         */
        get tempLayer() { return this._tempLayer; }
    }

    /**
     * Symbol of the created features
     * @member {sGis.Symbol} sGis.controls.PolyDrag#symbol
     * @default new sGis.symbol.polygon.Simple()
     */

    return PolyDrag;

    /**
     * Drawing of a new feature is started by starting a drag of the map.
     * @event sGis.controls.PolyDrag#drawingBegin
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Drawing is finished by finishing the drag and the feature is added to the active layer (if set).
     * @event sGis.controls.PolyDrag#drawingFinish
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.feature.Polygon} feature - created feature
     */

});
