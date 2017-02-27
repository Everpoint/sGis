sGis.module('controls.PolyEditor', [
    'Control',
    'controls.Snapping',
    'geotools',
    'symbol.point.Point',
    'FeatureLayer',
    'feature.Point'
], (Control, Snapping, geotools, PointSymbol, FeatureLayer, Point) => {

    'use strict';

    /**
     * Control for editing polyline and polygon features. When activeFeature is set, the feature becomes draggable.
     * If a vertex is dragged, the vertex position is changed. If a side is dragged, a new point is added to the side and
     * then being dragged. If inside area of the polygon is dragged, the whole polygon will change position.
     * @alias sGis.controls.PolyEditor
     * @extends sGis.Control
     * @fires sGis.controls.PolyEditor#change
     * @fires sGis.controls.PolyEditor#edit
     */
    class PolyEditor extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options = {}) {
            super(map, options);

            this._snapping = new Snapping(map);

            this._handleMousemove = this._handleMousemove.bind(this);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this._handleDblClick = this._handleDblClick.bind(this);

            this.isActive = options.isActive;
        }

        _activate() {
            if (!this._activeFeature) return;
            this._setTempLayer();

            this._activeFeature.on('mousemove mouseout', this._handleMousemove);
            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dragEnd', this._handleDragEnd);
            this._activeFeature.on('dblclick', this._handleDblClick);
        }

        _deactivate() {
            if (!this._activeFeature) return;
            this._removeTempLayer();

            this._activeFeature.off('mousemove mouseout', this._handleMousemove);
            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dragEnd', this._handleDragEnd);
            this._activeFeature.off('dblclick', this._handleDblClick);
        }

        _setTempLayer() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
        }

        _removeTempLayer() {
            if (!this._tempLayer) return;
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
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

        _handleMousemove(sGisEvent) {
            if (this.ignoreEvents || !this.vertexChangeAllowed || this._activeRing !== null || this._activeIndex !== null || sGisEvent.eventType === 'mouseout') {
                this._tempLayer.features = [];
            }

            let intersection = sGisEvent.intersectionType;
            if (!Array.isArray(intersection)) return;

            let activeRing = intersection[0];
            let activeIndex = intersection[1];

            let ring = this._activeFeature.rings[activeRing];
            let point = ring[activeIndex];
            let evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;

            let symbol = this.vertexHoverSymbol;

            let targetDist = this.vertexSize * this.map.resolution;
            let currDist = distance(point, evPoint);
            if (currDist > targetDist) {
                let nextIndex = (activeIndex+1) % ring.length;
                point = ring[nextIndex];
                let nextDist = distance(point, evPoint);
                if (nextDist > targetDist) {
                    symbol = this.sideHoverSymbol;
                    point = geotools.pointToLineProjection(evPoint, [ring[activeIndex], point]);
                }
            }

            let feature = new Point(point, {crs: this.map.crs, symbol: symbol});
            this._tempLayer.features = [feature];
        }
        
        _handleDragStart(sGisEvent) {
            if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed) return;

            let intersection = sGisEvent.intersectionType;
            if (Array.isArray(intersection) && this.vertexChangeAllowed) {
                let ring = this._activeFeature.rings[intersection[0]];
                let point = ring[intersection[1]];
                let evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;

                this._activeRing = intersection[0];

                let targetDist = this.vertexSize * this.map.resolution;
                let currDist = distance(point, evPoint);
                if (currDist < targetDist) {
                    this._activeIndex = intersection[1];
                } else {
                    let nextIndex = (intersection[1]+1) % ring.length;
                    point = ring[nextIndex];
                    let nextDist = distance(point, evPoint);
                    if (nextDist < targetDist) {
                        this._activeIndex = nextIndex;
                    } else {
                        this._activeFeature.insertPoint(intersection[0], intersection[1]+1, evPoint);
                        this._activeIndex = intersection[1]+1;
                    }
                }
            } else {
                this._activeRing = this._activeIndex = null;
            }

            if (this._activeRing !== null || this.featureDragAllowed) {
                sGisEvent.draggingObject = this._activeFeature;
                sGisEvent.stopPropagation();
            }

            this._setSnapping();
        }

        _setSnapping() {
            if (this._activeRing === null || !this.snappingTypes) return;

            this._snapping.activeLayer = this.activeLayer;
            this._snapping.snappingTypes = this.snappingTypes;
            this._snapping.activeFeature = this._activeFeature;
            this._snapping.activeRingIndex = this._activeRing;
            this._snapping.activePointIndex = this._activeIndex;

            this._snapping.activate();
        }
        
        _handleDrag(sGisEvent) {
            if (this._activeRing === null) return this._handleFeatureDrag(sGisEvent);

            this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snapping.position || sGisEvent.point.projectTo(this._activeFeature.crs).position);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();
            this.fire('change', { ringIndex: this._activeRing, pointIndex: this._activeIndex });
        }

        _handleDragEnd() {
            this._snapping.deactivate();
            this._activeRing = null;
            this._activeIndex = null;

            this.fire('edit');
        }

        _handleFeatureDrag(sGisEvent) {
            geotools.move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y]);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();

            this.fire('change');
        }

        _handleDblClick(sGisEvent) {
            if (this.ignoreEvents || !Array.isArray(sGisEvent.intersectionType)) return;

            let ringIndex = sGisEvent.intersectionType[0];
            let ring = this._activeFeature.rings[ringIndex];

            let index = sGisEvent.intersectionType[1];
            let evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;
            let d1 = distance(evPoint, ring[index]);

            let nextIndex = (index+1)%ring.length;
            let d2 = distance(evPoint, ring[nextIndex]);

            if (d2 < d1) index = nextIndex;

            if (ring.length > 2) {
                this._activeFeature.removePoint(ringIndex, index);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
            } else if (this._activeFeature.rings.length > 1) {
                this._activeFeature.removeRing(ringIndex);
                this.fire('edit', { ringIndex: ringIndex, pointIndex: index });
            } else if (this.onFeatureRemove) {
                this.onFeatureRemove();
            }
            
            if (this.activeLayer) this.activeLayer.redraw();
            sGisEvent.stopPropagation();
        }
    }

    /**
     * Distance from a vertex in pixels that will be considered as inside of the vertex. If the cursor is in this range from
     * a vertex then the vertex will be dragged.
     * @member {Number} sGis.controls.PolyEditor#vertexSize
     * @default 7
     */
    PolyEditor.prototype.vertexSize = 7;

    /**
     * If user tries to remove the last point of the feature, the control will not remove it but will call this callback
     * function instead. The function is called without any arguments.
     * @member {Function} sGis.controls.PolyEditor#onFeatureRemove
     * @default null
     */
    PolyEditor.prototype.onFeatureRemove = null;

    /**
     * Specifies which snapping functions to use. See {sGis.controls.Snapping#snappingTypes}.
     * @member {String[]} sGis.controls.PolyEditor#snappingTypes
     * @default ['vertex', 'midpoint', 'line', 'axis', 'orthogonal']
     */
    PolyEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    /**
     * If set to false it will be not possible to change the shape of the feature.
     * @member {Boolean} sGis.controls.PolyEditor#vertexChangeAllowed
     * @default true
     */
    PolyEditor.prototype.vertexChangeAllowed = true;

    /**
     * If set to false it will be not possible to move the feature as whole.
     * @member {Boolean} sGis.controls.PolyEditor#featureDragAllowed
     * @default true
     */
    PolyEditor.prototype.featureDragAllowed = true;
    
    PolyEditor.prototype.ignoreEvents = false;

    PolyEditor.prototype.vertexHoverSymbol = new PointSymbol({ size: 7 });

    PolyEditor.prototype.sideHoverSymbol = new PointSymbol({});

    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
    }

    return PolyEditor;

    /**
     * The feature is being dragged (one or more points is changed due to user interaction).
     * @event sGis.controls.PolyEditor#change
     * @type {Object}
     * @mixes sGisEvent
     */

    /**
     * Dragging of the feature if finished and the feature is released.
     * @event sGis.controls.PolyEditor#edit
     * @type {Object}
     * @mixes sGisEvent
     */

});