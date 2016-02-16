'use strict';

(function() {

    sGis.LayerGroup = function(layers) {
        this._layers = [];
        this.layers = layers || [];
    };

    sGis.LayerGroup.prototype = {
        addLayer: function(layer) {
            if (!(layer instanceof sGis.Layer) && !(layer instanceof sGis.LayerGroup)) utils.error('sGis.Layer instance is expected but got ' + layer + ' instead');
            if (layer === this) utils.error('Cannot add self to the group');
            if (this._layers.indexOf(layer) !== -1) {
                utils.error('Cannot add layer to the group: the layer is already in the group');
            } else {
                for (var i = 0, l = this._layers.length; i < l; i++) {
                    if (this._layers[i] instanceof sGis.LayerGroup && this._layers[i].contains(layer) || layer instanceof sGis.LayerGroup && layer.contains(this._layers[i])) {
                        utils.error('Cannot add layer to the group: the layer is already in the group');
                    }
                }

                this._layers.push(layer);
                this.fire('layerAdd', {layer: layer});
            }
        },

        removeLayer: function(layer, recurse) {
            if (!(layer instanceof sGis.Layer) && !(layer instanceof sGis.LayerGroup)) utils.error('sGis.Layer instance is expected but got ' + layer + ' instead');
            var index = this._layers.indexOf(layer);
            if (index !== -1) {
                this._layers.splice(index, 1);
                this.fire('layerRemove', {layer: layer});
                return;
            } else if (recurse) {
                for (var i = 0, l = this._layers.length; i < l; i++) {
                    if (this._layers[i] instanceof sGis.LayerGroup && this._layers[i].contains(layer)) {
                        this._layers[i].removeLayer(layer, true);
                        return;
                    }
                }
            }

            utils.error('The layer is not in the group');
        },

        contains: function(layer) {
            if (!(layer instanceof sGis.Layer) && !(layer instanceof sGis.LayerGroup)) utils.error('sGis.Layer instance is expected but got ' + layer + ' instead');

            for (var i = 0, l = this._layers.length; i < l; i++) {
                if (this._layers[i] instanceof sGis.LayerGroup && this._layers[i].contains(layer) || this._layers[i] === layer) {
                    return true;
                }
            }
            return false;
        },

        indexOf: function(layer) {
            return this._layers.indexOf(layer);
        },

        insertLayer: function(layer, index) {
            if (!(layer instanceof sGis.Layer) && !(layer instanceof sGis.LayerGroup)) utils.error('sGis.Layer instance is expected but got ' + layer + ' instead');
            if (!utils.isInteger(index)) utils.error('Integer is expected but got ' + index + ' instead');

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
    };

    sGis.utils.proto.setMethods(sGis.LayerGroup.prototype, sGis.IEventHandler);

    Object.defineProperties(sGis.LayerGroup.prototype, {
        layers: {
            get: function() {
                return [].concat(this._layers);
            },

            set: function(layers) {
                if (!utils.isArray(layers)) utils.error('Array is expected but got ' + layers + ' instead');
                var list = this.layers;
                for (var i = 0; i < list.length; i++) {
                    this.removeLayer(list[i]);
                }

                for (i = 0; i < layers.length; i++) {
                    this.addLayer(layers[i]);
                }
            }
        }
    });

})();