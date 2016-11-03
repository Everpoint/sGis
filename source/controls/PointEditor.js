sGis.module('controls.PointEditor', [
    'Control',
    'controls.Snapping'
], (Control, Snapping) => {

    'use strict';

    /**
     * Control for editing point features. When activeFeature is set, the feature is becoming draggable.
     * @alias sGis.controls.PointEditor
     * @extends sGis.Control
     * @fires sGis.controls.PointEditor#edit
     */
    class PointEditor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance 
         */
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

        /**
         * Point to drag. If set to null, the control is deactivated.
         * @type {sGis.feature.Point}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Point */ feature) {
            this.deactivate();

            this._activeFeature = feature;
            if (feature) this.activate();
        }

        _handleDragStart(sGisEvent) {
            if (this.ignoreEvents) return;
            
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

    /**
     * Specifies which snapping functions to use. See {sGis.controls.Snapping#snappingTypes}.
     * @member {String[]} sGis.controls.PointEditor#snappingTypes
     * @default ['vertex', 'midpoint', 'line']
     */
    PointEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line'];
    PointEditor.prototype.ignoreEvents = false;

    return PointEditor;

        /**
         * Dragging of the point if finished and the feature is released.
         * @event sGis.controls.PointEditor#edit
         * @type {Object}
         * @mixes sGisEvent
         */
});