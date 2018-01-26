import {EventHandler, sGisEvent} from "./EventHandler";
import {error} from "./utils/utils";
import {Layer, VisibilityChangeEvent} from "./layers/Layer";

export type GroupItem = Layer | LayerGroup;

export enum ContentsChangeType {
    Add,
    Remove,
    Reorder,
    VisibilityChange
}

/**
 * The contents, their order or visibility of the group is changed.
 * @event ContentsChangeEvent
 */
export class ContentsChangeEvent extends sGisEvent {
    static type: string = 'contentsChange';

    /**
     * Shows whether the layers were added, removed, reordered, or the visibility of the layer is changed.
     */
    readonly changeType: ContentsChangeType;

    /**
     * List of the layers affected by change
     */
    readonly affectedLayers: GroupItem[];

    constructor(changeType: ContentsChangeType, affectedLayers: GroupItem[]) {
        super(ContentsChangeEvent.type);

        this.changeType = changeType;
        this.affectedLayers = affectedLayers;
    }
}


/**
 * Ordered nested list of layers.
 * @alias sGis.LayerGroup
 */
export class LayerGroup extends EventHandler {
    private readonly _fireContentChange = (changeType: ContentsChangeType, layers: GroupItem[]) => this.fire(new ContentsChangeEvent(changeType, layers));
    private readonly _forwardEvent = (ev: sGisEvent) => this.fire(ev);
    private _layers: GroupItem[];
    private _isDisplayed: boolean = true;

    /**
     * @param layers - initial list of layers in the group
     */
    constructor(layers: GroupItem[] = []) {
        super();
        this._layers = layers;
    }

    /**
     * Adds a layer to the end of the list.
     * @param layer - layer to add.
     * @fires [[ContentsChangeEvent]]
     * @throws If the layer is already in the group, or in any of the child groups.
     */
    addLayer(layer: GroupItem): void {
        if (layer === this) error(new Error('Cannot add self to the group'));
        if (this.contains(layer)) {
            error(new Error('Cannot add layer to the group: the layer is already in the group'));
        }

        this._layers.push(layer);
        this._setChildListeners(layer);

        if (layer instanceof LayerGroup) {
            this._setForwardListeners(layer);
        }

        this.fire(new ContentsChangeEvent(ContentsChangeType.Add, [layer]));
    }

    /**
     * Removes the layer from the group.
     * @param layer - layer to remove.
     * @param recurse - if set to true, the layer will be removed from all child groups containing this layer.
     * @fires [[ContentsChangeEvent]]
     * @throws If the layer not in the group.
     */
    removeLayer(layer: GroupItem, recurse: boolean = false): void {
        let index = this._layers.indexOf(layer);
        let removed = false;

        if (index !== -1) {
            this._layers.splice(index, 1);
            this._removeChildListeners(layer);
            if (layer instanceof LayerGroup) {
                this._removeForwardListeners(layer);
            }
            this.fire(new ContentsChangeEvent(ContentsChangeType.Remove, [layer]));
            removed = true;
        } else if (recurse) {
            for (let i = 0; i < this._layers.length; i++) {
                if (!(this._layers[i] instanceof LayerGroup)) continue;
                let group = <LayerGroup>this._layers[i];
                if (group.contains(layer)) {
                    group.removeLayer(layer, true);
                    removed = true;
                }
            }
        }

        if (!removed) error(new Error('The layer is not in the group'));
    }

    private _setChildListeners(layer: GroupItem): void {
        layer.on(VisibilityChangeEvent.type, () => this._fireContentChange(ContentsChangeType.VisibilityChange, [layer]));
    }

    private _removeChildListeners(layer: GroupItem): void {
        layer.off(VisibilityChangeEvent.type, () => this._fireContentChange(ContentsChangeType.VisibilityChange, [layer]));
    }

    private _setForwardListeners(layerGroup: LayerGroup): void {
        layerGroup.on(ContentsChangeEvent.type, this._forwardEvent);
    }

    private _removeForwardListeners(layerGroup: LayerGroup): void {
        layerGroup.off(ContentsChangeEvent.type, this._forwardEvent);
    }

    /**
     * Returns true if the group or any of the child groups (recursively) contains the given layer.
     * @param layer - layer to check
     */
    contains(layer: GroupItem): boolean {
        for (let i = 0; i < this._layers.length; i++) {
            if (layer === this._layers[i]) return true;
            if (!(this._layers[i] instanceof LayerGroup)) continue;

            let group = <LayerGroup>this._layers[i];
            if (group.contains(layer)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns index of a layer in the group. If not in the group, returns -1.
     * @param layer
     */
    indexOf(layer: GroupItem): number {
        return this._layers.indexOf(layer);
    }

    /**
     * Inserts the layer to the given position. If the layer is already in the group, moves the layer so that new index of the layer equals the specified index.
     * If the index is negative, layer is added to the n-th position from the end of the list.
     * If the index is larger than number of the layers in the group, layer will be added to the end of the list.
     * @param layer - layer to insert.
     * @param index - integer position of the layer after insertion.
     * @fires [[ContentsChangeEvent]]
     * @throws If the given layer cannot be added to the group (e.g. if the result of reordering creates recursive nesting).
     */
    insertLayer(layer: GroupItem, index: number): void {
        let currIndex = this._layers.indexOf(layer);
        let added = false;

        if (currIndex === -1) {
            this.prohibitEvent('layerAdd');
            this.addLayer(layer);
            this.allowEvent('layerAdd');
            currIndex = this._layers.length - 1;
            added = true;
        }

        let length = this._layers.length;
        index = index > length ? length : index < 0 && index < -length ? -length : index;
        if (index < 0) index = length + index;

        this._layers.splice(currIndex, 1);
        this._layers.splice(index, 0, layer);
        let changeType = added ? ContentsChangeType.Add : ContentsChangeType.Reorder;
        this.fire(new ContentsChangeEvent(changeType, [layer]));

    }

    /**
     * Moves the layer to the end of the list. If the layer is not in the group, the effect of this method is same as .add(layer).
     * @param layer - layer to add.
     */
    moveLayerToTop(layer: GroupItem): void {
        this.insertLayer(layer, -1);
    }

    /**
     * Returns the flat list of layers in the group. Child LayerGroups are not included.
     * @param recurse - if set to true, the contents of child LayerGroups will be added to the list in the corresponding order.
     *                  E.g. if the group contents are layer1, group1, layer2, then the resulting list will be the result of concatenation of
     *                  [layer1], group1.getLayers(true), [layer2].
     * @param excludeInactive - if set to true, layers with isDisplayed=false and all their children will not be included.
     */
    getLayers(recurse: boolean = false, excludeInactive: boolean = false): Layer[] {
        let layers: Layer[] = [];
        this._layers.forEach(layer => {
            if (excludeInactive && !layer.isDisplayed) return;

            if (recurse && layer instanceof LayerGroup) {
                layers = layers.concat(layer.getLayers(recurse, excludeInactive));
            } else {
                layers.push(<Layer>layer);
            }
        });
        return layers;
    }

    /**
     * The list of the layers and child groups in the group. If assigned, two change event will be fired: one for layers
     * removal and one for layers adding.
     * @fires [[ContentsChangeEvent]]
     */
    get layers(): GroupItem[] {
        return this._layers;
    }
    set layers(layers: GroupItem[]) {
        let currLayers = this._layers;
        if (currLayers.length > 0) {
            this._layers.length = 0;
            this.fire(new ContentsChangeEvent(ContentsChangeType.Remove, currLayers));
        }

        if (layers.length > 0) {
            this.prohibitEvent(ContentsChangeEvent.type);
            for (let i = 0; i < layers.length; i++) {
                this.addLayer(layers[i]);
            }
            this.allowEvent(ContentsChangeEvent.type);
            this.fire(new ContentsChangeEvent(ContentsChangeType.Add, layers));
        }
    }

    /**
     * Whether the group is active and should be displayed on the map.
     * @fires [[VisibilityChangeEvent]]
     */
    get isDisplayed(): boolean {
        return this._isDisplayed;
    }
    set isDisplayed(bool: boolean) {
        if (this._isDisplayed === bool) return;

        this._isDisplayed = bool;
        this.fire(new VisibilityChangeEvent());
    }

    /**
     * Sets .isDisplayed property to true
     */
    show(): void {
        this.isDisplayed = true;
    }

    /**
     * Sets .isDisplayed property to false
     */
    hide(): void {
        this.isDisplayed = false;
    }
}
