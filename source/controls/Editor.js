sGis.module('controls.Editor', [
    'utils',
    'Control',
    'symbol.Editor',
    'controls.PointEditor',
    'controls.PolyEditor',
    'controls.PolyTransform',
    'utils.StateManager',
    'event'
], function(
    /** sGis.utils */ utils, 
    /** function(new:sGis.Control) */ Control, 
    /** function(new:sGis.symbol.Editor) */ EditorSymbol, 
    /** function(new:sGis.controls.PointEditor) */ PointEditor, 
    /** function(new:sGis.controls.PolyEditor) */ PolyEditor, 
    /** function(new:sGis.controls.PolyTransform) */ PolyTransform, 
    /** function(new:sGis.utils.StateManager */ StateManager, 
    /** sGis.event */ event) {
    
    'use strict';

    const modes = ['vertex', 'rotate', 'scale', 'drag'];

    /**
     * Control for editing points, polylines and polygons. It uses PointEditor, PolyEditor, PolyTransform and Snapping classes for editing corresponding features.
     * @alias sGis.controls.Editor
     * @extends sGis.Control
     * @fires sGis.controls.Editor#featureSelect
     * @fires sGis.controls.Editor#featureDeselect
     * @fires sGis.controls.Editor#featureRemove
     */
    class Editor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options) {
            super(map, options);

            this._ns = '.' + utils.getGuid();
            this._setListener = this._setListener.bind(this);
            this._removeListener = this._removeListener.bind(this);
            this._saveState = this._saveState.bind(this);
            this._setEditors();

            this._states = new StateManager();

            this._deselect = this._deselect.bind(this);
            this.setMode(modes);

            this._handleFeatureAdd = this._handleFeatureAdd.bind(this);
            this._handleFeatureRemove = this._handleFeatureRemove.bind(this);

            this._handleKeyDown = this._handleKeyDown.bind(this);
        }

        _setEditors() {
            this._pointEditor = new PointEditor(this.map);
            this._pointEditor.on('edit', this._saveState);

            this._polyEditor = new PolyEditor(this.map, { onFeatureRemove: this._delete.bind(this) });
            this._polyEditor.on('edit', this._saveState);
            this._polyEditor.on('change', this._updateTransformControl.bind(this));

            this._polyTransform = new PolyTransform(this.map);
            this._polyTransform.on('rotationEnd scalingEnd', this._saveState);
        }

        _activate() {
            if (!this.activeLayer) return;
            this.activeLayer.features.forEach(this._setListener, this);
            this.activeLayer.on('featureAdd', this._handleFeatureAdd);
            this.activeLayer.on('featureRemove', this._handleFeatureRemove);
            this.map.on('click', this._onMapClick.bind(this));

            event.add(document, 'keydown', this._handleKeyDown);
        }

        _handleFeatureAdd(sGisEvent) {
            this._setListener(sGisEvent.feature);
        }

        _handleFeatureRemove(sGisEvent) {
            this._removeListener(sGisEvent.feature);
        }

        _setListener(feature) {
            feature.on('click' + this._ns, this._handleFeatureClick.bind(this, feature));
        }

        _removeListener(feature) {
            feature.off('click' + this._ns);
        }
        
        _onMapClick() {
            if (!this.ignoreEvents) this._deactivate();
        }

        _deactivate() {
            this._deselect();
            this.activeLayer.features.forEach(this._removeListener, this);
            this.activeLayer.off('featureAdd', this._handleFeatureAdd);
            this.activeLayer.off('featureRemove', this._handleFeatureRemove);
            this.map.off('click', this._deselect);

            event.remove(document, 'keydown', this._handleKeyDown);
        }

        /**
         * Selects a given feature if it is in the active layer.
         * @param {sGis.Feature} feature
         */
        select(feature) { this.activeFeature = feature; }

        /**
         * Clears selection if any.
         */
        deselect() { this.activeFeature = null; }

        /**
         * Currently selected for editing feature.
         * @type {sGis.Feature}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.Feature */ feature) {
            if (feature) this.activate();
            this._select(feature);
        }

        _handleFeatureClick(feature, sGisEvent) {
            if (this.ignoreEvents) return;
            sGisEvent.stopPropagation();
            this._select(feature);
        }

        _select(feature) {
            if (this._activeFeature === feature) return;
            this._deselect();

            this._activeFeature = feature;
            if (!feature) return;

            feature.setTempSymbol(new EditorSymbol({ baseSymbol: feature.symbol }));
            if (feature.position) {
                this._pointEditor.activeLayer = this.activeLayer;
                this._pointEditor.activeFeature = feature;
            } else if (feature.rings) {
                this._activatePolyControls(feature);
            }
            this.activeLayer.redraw();

            this._saveState();

            this.fire('featureSelect', { feature: feature })
        }

        _activatePolyControls(feature) {
            this._polyEditor.featureDragAllowed = this._dragging;
            this._polyEditor.vertexChangeAllowed = this._vertexEditing;
            this._polyEditor.activeLayer = this.activeLayer;
            this._polyEditor.activeFeature = feature;

            this._polyTransform.enableRotation = this._rotation;
            this._polyTransform.enableScaling = this._scaling;
            this._polyTransform.activeLayer = this.activeLayer;
            this._polyTransform.activeFeature = feature
        }

        _deselect() {
            if (!this._activeFeature || !this._deselectAllowed) return;

            this._pointEditor.deactivate();
            this._polyEditor.deactivate();
            this._polyTransform.deactivate();

            let feature = this._activeFeature;
            
            this._activeFeature.clearTempSymbol();
            this._activeFeature = null;
            this.activeLayer.redraw();
            
            this.fire('featureDeselect', { feature: feature })
        }

        _updateTransformControl() {
            if (this._polyTransform.isActive) this._polyTransform.update();
        }

        /**
         * Sets the editing mode. Available modes are:<br>
         *     * vertex - editing vertexes of polygons and polylines.
         *     * rotate - rotation of polygons and polylines
         *     * drag - dragging of whole features
         *     * scale - scaling of polygons and polylines
         *     * all - all modes are active
         * @param {string[]|string} mode - can be coma separated list or array of mode names
         */
        setMode(mode) {
            if (mode === 'all') mode = modes;
            if (!Array.isArray(mode)) mode = mode.split(',').map(x => x.trim());

            this._vertexEditing = mode.indexOf('vertex') >= 0;
            this._rotation = mode.indexOf('rotate') >= 0;
            this._dragging = mode.indexOf('drag') >= 0;
            this._scaling = mode.indexOf('scale') >= 0;

            if (this._activeFeature && this._activeFeature.rings) {
                this._polyEditor.deactivate();
                this._polyTransform.deactivate();
                this._activatePolyControls(this._activeFeature);
            }
        }

        /**
         * If deselecting was prohibited, this methods turns it on again.
         */
        allowDeselect() { this._deselectAllowed = true; }

        /**
         * Prevents feature to be deselected by any user or code interaction. It will not have effect if the control is deactivated though.
         */
        prohibitDeselect() { this._deselectAllowed = false; }

        _delete() {
            if (this._deselectAllowed && this.allowDeletion && this._activeFeature) {
                let feature = this._activeFeature;
                this.prohibitEvent('featureDeselect');
                this._deselect();
                this.allowEvent('featureDeselect');
                this.activeLayer.remove(feature);

                this._saveState();
                this.fire('featureRemove', { feature: feature });
            }
        }

        _handleKeyDown(event) {
            switch (event.which) {
                case 27: this._deselect(); return false; // esc
                case 46: this._delete(); return false; // del
                case 90: if (event.ctrlKey) { this.undo(); return false; } // ctrl+z
                case 89: if (event.ctrlKey) { this.redo(); return false; } // ctrl+y
            }
        }

        _saveState() {
            this._states.setState({ feature: this._activeFeature, coordinates: this._activeFeature && this._activeFeature.coordinates });
        }

        /**
         * Undo last change.
         */
        undo() {
            this._setState(this._states.undo());
        }

        /**
         * Redo a change that was undone.
         */
        redo() {
            this._setState(this._states.redo());
        }

        _setState(state) {
            if (!state) return this._deselect();

            if (!state.coordinates && this.activeLayer.features.indexOf(state.feature) >= 0) {
                this.activeFeature = null;
                this.activeLayer.remove(state.feature);
            } else if (state.coordinates && this.activeLayer.features.indexOf(state.feature) < 0) {
                state.feature.coordinates = state.coordinates;
                this.activeLayer.add(state.feature);
                this.activeFeature = state.feature;
            } else if (state.coordinates) {
                state.feature.coordinates = state.coordinates;
                this.activeFeature = state.feature;
            }

            this._updateTransformControl();
            this.activeLayer.redraw();
        }
        
        get ignoreEvents() { return this._ignoreEvents; }
        set ignoreEvents(bool) {
            this._ignoreEvents = bool;
            this._pointEditor.ignoreEvents = bool;
            this._polyEditor.ignoreEvents = bool;
            this._polyTransform.ignoreEvents = bool;
        }
    }

    Editor.prototype._deselectAllowed = true;

    /**
     * If set to true the feature will be deleted in one of two cases:<br>
     *     1) User removes last point of polyline or polygon.
     *     2) User presses "del" button
     * @member {Boolean} sGis.controls.Editor#allowDeletion
     */
    Editor.prototype.allowDeletion = true;

    return Editor;

    /**
     * Feature was selected by user.
     * @event sGis.controls.Editor#featureSelect
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was selected
     * @mixes sGisEvent
     */

    /**
     * Feature was deselected by user.
     * @event sGis.controls.Editor#featureDeselect
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was deselected
     * @mixes sGisEvent
     */

    /**
     * Feature was deleted by user.
     * @event sGis.controls.Editor#featureRemove
     * @type {Object}
     * @prop {sGis.Feature} feature - feature that was deselected
     * @mixes sGisEvent
     */

});
