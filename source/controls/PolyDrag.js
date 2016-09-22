sGis.module('controls.PolyDrag', [
    'Control',
    'FeatureLayer',
    'symbol.polygon.Simple'
], function(Control, FeatureLayer, PolygonSymbol) {

    'use strict';

    class PolyDrag extends Control {
        constructor(map, properties) {
            super(map, properties);

            if (!this.symbol) this.symbol = new PolygonSymbol();
            
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
        }

        _activate() {
            this.map.on('dragStart', this._handleDragStart);
            this._tempLayer = new FeatureLayer();
            this._map.addLayer(this._tempLayer);
        }

        _deactivate() {
            this._map.removeLayer(this._tempLayer);
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
            this._removeDragListeners();

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { geom: feature, browserEvent: sGisEvent.browserEvent });
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

        get activeFeature() { return this._activeFeature; }
    }

    return PolyDrag;

});
