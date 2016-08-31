sGis.module('LayerGroup', [
    'utils',
    'IEventHandler'
], function(utils, IEventHandler) {

    'use strict';

    class LayerGroup {
        constructor (layers = []) {
            this._layers = [];
            this.layers = layers || [];

            this._forwardEvent = (sGisEvent) => { this.fire(sGisEvent.eventType, sGisEvent); };
        }

        addLayer (layer) {
            if (layer === this) utils.error('Cannot add self to the group');
            if (this.getLayers(true).indexOf(layer) !== -1) {
                utils.error('Cannot add layer to the group: the layer is already in the group');
            }

            this._layers.push(layer);
            if (layer instanceof LayerGroup) this._setForwardListeners(layer);
            this.fire('layerAdd', {layer: layer});
        }

        removeLayer (layer, recurse) {
            var index = this._layers.indexOf(layer);
            if (index !== -1) {
                this._layers.splice(index, 1);
                if (layer instanceof LayerGroup) this._removeForwardListeners(layer);
                this.fire('layerRemove', {layer: layer});
                return;
            } else if (recurse) {
                for (var i = 0, l = this._layers.length; i < l; i++) {
                    if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer)) {
                        this._layers[i].removeLayer(layer, true);
                        return;
                    }
                }
            }
    
            utils.error('The layer is not in the group');
        }

        _setForwardListeners (layerGroup) {
            layerGroup.on('layerAdd layerRemove layerOrderChange', this._forwardEvent);
        }

        _removeForwardListeners (layerGroup) {
            layerGroup.off('layerAdd layerRemove layerOrderChange', this._forwardEvent);
        }

        contains (layer) {
            for (var i = 0, l = this._layers.length; i < l; i++) {
                if (this._layers[i] instanceof LayerGroup && this._layers[i].contains(layer) || this._layers[i] === layer) {
                    return true;
                }
            }
            return false;
        }

        indexOf (layer) {
            return this._layers.indexOf(layer);
        }

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
        }

        getLayers (recurse) {
            let layers = [];
            this._layers.forEach(layer => {
                if (recurse && layer instanceof LayerGroup) {
                    layers = layers.concat(layer.getLayers(recurse));
                } else {
                    layers.push(layer);
                }
            });
            return layers;
        }
        
        get layers() { return [].concat(this._layers); }
        set layers(layers) {
            var list = this.layers;
            for (var i = 0; i < list.length; i++) {
                this.removeLayer(list[i]);
            }

            for (i = 0; i < layers.length; i++) {
                this.addLayer(layers[i]);
            }
        }
    }
    
    utils.extend(LayerGroup.prototype, IEventHandler);

    return LayerGroup;

});
