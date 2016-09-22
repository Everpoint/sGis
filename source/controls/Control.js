sGis.module('Control', [
    'utils',
    'FeatureLayer',
    'EventHandler'
], function(utils, FeatureLayer, /** sGis.EventHandler */ EventHandler) {
    'use strict';

    /**
     * @alias sGis.Control
     */
    class Control extends EventHandler {
        constructor(map, properties) {
            super();
            this._map = map;
            utils.init(this, properties, true);
        }

        activate() {
            this.isActive = true;
        }
        
        deactivate() {
            this.isActive = false;
        }
        
        _activate() {
            // abstract method, must be implemented in child
        }

        _deactivate() {
            // abstract method, must be implemented in child
        }
        
        get activeLayer() { return this._activeLayer; }
        set activeLayer(layer) { this._activeLayer = layer; }

        get isActive() { return this._isActive; }
        set isActive(bool) {
            bool = !!bool;
            if (this._isActive === bool) return;
            this._isActive = bool;

            if (bool) {
                this._activate();
            } else {
                this._deactivate();
            }

        }

        get map() { return this._map; }
    }

    Control.prototype._isActive = false;

    return Control;

});
