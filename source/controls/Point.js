sGis.module('controls.Point', [
    'Control',
    'symbol.point.Point'
], function(/** sGis.Control */ Control, PointSymbol) {
    'use strict';

    /**
     * Control for creating point features. When active, any click on the map will create a new point feature and add it
     * to the active layer. If active layer is not set, the point feature will be given through 'drawingFinish' event.
     * @alias sGis.controls.Point
     */
    class PointControl extends Control {
        constructor(map, properties) {
            super(map, properties);
            this._handleClick = this._handleClick.bind(this);
        }

        _activate() {
            this.map.addListener('click', this._handleClick);
        }

        _deactivate() {
            this.map.removeListener('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            this.startNewFeature(sGisEvent.point);
            sGisEvent.stopPropagation();
        }

        startNewFeature(point) {
            point = point.projectTo(this.map.crs);
            var feature = new sGis.feature.Point(point.position, {crs: this.map.crs, symbol: this.symbol});

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { feature: feature });
        }
    }

    PointControl.prototype.symbol = new PointSymbol();
    
    return PointControl;

});
