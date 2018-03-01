import {Feature, FeatureParams} from "./Feature";
import {Coordinates} from "../baseTypes";
import {copyArray} from "../utils/utils";
import {IPoint} from "../Point";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";

/**
 * Base class for polylines and polygons.
 * @alias sGis.feature.Poly
 */
export abstract class Poly extends Feature {
    private _rings: Coordinates[][];
    private _bbox: Bbox;

    abstract isEnclosed: boolean;

    constructor(rings: Coordinates[][] | Coordinates[], properties?: FeatureParams) {
        super(properties);
        if (rings && rings.length > 0) {
            if (!Array.isArray(rings[0][0])) rings = [<Coordinates[]>rings];
            this.rings = copyArray(<Coordinates[][]>rings);
        } else {
            this._rings = [[]];
        }
    }

    /**
     * Array of contours of coordinates. The contours must be not-enclosed for both polylines and polygons (first and last points of a contour must not be same)
     */
    get rings(): Coordinates[][] { return this._rings; }
    set rings(rings: Coordinates[][]) {
        this._rings = rings;
        this._update();
    }

    /**
     * Adds a point to the end of the specified contour (ring).
     * @param point - point to be added. If sGis.Point is given, the point will be automatically projected to the feature coordinate system.
     * @param [ringN] - number of the ring the point will be added to. If not specified, the point will be added to the last ring.
     */
    addPoint(point: Coordinates | IPoint, ringN: number): void {
        if (!ringN) ringN = this._rings.length - 1;
        this.setPoint(ringN, this._rings[ringN].length, point);
    }

    /**
     * Removes a point from the feature.
     * @param ringN - index of the ring (contour) the point will be removed from.
     * @param index - index of the point in the ring.
     */
    removePoint(ringN: number, index: number): void {
        this._rings[ringN].splice(index, 1);
        if (this._rings[ringN].length === 0) {
            this.removeRing(ringN);
        }
        this._update();
    }

    /**
     * Removes a ring (contour) from the feature.
     * @param ringN - index of the ring to be removed.
     */
    removeRing(ringN: number): void {
        this._rings.splice(ringN, 1);
        this._update();
    }

    private _update(): void {
        this._bbox = null;
        this.redraw();
    }

    /**
     * Sets new coordinates for a contour.
     * @param ringN - index of the contour to be set. If the index is larger then the number of rings of the feature, new ring will be appended to the ring list.
     * @param ring - coordinate set of the contour.
     */
    setRing(ringN: number, ring: Coordinates[]): void {
        ringN = Math.min(ringN, this._rings.length);
        this._rings[ringN] = ring;
        this._update();
    }

    /**
     * Sets a new value for a point in the feature.
     * @param ringN - index of the contour of the point.
     * @param pointN - index of the point in the contour.
     * @param point - new coordinates
     */
    setPoint(ringN: number, pointN: number, point: IPoint | Coordinates) {
        pointN = Math.min(pointN, this._rings[ringN].length);
        this._rings[ringN][pointN] = (<IPoint>point).position && (<IPoint>point).projectTo ? (<IPoint>point).projectTo(this.crs).position : <Coordinates>point;
        this._update();
    }

    /**
     * Inserts a new point to the given position.
     * @param ringN - index of the contour the point will be inserted into.
     * @param pointN - index of the point to insert to.
     * @param point - point to be inserted
     */
    insertPoint(ringN: number, pointN: number, point: IPoint | Coordinates) {
        pointN = Math.min(pointN, this._rings[ringN].length);
        this._rings[ringN].splice(pointN, 0, [0, 0]);
        this.setPoint(ringN, pointN, point);
    }

    /**
     * Bounding box of the feature
     */
    get bbox(): Bbox {
        if (this._bbox) return this._bbox;
        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = -Number.MAX_VALUE;
        let yMax = -Number.MAX_VALUE;

        this._rings.forEach(ring => {
            ring.forEach(point => {
                xMin = Math.min(xMin, point[0]);
                yMin = Math.min(yMin, point[1]);
                xMax = Math.max(xMax, point[0]);
                yMax = Math.max(yMax, point[1]);
            });
        });

        this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
        return this._bbox;
    }

    get centroid(): Coordinates {
        let bbox = this.bbox;
        let x = (bbox.xMin + bbox.xMax) / 2;
        let y = (bbox.yMin + bbox.yMax) / 2;
        return [x, y];
    }

    /**
     * @deprecated
     */
    get coordinates() { return copyArray(this._rings); }
    set coordinates(rings) { this.rings = copyArray(rings); }

    abstract projectTo(newCrs: Crs): Poly;
    abstract clone(): Poly;
}
