import {Control} from "./Control";
import {PointSymbol} from "../symbols/point/Point";
import {SquareSymbol} from "../symbols/point/Square";
import {Poly} from "../features/Poly";
import {PointFeature} from "../features/PointFeature";
import {rotate, scale} from "../geotools";
import {Coordinates} from "../baseTypes";
import {Symbol} from "../symbols/Symbol";
import {Map} from "../Map";
import {DragEndEvent, DragEvent, DragStartEvent} from "../commonEvents";
import {sGisEvent} from "../EventHandler";

/**
 * @event RotationStartEvent
 */
export class RotationStartEvent extends sGisEvent {
    static type: string = 'rotationStart';

    constructor() {
        super(RotationStartEvent.type);
    }
}

/**
 * @event RotationEndEvent
 */
export class RotationEndEvent extends sGisEvent {
    static type: string = 'rotationEnd';

    constructor() {
        super(RotationEndEvent.type);
    }
}

/**
 * @event ScalingStartEvent
 */
export class ScalingStartEvent extends sGisEvent {
    static type: string = 'scalingStart';

    constructor() {
        super(ScalingStartEvent.type);
    }
}

/**
 * @event ScalingEndEvent
 */
export class ScalingEndEvent extends sGisEvent {
    static type: string = 'scalingEnd';

    constructor() {
        super(ScalingEndEvent.type);
    }
}

/**
 * Control for modifying polylines or polygons as whole. When activeFeature is set, it shows points around the feature
 * dragging which one can scale or rotate the feature.
 * @alias sGis.controls.PolyTransform
 * @fires [[RotationStartEvent]]
 * @fires [[RotationEndEvent]]
 * @fires [[ScalingStartEvent]]
 * @fires [[ScalingEndEvent]]
 */
export class PolyTransform extends Control {
    /** Symbol of the rotation handle. */
    rotationHandleSymbol: Symbol<PointFeature> = new PointSymbol({offset: [0, -30]});

    /** Symbol of the scaling handles. */
    scaleHandleSymbol: Symbol<PointFeature> = new SquareSymbol({ fillColor: 'transparent', strokeColor: 'black', strokeWidth: 2, size: 7 });

    /** Distance in pixels between scaling handles and feature bbox. */
    scaleHandleOffset: number = 12;

    /** If set to false the rotation handle will not be displayed. */
    enableRotation: boolean = true;

    /** If set to false the scaling handle will not be displayed. */
    enableScaling: boolean = true;

    ignoreEvents: boolean = false;

    private _activeFeature: Poly | null;
    private _rotationHandle: PointFeature;
    private _scaleHandles: PointFeature[];
    private _rotationBase: Coordinates | null;

    /**
     * @param map - map object the control will work with
     * @param __namedParameters - key-value set of properties to be set to the instance
     */
    constructor(map: Map, {activeLayer = null, isActive = false} = {}) {
        super(map, {activeLayer, useTempLayer: true});

        this._handleRotationStart = this._handleRotationStart.bind(this);
        this._handleRotation = this._handleRotation.bind(this);
        this._handleRotationEnd = this._handleRotationEnd.bind(this);

        this._handleScalingEnd = this._handleScalingEnd.bind(this);

        this.isActive = isActive;
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

    /**
     * Updates position of the editor handles.
     */
    update(): void { if (this._activeFeature) this._updateHandles(); }

    protected _activate(): void {
        if (!this._activeFeature) return;
        this._setHandles();
    }

    protected _deactivate(): void {
        return;
    }

    private _setHandles(): void {
        if (this.enableRotation) this._setRotationHandle();
        if (this.enableScaling) this._setScaleHandles();
    }

    private _setRotationHandle(): void {
        this._rotationHandle = new PointFeature([0, 0], {crs: this.map.crs, symbol: this.rotationHandleSymbol});
        this._updateRotationHandle();

        this._rotationHandle.on(DragStartEvent.type, this._handleRotationStart);
        this._rotationHandle.on(DragEvent.type, this._handleRotation);
        this._rotationHandle.on(DragEndEvent.type, this._handleRotationEnd);

        this._tempLayer.add(this._rotationHandle);
    }

    private _setScaleHandles(): void {
        this._scaleHandles = [];
        for (let i = 0; i < 9; i++) {
            if (i === 4) continue;

            let symbol = <PointSymbol>this.scaleHandleSymbol.clone();
            let xk = i % 3 - 1;
            let yk = 1- Math.floor(i/3);
            symbol.offset = [this.scaleHandleOffset * xk, this.scaleHandleOffset * yk];

            this._scaleHandles[i] = new PointFeature([0, 0], {symbol: symbol, crs: this.map.crs});

            this._scaleHandles[i].on(DragStartEvent.type, this._handleScalingStart.bind(this, i));
            this._scaleHandles[i].on(DragEvent.type, this._handleScaling.bind(this, i));
            this._scaleHandles[i].on(DragEndEvent.type, this._handleScalingEnd);
        }

        this._tempLayer.add(this._scaleHandles);
        this._updateScaleHandles();
    }

    private _handleRotationStart(event: DragStartEvent): void {
        if (this.ignoreEvents) return;

        this._rotationBase = this._activeFeature.bbox.projectTo(this.map.crs).center;
        event.draggingObject = this._rotationHandle;
        event.stopPropagation();

        this.fire(new RotationStartEvent());
    }

    private _handleRotation(event: DragEvent): void {
        let xPrev = event.point.x + event.offset[0];
        let yPrev = event.point.y + event.offset[1];

        let alpha1 = xPrev === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(yPrev - this._rotationBase[1], xPrev - this._rotationBase[0]);
        let alpha2 = event.point.x === this._rotationBase[0] ? Math.PI / 2 : Math.atan2(event.point.y - this._rotationBase[1], event.point.x - this._rotationBase[0]);
        let angle = alpha2 - alpha1;

        rotate([this._activeFeature], angle, this._rotationBase, this.map.crs);
        if (this.activeLayer) this.activeLayer.redraw();
        this._updateHandles();
    }

    private _handleRotationEnd(): void {
        this.fire(new RotationEndEvent());
    }

    private _updateHandles(): void {
        if (this.enableRotation) this._updateRotationHandle();
        if (this.enableScaling) this._updateScaleHandles();

        this._tempLayer.redraw();
    }

    private _updateRotationHandle(): void {
        let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
        this._rotationHandle.position = [(bbox.xMin + bbox.xMax)/2, bbox.yMax];
    }

    private _updateScaleHandles(): void {
        let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
        let xs = [bbox.xMin, (bbox.xMin + bbox.xMax)/2, bbox.xMax];
        let ys = [bbox.yMin, (bbox.yMin + bbox.yMax)/2, bbox.yMax];

        for (let i = 0; i < 9; i++) {
            if (i === 4) continue;
            this._scaleHandles[i].position = [xs[i%3], ys[Math.floor(i/3)]];
        }
    }

    private _handleScalingStart(index: number, event: DragStartEvent): void {
        if (this.ignoreEvents) return;

        event.draggingObject = this._scaleHandles[index];
        event.stopPropagation();

        this.fire(new ScalingStartEvent());
    }

    private _handleScaling(index: number, event: DragEvent): void {
        const MIN_SIZE = 10;
        let xIndex = index % 3;
        let yIndex = Math.floor(index / 3);

        let baseX = xIndex === 0 ? 2 : xIndex === 2 ? 0 : 1;
        let baseY = yIndex === 0 ? 2 : yIndex === 2 ? 0 : 1;
        let basePoint = this._scaleHandles[baseX + 3 * baseY].position;

        let bbox = this._activeFeature.bbox.projectTo(this.map.crs);
        let resolution = this.map.resolution;
        let tolerance = MIN_SIZE * resolution;
        let width = bbox.width;
        let xScale = baseX === 1 ? 1 : (width + (baseX - 1) * event.offset[0]) / width;
        if (width < tolerance && xScale < 1) xScale = 1;
        let height = bbox.height;
        let yScale = baseY === 1 ? 1 : (height + (baseY - 1) * event.offset[1]) / height;
        if (height < tolerance && yScale < 1) yScale = 1;

        scale([this._activeFeature], [xScale, yScale], basePoint, this.map.crs);
        if (this.activeLayer) this.activeLayer.redraw();
        this._updateHandles();
    }

    private _handleScalingEnd(): void {
        this.fire(new ScalingEndEvent());
    }
}
