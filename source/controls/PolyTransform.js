sGis.module('controls.PolyTransform', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'symbol.point.Square',
    'geotools'
], (Control, FeatureLayer, PointFeature, PointSymbol, SquareSymbol, geotools) => {
    
    'use strict';
    
    class PolyTransform extends Control {
        constructor(map, options) {
            super(map, options);

            this._handleRotationStart = this._handleRotationStart.bind(this);
            this._handleRotation = this._handleRotation.bind(this);
            this._handleRotationEnd = this._handleRotationEnd.bind(this);
            
            this._handleScalingEnd = this._handleScalingEnd.bind(this);
        }
        
        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }
        
        update() { if (this._activeFeature) this._updateHandles(); }
        
        _activate() {
            if (!this._activeFeature) return;
            
            this._tempLayer = new FeatureLayer();
            this._setHandles();
            this.map.addLayer(this._tempLayer);
        }
        
        _deactivate() {
            if (!this._activeFeature) return;
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
        }
        
        _setHandles() {
            if (this.enableRotation) this._setRotationHandle();
            if (this.enableScaling) this._setScaleHandles();
        }
        
        _setRotationHandle() {
            this._rotationHandle = new PointFeature([0, 0], {crs: this._activeFeature.crs, symbol: this.rotationHandleSymbol});
            this._updateRotationHandle();
            this._rotationHandle.on('dragStart', this._handleRotationStart);
            this._rotationHandle.on('drag', this._handleRotation);
            this._rotationHandle.on('dragEnd', this._handleRotationEnd);
            this._tempLayer.add(this._rotationHandle);
        }
        
        _setScaleHandles() {
            this._scaleHandles = [];
            for (let i = 0; i < 9; i++) {
                if (i === 4) continue;

                let symbol = this.scaleHandleSymbol.clone();
                let xk = i % 3 - 1;
                let yk = 1- Math.floor(i/3);
                symbol.offset = { x: this.scaleHandleOffset * xk, y: this.scaleHandleOffset * yk };

                this._scaleHandles[i] = new PointFeature([0, 0], {symbol: symbol, crs: this._activeFeature.crs});
                this._scaleHandles[i].on('dragStart', this._handleScalingStart.bind(this, i));
                this._scaleHandles[i].on('drag', this._handleScaling.bind(this, i));
                this._scaleHandles[i].on('dragEnd', this._handleScalingEnd);
            }
            
            this._tempLayer.add(this._scaleHandles);
            this._updateScaleHandles();
        }

        _handleRotationStart(sGisEvent) {
            this._rotationBase = this._activeFeature.bbox.center.position;
            sGisEvent.draggingObject = this._rotationHandle;
            sGisEvent.stopPropagation();

            this.fire('rotationStart');
        }

        _handleRotation(sGisEvent) {
            let xPrev = sGisEvent.point.x + sGisEvent.offset.x;
            let yPrev = sGisEvent.point.y + sGisEvent.offset.y;

            let alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
            let alpha2 = sGisEvent.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(sGisEvent.point.y - this._rotationBase[1], sGisEvent.point.x - this._rotationBase[0]);
            let angle = alpha2 - alpha1;

            geotools.rotate(this._activeFeature, angle, this._rotationBase);
            if (this.activeLayer) this.activeLayer.redraw();
            this._updateHandles();
        }
        
        _handleRotationEnd() {
            this.fire('rotationEnd');
        }

        _updateHandles() {
            if (this.enableRotation) this._updateRotationHandle();
            if (this.enableScaling) this._updateScaleHandles();

            this._tempLayer.redraw();
        }

        _updateRotationHandle() {
            let bbox = this._activeFeature.bbox;
            this._rotationHandle.position = [(bbox.xMin + bbox.xMax)/2, bbox.yMax];
        }

        _updateScaleHandles() {
            let bbox = this._activeFeature.bbox;
            let xs = [bbox.xMin, (bbox.xMin + bbox.xMax)/2, bbox.xMax];
            let ys = [bbox.yMin, (bbox.yMin + bbox.yMax)/2, bbox.yMax];

            for (let i = 0; i < 9; i++) {
                if (i === 4) continue;
                this._scaleHandles[i].position = [xs[i%3], ys[Math.floor(i/3)]];
            }
        }

        _handleScalingStart(index, sGisEvent) {
            sGisEvent.draggingObject = this._scaleHandles[index];
            sGisEvent.stopPropagation();
            
            this.fire('scalingStart');
        }

        _handleScaling(index, sGisEvent) {
            const MIN_SIZE = 10;
            let xIndex = index % 3;
            let yIndex = Math.floor(index / 3);

            let baseX = xIndex === 0 ? 2 : xIndex === 2 ? 0 : 1;
            let baseY = yIndex === 0 ? 2 : yIndex === 2 ? 0 : 1;
            let basePoint = this._scaleHandles[baseX + 3 * baseY].position;

            let bbox = this._activeFeature.bbox;
            let resolution = this.map.resolution;
            let tolerance = MIN_SIZE * resolution;
            let width = bbox.width;
            let xScale = baseX === 1 ? 1 : (width + (baseX - 1) * sGisEvent.offset.x) / width;
            if (width < tolerance && xScale < 1) xScale = 1;
            let height = bbox.height;
            let yScale = baseY === 1 ? 1 : (height + (baseY - 1) * sGisEvent.offset.y) / height;
            if (height < tolerance && yScale < 1) yScale = 1;

            geotools.scale(this._activeFeature, [xScale, yScale], basePoint);
            if (this.activeLayer) this.activeLayer.redraw();
            this._updateHandles();
        }

        _handleScalingEnd() {
            this.fire('scalingEnd');
        }
    }

    PolyTransform.prototype.rotationHandleSymbol = new PointSymbol({offset: {x: 0, y: -30}});
    PolyTransform.prototype.scaleHandleSymbol = new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });
    PolyTransform.prototype.scaleHandleOffset = 12;
    
    PolyTransform.prototype.enableRotation = true;
    PolyTransform.prototype.enableScaling = true;
    
    return PolyTransform;
    
});