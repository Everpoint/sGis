sGis.module('controls.MultiPoint', [
    'utils',
    'Control',
    'FeatureLayer',
    'symbol.point.Point',
    'feature.MultiPoint'
], function(utils, Control, FeatureLayer, PointSymbol, MultiPointFeature) {

    'use strict';

    class MultiPoint extends Control {
        constructor(map, properties) {
            super(map, properties);
            this._handleClick = this._handleClick.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);

            this.map.on('click', this._handleClick);
        }

        _deactivate() {
            this.cancelDrawing();
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this.map.off('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < this.dblClickTimeout) return;
                if (this._activeFeature) {
                    this._activeFeature.addPoint(sGisEvent.point);
                } else {
                    this.startNewFeature(sGisEvent.point);
                    this.fire('drawingBegin');
                }
                this.fire('pointAdd');

                this._tempLayer.redraw();
            }, 10);

            sGisEvent.stopPropagation();
        }

        startNewFeature(point) {
            this.activate();
            this.cancelDrawing();

            this._activeFeature = new MultiPointFeature([point.position], { crs: this.map.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);

            this._setHandlers();
        }

        _setHandlers() {
            this.map.addListener('dblclick', this._handleDblclick);
        }

        cancelDrawing() {
            if (!this._activeFeature) return;

            this.map.removeListener('dblclick', this._handleDblclick);

            if (this._tempLayer.has(this._activeFeature)) this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }

        _handleDblclick(sGisEvent) {
            let feature = this._activeFeature;
            this.finishDrawing(self, sGisEvent);
            sGisEvent.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire('drawingFinish', { feature: feature, browserEvent: sGisEvent.browserEvent });
        }

        finishDrawing() {
            let feature = this._activeFeature;
            this.cancelDrawing();
            if (this.activeLayer) this.activeLayer.add(feature);
        }

        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            if (!this._isActive) return;
            this.cancelDrawing();

            this._activeFeature = feature;
            this._setHandlers();
        }
    }

    MultiPoint.prototype.dblClickTimeout = 30;
    MultiPoint.prototype.symbol = new PointSymbol();

    return MultiPoint;

});
