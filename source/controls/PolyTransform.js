sGis.module('controls.PolyTransform', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'symbol.point.Square',
    'geotools'
], (
    /** function(new:sGis.Control) */ Control,
    /** function(new:sGis.FeatureLayer) */ FeatureLayer, 
    /** function(new:sGis.feature.Point) */ PointFeature, 
    /** function(new:sGis.symbol.point.Point) */ PointSymbol, 
    /** function(new:sGis.symbol.point.Square) */ SquareSymbol, 
    /** sGis.geotools */ geotools) => {
    
    'use strict';

    /**
     * Control for modifying polylines or polygons as whole. When activeFeature is set, it shows points around the feature
     * dragging which one can scale or rotate the feature.
     * @alias sGis.controls.PolyTransform
     * @extends sGis.Control
     * @fires sGis.controls.PolyTransform#rotationStart
     * @fires sGis.controls.PolyTransform#rotationEnd
     * @fires sGis.controls.PolyTransform#scalingStart
     * @fires sGis.controls.PolyTransform#scalingEnd
     */
    class PolyTransform extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._handleRotationStart = this._handleRotationStart.bind(this);
            this._handleRotation = this._handleRotation.bind(this);
            this._handleRotationEnd = this._handleRotationEnd.bind(this);
            
            this._handleScalingEnd = this._handleScalingEnd.bind(this);

            this.isActive = options.isActive;
        }

        /**
         * Feature to edit. If set to null, the control is deactivated.
         * @type {sGis.feature.Poly}
         */
        get activeFeature() { return this._activeFeature; }
        set activeFeature(/** sGis.feature.Poly */ feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }

        /**
         * Updates position of the editor handles.
         */
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
            if (this.ignoreEvents) return;

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
            if (this.ignoreEvents) return;
            
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

    /**
     * Symbol of the rotation handle.
     * @member {sGis.Symbol} sGis.controls.PolyTransform#rotationHandleSymbol
     * @default new PointSymbol({offset: {x: 0, y: -30}})
     */
    PolyTransform.prototype.rotationHandleSymbol = new PointSymbol({offset: {x: 0, y: -30}});

    /**
     * Symbol of the scaling handles.
     * @member {sGis.Symbol} sGis.controls.PolyTransform#scaleHandleSymbol
     * #default new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 })
     */
    PolyTransform.prototype.scaleHandleSymbol = new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });

    /**
     * Distance in pixels between scaling handles and feature bbox.
     * @member {Number} sGis.controls.PolyTransform#scaleHandleOffset
     * @default 12
     */
    PolyTransform.prototype.scaleHandleOffset = 12;

    /**
     * If set to false the rotation handle will not be displayed.
     * @member {Boolean} sGis.controls.PolyTransform#enableRotation
     * @default true
     */
    PolyTransform.prototype.enableRotation = true;

    /**
     * If set to false the scaling handle will not be displayed.
     * @member {Boolean} sGis.controls.PolyTransform#enableScaling
     * @default true
     */
    PolyTransform.prototype.enableScaling = true;

    PolyTransform.prototype.ignoreEvents = false;
    
    return PolyTransform;

    /**
     * Rotation has started.
     * @event sGis.controls.PolyTransform#rotationStart
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Rotation has ended.
     * @event sGis.controls.PolyTransform#rotationEnd
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Scaling has started.
     * @event sGis.controls.PolyTransform#scalingStart
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Scaling has ended.
     * @event sGis.controls.PolyTransform#scalingEnd
     * @type {Object}
     * @mixes sGisEvent
     */

});