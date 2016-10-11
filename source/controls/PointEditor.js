sGis.module('controls.PointEditor', [
    'Control'
], (Control) => {

    class PointEditor extends Control {
        constructor(map, options) {
            super(map, options);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
        }

        _activate() {
            if (!this._activeFeature) return;
            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
        }

        _deactivate() {
            if (!this._activeFeature) return;
            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
        }

        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            if (feature) this.activate();
        }

        _handleDragStart(sGisEvent) {
            sGisEvent.draggingObject = this._activeFeature;
            sGisEvent.stopPropagation();
        }

        _handleDrag(sGisEvent) {
            this._activeFeature.position = sGisEvent.point.projectTo(this._activeFeature.crs).position;
            if (this.activeLayer) this.activeLayer.redraw();
        }
    }

    return PointEditor;

});