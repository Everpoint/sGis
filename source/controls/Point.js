sGis.module('controls.Point', [
    'Control',
    'symbol.point.Point'
], function(/** sGis.Control */ Control, PointSymbol) {
    'use strict';

    /**
     * @alias sGis.controls.Point
     * @param map
     * @param options
     * @constructor
     */
    class PointControl extends Control {
        constructor(map, options) {
            super(map, options);
            this._addPoint = this._addPoint.bind(this);
        }

        activate() {
            if (this.isActive) return;
            this.map.addListener('click', this._addPoint);
        }

        deactivate() {
            if (!this.isActive) return;
            this.map.removeListener('click.sGis-point', this._addPoint);
        }

        _addPoint(sGisEvent) {
            this.startNewFeature(sGisEvent.point);

            sGisEvent.stopPropagation();
            sGisEvent.preventDefault();
        }

        startNewFeature(point) {
            point = point.projectTo(this.map.crs);
            var feature = new sGis.feature.Point(point.position, {crs: this.map.crs, symbol: this.symbol});

            if (this.activeLayer) this.activeLayer.add(feature);
            this.fire('drawingFinish', { geom: feature });
        }
    }

    PointControl.prototype.symbol = new PointSymbol();
    
    return PointControl;

});
