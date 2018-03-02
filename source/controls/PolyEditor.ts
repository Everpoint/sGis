import {ChangeEvent, Control, ControlParams, EditEvent} from "./Control";
import {Poly} from "../features/Poly";
import {move} from "../geotools";
import {Point} from "../Point";
import {Polygon} from "../features/Polygon";
import {DragEndEvent, DragEvent, DragStartEvent, sGisDoubleClickEvent, sGisMouseMoveEvent} from "../commonEvents";
import {Coordinates} from "../baseTypes";
import {Crs} from "../Crs";
import {PolySnappingProvider} from "./snapping/PolySnappingProvider";
import {lineSnapping, vertexSnapping} from "./snapping/SnappingMethods";

export interface PolyEditorParams extends ControlParams {
    onFeatureRemove?: () => void,
    hoverSnappingProvider?: PolySnappingProvider;
}

/**
 * Control for editing polyline and polygon features. When activeFeature is set, the feature becomes draggable.
 * If a vertex is dragged, the vertex position is changed. If a side is dragged, a new point is added to the side and
 * then being dragged. If inside area of the polygon is dragged, the whole polygon will change position.
 * @alias sGis.controls.PolyEditor
 * @fires [[EditEvent]]
 * @fires [[ChangeEvent]]
 */
export class PolyEditor extends Control {
    private _activeFeature: Poly;

    /** Distance from a vertex in pixels that will be considered as inside of the vertex. If the cursor is in this range from */
    vertexSize: number = 7;

    /** If user tries to remove the last point of the feature, the control will not remove it but will call this callback */
    onFeatureRemove: () => void = null;

    /** If set to false it will be not possible to change the shape of the feature. */
    vertexChangeAllowed: boolean = true;

    /** If set to false it will be not possible to move the feature as whole. */
    featureDragAllowed: boolean = true;

    ignoreEvents: boolean = false;

    private _activeRing: number | null;
    private _activeIndex: number | null;

    hoverSnappingProvider: PolySnappingProvider | null;

    /**
     * @param map - map object the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map, {isActive = false, onFeatureRemove = null, hoverSnappingProvider, ...controlParams}: PolyEditorParams = {}) {
        super(map, {useTempLayer: true, ...controlParams});

        this.onFeatureRemove = onFeatureRemove;

        this._handleMousemove = this._handleMousemove.bind(this);
        this._handleDragStart = this._handleDragStart.bind(this);
        this._handleDrag = this._handleDrag.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
        this._handleDblClick = this._handleDblClick.bind(this);

        if (hoverSnappingProvider === undefined) {
            this.hoverSnappingProvider = new PolySnappingProvider(map, {snappingMethods: [vertexSnapping, lineSnapping]});
        }

        this.isActive = isActive;
    }

    protected _activate(): void {
        if (!this._activeFeature) return;

        this.map.on(sGisMouseMoveEvent.type, this._handleMousemove);

        this._activeFeature.on(DragStartEvent.type, this._handleDragStart);
        this._activeFeature.on(DragEvent.type, this._handleDrag);
        this._activeFeature.on(DragEndEvent.type, this._handleDragEnd);
        this._activeFeature.on(sGisDoubleClickEvent.type, this._handleDblClick);

        this.hoverSnappingProvider.feature = this._activeFeature;
    }

    _deactivate() {
        if (!this._activeFeature) return;

        this.map.off(sGisMouseMoveEvent.type, this._handleMousemove);

        this._activeFeature.off(DragStartEvent.type, this._handleDragStart);
        this._activeFeature.off(DragEvent.type, this._handleDrag);
        this._activeFeature.off(DragEndEvent.type, this._handleDragEnd);
        this._activeFeature.off(sGisDoubleClickEvent.type, this._handleDblClick);
    }

    /**
     * Feature to edit. If set to null, the control is deactivated.
     */
    get activeFeature(): Poly | null { return this._activeFeature; }
    set activeFeature(feature: Poly | null) {
        this.deactivate();
        this._activeFeature = feature;
        if (feature) this.activate();
    }

    private _handleMousemove(event: sGisMouseMoveEvent): void {
        if (this.ignoreEvents) {
            this._unsnap();
            return;
        }

        this._snap(event.point.position, event.browserEvent.altKey, undefined, undefined, undefined, this.hoverSnappingProvider);
    }

    private _getProjectedPoint(position: Coordinates, fromCrs: Crs): Coordinates {
        return new Point(position, fromCrs).projectTo(this.map.crs).position;
    }

    private _handleDragStart(event: DragStartEvent): void {
        if (this.ignoreEvents || !this.vertexChangeAllowed && !this.featureDragAllowed) return;

        this._activeRing = event.contourIndex;
        this._activeIndex = event.pointIndex;

        if (this._activeRing !== null && this._activeIndex !== null && this.vertexChangeAllowed) {
            let ring = this._activeFeature.rings[this._activeRing];
            let point = this._getProjectedPoint(ring[this._activeIndex], this._activeFeature.crs);
            let evPoint = event.point.position;

            let targetDist = this.vertexSize * this.map.resolution;
            let currDist = distance(point, evPoint);
            if (currDist >= targetDist) {
                let nextIndex = (this._activeIndex+1) % ring.length;
                point = this._getProjectedPoint(ring[nextIndex], this._activeFeature.crs);
                let nextDist = distance(point, evPoint);
                if (nextDist < targetDist) {
                    this._activeIndex = nextIndex;
                } else {
                    this._activeFeature.insertPoint(this._activeRing, this._activeIndex + 1, evPoint);
                    this._activeIndex = this._activeIndex + 1;
                }
            }
        }

        if (this._activeRing !== null || this.featureDragAllowed) {
            event.draggingObject = this._activeFeature;
            event.stopPropagation();
        }
    }

    private _handleDrag(event: DragEvent): void {
        if (this._activeRing === null) return this._handleFeatureDrag(event);

        this._activeFeature.setPoint(this._activeRing, this._activeIndex, this._snap(
            event.point.position,
            event.browserEvent.altKey,
            this._activeFeature.rings[this._activeRing],
            this._activeIndex,
            this._activeFeature instanceof Polygon
        ));
        this._activeFeature.redraw();
        if (this.activeLayer) this.activeLayer.redraw();
        this.fire(new ChangeEvent(this._activeRing, this._activeIndex));
    }

    private _handleDragEnd(): void {
        this._activeRing = null;
        this._activeIndex = null;

        this.fire(new EditEvent());
    }

    private _handleFeatureDrag(event: DragEvent): void {
        move([this._activeFeature], [-event.offset[0], -event.offset[1]], this.map.crs);
        this._activeFeature.redraw();
        if (this.activeLayer) this.activeLayer.redraw();

        this.fire(new ChangeEvent());
    }

    private _handleDblClick(event: sGisDoubleClickEvent): void {
        if (this.ignoreEvents || event.contourIndex === null || event.pointIndex === null) return;

        let ringIndex = event.contourIndex;
        let ring = this._activeFeature.rings[ringIndex];

        let index = event.pointIndex;
        let evPoint = event.point.projectTo(this._activeFeature.crs).position;
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
        this._unsnap();

        if (this.activeLayer) this.activeLayer.redraw();
        event.stopPropagation();
    }
}

function distance(p1, p2) {
    return Math.sqrt((p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]));
}
