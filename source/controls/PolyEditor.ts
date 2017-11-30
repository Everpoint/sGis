import {Control} from "./Control";
import {Poly} from "../features/Poly";
import {PointSymbol} from "../symbols/point/Point";
import {move, pointToLineProjection} from "../geotools";
import {Point} from "../Point";
import {PointFeature} from "../features/Point";
import {Polygon} from "../features/Polygon";

/**
 * Control for editing polyline and polygon features. When activeFeature is set, the feature becomes draggable.
 * If a vertex is dragged, the vertex position is changed. If a side is dragged, a new point is added to the side and
 * then being dragged. If inside area of the polygon is dragged, the whole polygon will change position.
 * @alias sGis.controls.PolyEditor
 * @extends sGis.Control
 * @fires sGis.controls.PolyEditor#change
 * @fires sGis.controls.PolyEditor#edit
 */
export class PolyEditor extends Control {
    private _activeFeature: Poly;

    /** Distance from a vertex in pixels that will be considered as inside of the vertex. If the cursor is in this range from */
    vertexSize = 7;

    /** If user tries to remove the last point of the feature, the control will not remove it but will call this callback */
    onFeatureRemove = null;

    /** If set to false it will be not possible to change the shape of the feature. */
    vertexChangeAllowed = true;

    /** If set to false it will be not possible to move the feature as whole. */
    featureDragAllowed = true;

    ignoreEvents = false;
    vertexHoverSymbol = new PointSymbol({ size: 7 });
    sideHoverSymbol = new PointSymbol({});

    private _activeRing: number;
    private _activeIndex: number;

    /**
     * @param {sGis.Map} map - map object the control will work with
     * @param {Object} [options] - key-value set of properties to be set to the instance
     */
    constructor(map, {snappingProvider = null, activeLayer = null, isActive = false, onFeatureRemove = null} = {}) {
        super(map, {snappingProvider, activeLayer, useTempLayer: true});

        this.onFeatureRemove = onFeatureRemove;

        this._handleMousemove = this._handleMousemove.bind(this);
        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        this._handleDblClick = this._handleDblClick.bind(this);

        this.isActive = isActive;
    }

    _activate() {
        if (!this._activeFeature) return;

        this._activeFeature.on('mousemove mouseout', this._handleMousemove);
        this._activeFeature.on('dragStart', this._handleDragStart);
        this._activeFeature.on('drag', this._handleDrag);
        this._activeFeature.on('dragEnd', this._handleDragEnd);
        this._activeFeature.on('dblclick', this._handleDblClick);
    }

    _deactivate() {
        if (!this._activeFeature) return;

        this._activeFeature.off('mousemove mouseout', this._handleMousemove);
        this._activeFeature.off('dragStart', this._handleDragStart);
        this._activeFeature.off('drag', this._handleDrag);
        this._activeFeature.off('dragEnd', this._handleDragEnd);
        this._activeFeature.off('dblclick', this._handleDblClick);
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
        if (this.ignoreEvents || !this.vertexChangeAllowed || this._activeRing !== null || this._activeIndex !== null || sGisEvent.type === 'mouseout') {
            this._tempLayer.features = [];
        }

        let intersection = sGisEvent.intersectionType;
        if (!Array.isArray(intersection)) return;

        let activeRing = intersection[0];
        let activeIndex = intersection[1];

        let ring = this._activeFeature.rings[activeRing];
        let firstPoint = this._getProjectedPoint(ring[activeIndex], this._activeFeature.crs);
        let evPoint = sGisEvent.point.position;

        let symbol = this.vertexHoverSymbol;

        let targetDist = this.vertexSize * this.map.resolution;
        let point = firstPoint;
        let currDist = distance(point, evPoint);
        if (currDist > targetDist) {
            let nextIndex = (activeIndex+1) % ring.length;
            point = this._getProjectedPoint(ring[nextIndex], this._activeFeature.crs);
            let nextDist = distance(point, evPoint);
            if (nextDist > targetDist) {
                symbol = this.sideHoverSymbol;
                point = pointToLineProjection(evPoint, [firstPoint, point]);
            }
        }

        let feature = new PointFeature(point, {crs: this.map.crs, symbol: symbol});
        this._tempLayer.features = [feature];
    }

    _getProjectedPoint(position, fromCrs) {
        return new Point(position, fromCrs).projectTo(this.map.crs).position;
    }

    _handleDragStart(sGisEvent) {
        if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed) return;

        let intersection = sGisEvent.intersectionType;
        if (Array.isArray(intersection) && this.vertexChangeAllowed) {
            let ring = this._activeFeature.rings[intersection[0]];
            let point = this._getProjectedPoint(ring[intersection[1]], this._activeFeature.crs);
            let evPoint = sGisEvent.point.position;

            this._activeRing = intersection[0];

            let targetDist = this.vertexSize * this.map.resolution;
            let currDist = distance(point, evPoint);
            if (currDist < targetDist) {
                this._activeIndex = intersection[1];
            } else {
                let nextIndex = (intersection[1]+1) % ring.length;
                point = this._getProjectedPoint(ring[nextIndex], this._activeFeature.crs);
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
    }

    _handleDrag(sGisEvent) {
        if (this._activeRing === null) return this._handleFeatureDrag(sGisEvent);

        this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snap(
            sGisEvent.point.position,
            sGisEvent.browserEvent.altKey,
            this._activeFeature.rings[this._activeRing],
            this._activeIndex,
            this._activeFeature instanceof Polygon
        ));
        this._activeFeature.redraw();
        if (this.activeLayer) this.activeLayer.redraw();
        this.fire('change', { ringIndex: this._activeRing, pointIndex: this._activeIndex });
    }

    _handleDragEnd() {
        this._activeRing = null;
        this._activeIndex = null;

        this.fire('edit');
    }

    _handleFeatureDrag(sGisEvent) {
        move([this._activeFeature], [-sGisEvent.offset.x, -sGisEvent.offset.y], this.map.crs);
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

function distance(p1, p2) {
    return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
}

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
