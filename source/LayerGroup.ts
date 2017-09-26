/**
 * Ordered list of layers and nested layer groups.
 * @alias sGis.LayerGroup
 * @extends sGis.EventHandler
 */
import {EventHandler} from "./EventHandler";
import {error} from "./utils/utils";

export class LayerGroup extends EventHandler {
    _fireContentChange: () => void;
    _forwardEvent: (sGisEvent: any) => void;
    _layers: any[];
    _isDisplayed = true;

    /**
     * @param {sGis.Layer[]} [layers=[]] - initial list of layers in the group
     */
    constructor (layers = []) {
        super();
        this._layers = [];
        this._forwardEvent = (sGisEvent) => { this.fire(sGisEvent.eventType, sGisEvent); };
        this._fireContentChange = () => { this.fire('contentsChange'); };

        this.layers = layers || [];
    }

    /**
     * Adds a layer to the end of the list
     * @param {sGis.Layer|sGis.LayerGroup} layer - layer to add
     * @fires sGis.LayerGroup#layerAdd
     * @fires sGis.LayerGroup#contentsChange
     * @throws if the layer is already in the group, or in any of the child groups
     */
    addLayer (layer) {
        if (layer === this) error('Cannot add self to the group');
        if (this.getLayers(true).indexOf(layer) !== -1) {
            error('Cannot add layer to the group: the layer is already in the group');
        }

        this._layers.push(layer);
        this._setChildListeners(layer);

        if (layer instanceof LayerGroup) {
            this._setForwardListeners(layer);
        }

        this.fire('layerAdd', {layer: layer});
        this.fire('contentsChange');
    }

    /**
     * Removes the layer from the group
     * @param {sGis.Layer|sGis.LayerGroup} layer - layer to remove
     * @param {Boolean} [recurse=false] - remove the layer from the child groups
     * @fires sGis.LayerGroup#layerRemove
     * @fires sGis.LayerGroup#contentsChange
     * @throws if the layer not in the group
     */
    removeLayer (layer, recurse = false) {
        var index = this._layers.indexOf(layer);
        if (index !== -1) {
            this._layers.splice(index, 1);
            this._removeChildListeners(layer);
            if (layer instanceof LayerGroup) {
                this._removeForwardListeners(layer);
            }
            this.fire('layerRemove', {layer: layer});
            this.fire('contentsChange');
            return;
        } else if (recurse) {
            for (var i = 0, l = this._layers.length; i < l; i++) {
                if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer)) {
                    this._layers[i].removeLayer(layer, true);
                    return;
                }
            }
        }

        error('The layer is not in the group');
    }

    _setChildListeners(layer) {
        layer.on('visibilityChange', this._fireContentChange);
    }

    _removeChildListeners(layer) {
        layer.off('visibilityChange', this._fireContentChange);
    }

    _setForwardListeners (layerGroup) {
        layerGroup.on('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
    }

    _removeForwardListeners (layerGroup) {
        layerGroup.off('layerAdd layerRemove layerOrderChange contentsChange', this._forwardEvent);
    }

    /**
     * Returns true if the group or any of the child groups (recursively) contains the given layer
     * @param {sGis.Layer|sGis.LayerGroup} layer
     * @returns {boolean}
     */
    contains (layer) {
        for (var i = 0, l = this._layers.length; i < l; i++) {
            if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer) || this._layers[i] === layer) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns index of a layer in the group
     * @param {sGis.Layer|sGis.LayerGroup} layer
     * @returns {number}
     */
    indexOf (layer) {
        return this._layers.indexOf(layer);
    }

    /**
     * Inserts the layer to the given position. If the layer is already in the group, moves the layer so that new index of the layer equals the specified index.
     * If the index is negative, layer is added to the beginning of the list. If the index is larger than number of the layers in the group, layer will be added to the end of the list.
     * @param {sGis.Layer|sGis.LayerGroup} layer - layer to insert
     * @param {Number} index - integer position of the layer after insertion
     * @fires sGis.LayerGroup#layerAdd
     * @fires sGis.LayerGroup#layerOrderChange
     * @fires sGis.LayerGroup#contentsChange
     * @throws if the given layer cannot be added to the group
     */
    insertLayer (layer, index) {
        var currIndex = this._layers.indexOf(layer);

        if (currIndex === -1) {
            this.prohibitEvent('layerAdd');
            this.addLayer(layer);
            this.allowEvent('layerAdd');
            currIndex = this._layers.length - 1;
            var added = true;
        }

        var length = this._layers.length;
        index = index > length ? length : index < 0 && index < -length ? -length : index;
        if (index < 0) index = length + index;

        this._layers.splice(currIndex, 1);
        this._layers.splice(index, 0, layer);
        var event = added ? 'layerAdd' : 'layerOrderChange';
        this.fire(event, {layer: layer});
        this.fire('contentsChange');

    }

    moveLayerToTop(layer) {
        this.insertLayer(layer, -1);
    }

    /**
     * Returns the list of the layers in the group without child LayerGroup's
     * @param {Boolean} [recurse=false] - weather to include layers from the child groups
     * @param {Boolean} [excludeInactive=false] - if set to true, layers with isDisplayed=false and all their children will not be included
     * @returns {sGis.Layer[]} - ordered list of the layers
     */
    getLayers(recurse = false, excludeInactive = false) {
        let layers = [];
        this._layers.forEach(layer => {
            if (excludeInactive && !layer.isDisplayed) return;

            if (recurse && layer instanceof LayerGroup) {
                layers = layers.concat(layer.getLayers(recurse, excludeInactive));
            } else {
                layers.push(layer);
            }
        });
        return layers;
    }

    /**
     * The list of the layers and child groups in the group. If assigned, all the layers will be removed from the group, and then new layers will be added (firing all the events).
     * @type Array<sGis.Layer|sGis.LayerGroup>
     * @default []
     */
    get layers() { return [].concat(this._layers); }
    set layers(/** Array<sGis.Layer|sGis.LayerGroup> */ layers) {
        var list = this.layers;
        for (var i = 0; i < list.length; i++) {
            this.removeLayer(list[i]);
        }

        for (i = 0; i < layers.length; i++) {
            this.addLayer(layers[i]);
        }
    }

    get isDisplayed() { return this._isDisplayed; }
    set isDisplayed(bool) {
        if (this._isDisplayed !== bool) {
            this._isDisplayed = bool;
            this.fire('visibilityChange');
        }
    }

    show() { this.isDisplayed = true; }
    hide() { this.isDisplayed = false; }
}

/**
 * A layer is added to the group, or to any of the child groups (recursive)
 * @event sGis.LayerGroup#layerAdd
 * @mixes sGisEvent
 * @type {Object}
 * @property {sGis.Layer} layer - added layer
 */

/**
 * A layer is removed from the group, or from any of the child groups (recursive)
 * @event sGis.LayerGroup#layerRemove
 * @mixes sGisEvent
 * @type {Object}
 * @property {sGis.Layer} layer - removed layer
 */

/**
 * Position of one of the layers in the group is changed
 * @event sGis.LayerGroup#layerOrderChange
 * @mixes sGisEvent
 * @type {Object}
 * @property {sGis.Layer} layer - the layer that was moved
 */

/**
 * One of the child layers (recursive) is added, removed, moved to other index or changed isDisplayed property
 * @event sGis.LayerGroup#contentsChange
 * @mixes sGisEvent
 * @type {Object}
 */
