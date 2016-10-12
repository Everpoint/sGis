sGis.module('controls.PointEditor', [
    'Control',
    'controls.Snapping'
], (Control, Snapping) => {

    'use strict';
    
    class PointEditor extends Control {
        constructor(map, options) {
            super(map, options);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);

            this._snapping = new Snapping(map);
        }

        _activate() {
            if (!this._activeFeature) return;

            if (this.snappingTypes && this.snappingTypes.length > 0) {
                this._snapping.snappingTypes = this.snappingTypes;
                this._snapping.activeLayer = this.activeLayer;
                this._snapping.activeFeature = this._activeFeature;
            }

            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dragEnd', this._handleDragEnd);
        }

        _deactivate() {
            if (!this._activeFeature) return;

            this._snapping.deactivate();

            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dragEnd', this._handleDragEnd);
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

            this._snapping.activate();
        }

        _handleDrag(sGisEvent) {
            this._activeFeature.position = this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position;
            if (this.activeLayer) this.activeLayer.redraw();
        }

        _handleDragEnd() {
            this._snapping.deactivate();
            this.fire('edit');
        }
    }

    PointEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line'];

    return PointEditor;

});