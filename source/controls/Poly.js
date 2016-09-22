sGis.module('controls.Poly', [
    'utils',
    'Control',
    'FeatureLayer'
], function(utils, Control, FeatureLayer) {
    'use strict';

    class PolyControl extends Control {
        constructor(FeatureClass, symbol, map, options) {
            super(map, options);

            this.symbol = symbol;
            this._getNewFeature = function(rings, options) {
                return new FeatureClass(rings, options);
            };

            this._handleClick = this._handleClick.bind(this);
            this._handleMousemove = this._handleMousemove.bind(this);
            this._handleDblclick = this._handleDblclick.bind(this);
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
            this.map.on('click', this._handleClick);
        }

        _deactivate() {
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this.map.off('click', this._handleClick);
        }

        _handleClick(sGisEvent) {
            setTimeout(() => {
                if (Date.now() - this._dblClickTime < 30) return;
                if (this._activeFeature) {
                    if (sGisEvent.ctrlKey) {
                        this.startNewRing();
                    } else {
                        this._activeFeature.addPoint(sGisEvent.point, this._activeFeature.rings.length - 1);
                    }
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

            this._activeFeature = this._getNewFeature([point.position, point.position], { crs: this.map.crs, symbol: this.symbol });
            this._tempLayer.add(this._activeFeature);

            this.map.addListener('mousemove', this._handleMousemove);
            this.map.addListener('dblclick', this._handleDblclick);
        }

        _handleMousemove(sGisEvent) {
            let ringIndex = this._activeFeature.rings.length - 1;
            let pointIndex = this._activeFeature.rings[ringIndex].length - 1;

            this._activeFeature.rings[ringIndex][pointIndex] = sGisEvent.point.position;
            this._activeFeature.redraw();
            this._tempLayer.redraw();
        }

        _handleDblclick(sGisEvent) {
            let feature = this._activeFeature;
            this.finishDrawing(self, sGisEvent);
            sGisEvent.stopPropagation();
            this._dblClickTime = Date.now();
            this.fire('drawingFinish', { geom: feature, browserEvent: sGisEvent.browserEvent });
        }

        cancelDrawing() {
            if (!this._activeFeature) return;

            this._tempLayer.remove(this._activeFeature);
            this._activeFeature = null;
        }

        finishDrawing() {
            let feature = this._activeFeature;
            let ringIndex = feature.rings.length - 1;

            this.cancelDrawing();
            if (ringIndex === 0 && feature.rings[ringIndex].length < 3) return;

            feature.removePoint(ringIndex, feature.rings[ringIndex].length - 1);

            this._map.removeListener('mousemove', this._handleMousemove);
            this._map.removeListener('dblclick', this._handleDblclick);

            if (this.activeLayer) this.activeLayer.add(feature);
        }

        startNewRing() {
            let rings = this._activeFeature.rings;
            let ringIndex = rings.length;
            let point = rings[ringIndex-1][rings[ringIndex-1].length-1];
            this._activeFeature.setRing(ringIndex, [point]);
        }

        get activeFeature() { return this._activeFeature; }
    }
    
    return PolyControl;
    
});
