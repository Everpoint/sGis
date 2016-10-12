sGis.module('controls.PolyEditor', [
    'Control',
    'controls.Snapping',
    'geotools'
], (Control, Snapping, geotools) => {

    'use strict';

    class PolyEditor extends Control {
        constructor(map, options) {
            super(map, options);

            this._snapping = new Snapping(map);

            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDragEnd = this._handleDragEnd.bind(this);
            this._handleDblClick = this._handleDblClick.bind(this);
        }

        _activate() {
            if (!this._activeFeature) return;
            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dragEnd', this._handleDragEnd);
            this._activeFeature.on('dblclick', this._handleDblClick);
        }

        _deactivate() {
            if (!this._activeFeature) return;
            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dragEnd', this._handleDragEnd);
            this._activeFeature.off('dblclick', this._handleDblClick);
        }

        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }
        
        _handleDragStart(sGisEvent) {
            if (!this.vertexChangeAllowed && !this.featureDragAllowed) return;

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
                    this._setSnapping();
                    return;
                }

                let nextIndex = (intersection[1]+1) % ring.length;
                point = ring[nextIndex];
                let nextDist = distance(point, evPoint);
                if (nextDist < targetDist) {
                    this._activeIndex = nextIndex;
                } else {
                    this._activeFeature.insertPoint(intersection[0], intersection[1]+1, evPoint);
                    this._activeIndex = intersection[1]+1;
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

            this.fire('edit');
        }

        _handleDragEnd() {
            this._snapping.deactivate();
        }

        _handleFeatureDrag(sGisEvent) {

            geotools.move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y]);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();
            
            this.fire('edit');
        }

        _handleDblClick(sGisEvent) {
            if (!Array.isArray(sGisEvent.intersectionType)) return;

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
                this.fire('edit');
            } else if (this._activeFeature.rings.length > 1) {
                this._activeFeature.removeRing(ringIndex);
                this.fire('edit');
            } else if (this.onFeatureRemove) {
                this.onFeatureRemove();
            }
            
            if (this.activeLayer) this.activeLayer.redraw();
            sGisEvent.stopPropagation();
        }
    }

    PolyEditor.prototype.vertexSize = 7;
    PolyEditor.prototype.onFeatureRemove = null;
    PolyEditor.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];
    
    PolyEditor.prototype.vertexChangeAllowed = true;
    PolyEditor.prototype.featureDragAllowed = true;

    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
    }

    return PolyEditor;

});