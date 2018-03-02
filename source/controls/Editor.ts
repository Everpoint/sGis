import {ChangeEvent, Control, ControlParams, EditEvent} from "./Control";
import {StateManager} from "../utils/StateManager";
import {PointEditor} from "./PointEditor";
import {PolyEditor} from "./PolyEditor";
import {PolyTransform} from "./PolyTransform";
import {getGuid} from "../utils/utils";
import {listenDomEvent, removeDomEventListener} from "../utils/domEvent";
import {EditorSymbol} from "../symbols/EditorSymbol";
import {FeaturesAddEvent, FeaturesRemoveEvent} from "../layers/FeatureLayer";
import {ISnappingProvider} from "./snapping/ISnappingProvider";
import {sGisClickEvent} from "../commonEvents";
import {Feature} from "../features/Feature";
import {PointFeature} from "../features/PointFeature";
import {Poly} from "../features/Poly";
import {sGisEvent} from "../EventHandler";
import {Contour, Coordinates} from "../baseTypes";
import {Map} from "../Map";
import {SnappingProviderBase} from "./snapping/SnappingProviderBase";
import {emptySnapping} from "./snapping/SnappingMethods";
import {CombinedSnappingProvider} from "./snapping/CombinedSnappingProvider";

export class FeatureSelectEvent extends sGisEvent {
    static type: string = 'featureSelect';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureSelectEvent.type);
        this.feature = feature;
    }
}

export class FeatureDeselectEvent extends sGisEvent {
    static type: string = 'featureDeselect';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureDeselectEvent.type);
        this.feature = feature;
    }
}

export class FeatureRemoveEvent extends sGisEvent {
    static type: string = 'featureRemove';

    readonly feature: Feature;

    constructor(feature: Feature) {
        super(FeatureRemoveEvent.type);
        this.feature = feature;
    }
}

type EditState = {
    feature: Feature | null,
    coordinates: Coordinates | Contour[] | null
}

const modes = ['vertex', 'rotate', 'scale', 'drag'];

/**
 * Control for editing points, polylines and polygons. It uses PointEditor, PolyEditor, PolyTransform and Snapping classes for editing corresponding features.
 * @alias sGis.controls.Editor
 */
export class Editor extends Control {
    private _ignoreEvents: boolean = false;
    private _scaling: boolean = true;
    private _rotation: boolean = true;
    private _dragging: boolean = true;
    private _vertexEditing: boolean = true;

    private _activeFeature: Feature | null = null;

    private _polyTransform!: PolyTransform;
    private _polyEditor!: PolyEditor;
    private _pointEditor!: PointEditor;

    private _states: StateManager<EditState>;
    private readonly _ns: string;
    private _deselectAllowed = true;

    /**
     * If set to true the feature will be deleted in one of two cases:<br>
     *     1) User removes last point of polyline or polygon.
     *     2) User presses "del" button
     */
    allowDeletion = true;

    /**
     * @param map - map object the control will work with
     * @param options - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {snappingProvider, activeLayer, isActive = false}: ControlParams = {}) {
        super(map, {snappingProvider, activeLayer});

        this._ns = '.' + getGuid();
        this._setListener = this._setListener.bind(this);
        this._removeListener = this._removeListener.bind(this);
        this._onEdit = this._onEdit.bind(this);
        this._setEditors();

        this._states = new StateManager();

        this._deselect = this._deselect.bind(this);
        this.setMode(modes);

        this._handleFeatureAdd = this._handleFeatureAdd.bind(this);
        this._handleFeatureRemove = this._handleFeatureRemove.bind(this);

        this._handleKeyDown = this._handleKeyDown.bind(this);

        this.isActive = isActive;
    }

    private _setEditors(): void {
        this._pointEditor = new PointEditor(this.map, {snappingProvider: this.snappingProvider, activeLayer: this.activeLayer});
        this._pointEditor.on(EditEvent.type, this._onEdit);


        this._polyEditor = new PolyEditor(this.map, {snappingProvider: this._getPolyEditorSnappingProvider(), onFeatureRemove: this._delete.bind(this), activeLayer: this.activeLayer});
        this._polyEditor.on(EditEvent.type, this._onEdit);
        this._polyEditor.on(ChangeEvent.type, this._updateTransformControl.bind(this));

        this._polyTransform = new PolyTransform(this.map);
        this._polyTransform.on('rotationEnd scalingEnd', this._onEdit);
    }

    setSnappingProvider(provider: ISnappingProvider): void {
        this.snappingProvider = provider;
        if (this._pointEditor) this._pointEditor.snappingProvider = provider;
        if (this._polyEditor) this._polyEditor.snappingProvider = this._getPolyEditorSnappingProvider();
    }

    private _getPolyEditorSnappingProvider(): ISnappingProvider | undefined{
        if (!this.snappingProvider) return undefined;

        const result = this.snappingProvider.clone();
        if (result instanceof SnappingProviderBase) {
            result.snappingMethods = result.snappingMethods.concat([emptySnapping]);
        } else if (result instanceof CombinedSnappingProvider) {
            result.providers.forEach(child => {
                if (child instanceof SnappingProviderBase) {
                    child.snappingMethods = child.snappingMethods.concat([emptySnapping]);
                }
            });
        }

        return result;
    }

    private _onEdit(): void {
        this.fire('edit');
        this._saveState();
    }

    protected _activate(): void {
        if (!this.activeLayer) return;
        this.activeLayer.features.forEach(this._setListener, this);
        this.activeLayer.on(FeaturesAddEvent.type, this._handleFeatureAdd);
        this.activeLayer.on(FeaturesRemoveEvent.type, this._handleFeatureRemove);
        this.activeLayer.redraw();
        this.map.on(sGisClickEvent.type, this._onMapClick.bind(this));

        listenDomEvent(document, 'keydown', this._handleKeyDown);
    }

    private _handleFeatureAdd(event: sGisEvent): void {
        let featuresAddEvent = event as FeaturesAddEvent;
        featuresAddEvent.features.forEach(f => this._setListener(f));
    }

    private _handleFeatureRemove(event: sGisEvent): void {
        let featuresRemoveEvent = event as FeaturesRemoveEvent;
        featuresRemoveEvent.features.forEach(f => this._removeListener(f));
    }

    private _setListener(feature: Feature): void {
        feature.on(sGisClickEvent.type + this._ns, this._handleFeatureClick.bind(this, feature));
    }

    private _removeListener(feature: Feature): void {
        feature.off(sGisClickEvent.type + this._ns);
    }

    private _onMapClick(): void {
        if (!this.ignoreEvents) this._deselect();
    }

    protected _deactivate(): void {
        this._deselect();
        if (!this.activeLayer) return;

        this.activeLayer.features.forEach(this._removeListener, this);
        this.activeLayer.off('featureAdd', this._handleFeatureAdd);
        this.activeLayer.off('featureRemove', this._handleFeatureRemove);
        this.map.off('click', this._deselect);

        removeDomEventListener(document, 'keydown', this._handleKeyDown);
    }

    /**
     * Selects a given feature if it is in the active layer.
     * @param feature
     */
    select(feature: Feature) { this.activeFeature = feature; }

    /**
     * Clears selection if any.
     */
    deselect(): void { this.activeFeature = null; }

    /**
     * Currently selected for editing feature.
     */
    get activeFeature(): Feature | null { return this._activeFeature; }
    set activeFeature(feature: Feature | null) {
        if (feature) this.activate();
        this._select(feature);
    }

    private _handleFeatureClick(feature: Feature, event: sGisClickEvent): void {
        if (this.ignoreEvents) return;
        event.stopPropagation();
        this._select(feature);
    }

    private _select(feature: Feature | null): void {
        if (this._activeFeature === feature) return;
        this._deselect();

        this._activeFeature = feature;
        if (!feature) return;

        feature.setTempSymbol(new EditorSymbol({ baseSymbol: feature.symbol }));
        if (feature instanceof PointFeature) {
            this._pointEditor.activeLayer = this.activeLayer;
            this._pointEditor.activeFeature = feature;
        } else if (feature instanceof Poly) {
            this._activatePolyControls(feature);
        }

        if (this.activeLayer) this.activeLayer.redraw();

        this._saveState();

        this.fire(new FeatureSelectEvent(feature));
    }

    private _activatePolyControls(feature: Poly): void {
        this._polyEditor.featureDragAllowed = this._dragging;
        this._polyEditor.vertexChangeAllowed = this._vertexEditing;
        this._polyEditor.activeLayer = this.activeLayer;
        this._polyEditor.activeFeature = feature;

        this._polyTransform.enableRotation = this._rotation;
        this._polyTransform.enableScaling = this._scaling;
        this._polyTransform.activeLayer = this.activeLayer;
        this._polyTransform.activeFeature = feature
    }

    private _deselect(): void {
        if (!this._activeFeature || !this._deselectAllowed) return;

        this._pointEditor.deactivate();
        this._polyEditor.deactivate();
        this._polyTransform.deactivate();

        let feature = this._activeFeature;

        this._activeFeature.clearTempSymbol();
        this._activeFeature = null;
        if (this.activeLayer) this.activeLayer.redraw();

        this.fire(new FeatureDeselectEvent(feature));
    }

    private _updateTransformControl(): void {
        if (this._polyTransform.isActive) this._polyTransform.update();
    }

    /**
     * Sets the editing mode. Available modes are:<br>
     *     * vertex - editing vertexes of polygons and polylines.
     *     * rotate - rotation of polygons and polylines
     *     * drag - dragging of whole features
     *     * scale - scaling of polygons and polylines
     *     * all - all modes are active
     * @param mode - can be coma separated list or array of mode names
     */
    setMode(mode: string | string[]): void {
        if (mode === 'all') mode = modes;
        if (!Array.isArray(mode)) mode = mode.split(',').map(x => x.trim());

        this._vertexEditing = mode.indexOf('vertex') >= 0;
        this._rotation = mode.indexOf('rotate') >= 0;
        this._dragging = mode.indexOf('drag') >= 0;
        this._scaling = mode.indexOf('scale') >= 0;

        if (this._activeFeature instanceof Poly) {
            this._polyEditor.deactivate();
            this._polyTransform.deactivate();
            this._activatePolyControls(this._activeFeature);
        }
    }

    /**
     * If deselecting was prohibited, this methods turns it on again.
     */
    allowDeselect(): void { this._deselectAllowed = true; }

    /**
     * Prevents feature to be deselected by any user or code interaction. It will not have effect if the control is deactivated though.
     */
    prohibitDeselect(): void { this._deselectAllowed = false; }

    private _delete(): void {
        if (this._deselectAllowed && this.allowDeletion && this._activeFeature) {
            let feature = this._activeFeature;
            this.prohibitEvent(FeatureDeselectEvent.type);
            this._deselect();
            this.allowEvent(FeatureDeselectEvent.type);
            if (this.activeLayer) this.activeLayer.remove(feature);

            this._saveState();
            this.fire(new FeatureRemoveEvent(feature));
        }
    }

    private _handleKeyDown(event: KeyboardEvent): boolean | undefined{
        switch (event.which) {
            case 27: this._deselect(); return false; // esc
            case 46: this._delete(); return false; // del
            case 90: if (event.ctrlKey) { this.undo(); return false; } break; // ctrl+z
            case 89: if (event.ctrlKey) { this.redo(); return false; } break; // ctrl+y
        }
    }

    private _saveState(): void {
        let coordinates = this.activeFeature === null ? null
            : this.activeFeature instanceof Poly ? this.activeFeature.rings : (this.activeFeature as PointFeature).position;
        this._states.setState({ feature: this._activeFeature, coordinates: coordinates });
    }

    /**
     * Undo last change.
     */
    undo(): void {
        this._setState(this._states.undo());
    }

    /**
     * Redo a change that was undone.
     */
    redo(): void {
        this._setState(this._states.redo());
    }

    private _setState(state: EditState | null) {
        if (!state || !this.activeLayer) return this._deselect();

        if (!state.coordinates && state.feature && this.activeLayer.features.indexOf(state.feature) >= 0) {
            this.activeFeature = null;
            this.activeLayer.remove(state.feature);
        } else if (state.coordinates && state.feature && this.activeLayer.features.indexOf(state.feature) < 0) {
            this._setCoordinates(state);
            this.activeLayer.add(state.feature);
            this.activeFeature = state.feature;
        } else if (state.coordinates) {
            this._setCoordinates(state);
            this.activeFeature = state.feature;
        }

        this._updateTransformControl();
        this.activeLayer.redraw();
    }

    private _setCoordinates(state: EditState): void {
        if (state.feature instanceof PointFeature) {
            state.feature.position = <Coordinates>state.coordinates;
        } else if (state.feature instanceof Poly) {
            state.feature.coordinates = <Contour[]>state.coordinates;
        }
    }

    get ignoreEvents(): boolean { return this._ignoreEvents; }
    set ignoreEvents(bool: boolean) {
        this._ignoreEvents = bool;
        this._pointEditor.ignoreEvents = bool;
        this._polyEditor.ignoreEvents = bool;
        this._polyTransform.ignoreEvents = bool;
    }

    get pointEditor(): PointEditor { return this._pointEditor; }
    get polyEditor(): PolyEditor { return this._polyEditor; }
    get polyTransform(): PolyTransform { return this._polyTransform; }
}
