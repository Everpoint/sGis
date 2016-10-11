sGis.module('controls.PolyEditor', [
    'Control',
    'geotools'
], (Control, geotools) => {

    'use strict';

    class PolyEditor extends Control {
        constructor(map, options) {
            super(map, options);
            this._handleDragStart = this._handleDragStart.bind(this);
            this._handleDrag = this._handleDrag.bind(this);
            this._handleDblClick = this._handleDblClick.bind(this);
        }

        _activate() {
            if (!this._activeFeature) return;
            this._activeFeature.on('dragStart', this._handleDragStart);
            this._activeFeature.on('drag', this._handleDrag);
            this._activeFeature.on('dblclick', this._handleDblClick);
        }

        _deactivate() {
            if (!this._activeFeature) return;
            this._activeFeature.off('dragStart', this._handleDragStart);
            this._activeFeature.off('drag', this._handleDrag);
            this._activeFeature.off('dblclick', this._handleDblClick);
        }

        get activeFeature() { return this._activeFeature; }
        set activeFeature(feature) {
            this.deactivate();
            this._activeFeature = feature;
            this.activate();
        }
        
        _handleDragStart(sGisEvent) {
            sGisEvent.draggingObject = this._activeFeature;
            sGisEvent.stopPropagation();

            let intersection = sGisEvent.intersectionType;
            if (Array.isArray(intersection)) {
                let ring = this._activeFeature.rings[intersection[0]];
                let point = ring[intersection[1]];
                let evPoint = sGisEvent.point.projectTo(this._activeFeature.crs).position;

                this._activeRing = intersection[0];

                let targetDist = this.vertexSize * this.map.resolution;
                let currDist = distance(point, evPoint);
                if (currDist < targetDist) {
                    this._activeIndex = intersection[1];
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
        }
        
        _handleDrag(sGisEvent) {
            if (this._activeRing === null) return this._handleFeatureDrag(sGisEvent);

            this._activeFeature.rings[this._activeRing][this._activeIndex] = sGisEvent.point.projectTo(this._activeFeature.crs).position;
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();
        }

        _handleFeatureDrag(sGisEvent) {
            geotools.move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y]);
            this._activeFeature.redraw();
            if (this.activeLayer) this.activeLayer.redraw();
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
            } else if (this._activeFeature.rings.length > 1) {
                this._activeFeature.removeRing(ringIndex);
            } else if (this.onFeatureRemove) {
                this.onFeatureRemove();
            }
            
            if (this.activeLayer) this.activeLayer.redraw();
            sGisEvent.stopPropagation();
        }
    }

    PolyEditor.prototype.vertexSize = 7;
    PolyEditor.prototype.onFeatureRemove = null;

    function distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
    }

    return PolyEditor;

});