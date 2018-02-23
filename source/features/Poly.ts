import {Feature, FeatureParams} from "./Feature";
import {Coordinates} from "../baseTypes";
import {copyArray, isArray} from "../utils/utils";
import {IPoint, Point} from "../Point";
import {Bbox} from "../Bbox";
import {Crs} from "../Crs";
import {projectRings} from "../geotools";


/**
 * Base class for polylines and polygons.
 * @alias sGis.feature.Poly
 */
export class Poly extends Feature {
    private _rings: Coordinates[][];
    private _bbox: Bbox;
    /**
     * @param {Position[][]} rings - coordinates of the feature
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(rings: Coordinates[][] | Coordinates[], properties?: FeatureParams) {
        super(properties);
        if (rings && rings.length > 0) {
            if (!isArray(rings[0][0])) rings = [<Coordinates[]>rings];
            this.rings = copyArray(rings);
        } else {
            this._rings = [[]];
        }
    }

    /**
     * Array of contours of coordinates. The contours must be not-enclosed for both polylines and polygons (first and last points of a contour must not be same)
     * @type {Position[][]}
     * @default [[]]
     */
    get rings(): Coordinates[][] { return this._rings; }
    set rings(rings: Coordinates[][]) {
        this._rings = rings;
        this._update();
    }

    /**
     * Adds a point to the end of the specified contour (ring).
     * @param {sGis.Point|Position} point - point to be added. If sGis.Point is given, the point will be automatically projected to the feature coordinate system.
     * @param {Number} [ringN] - number of the ring the point will be added to. If not specified, the point will be added to the last ring.
     */
    addPoint(point: Coordinates | IPoint, ringN: number): void {
        if (!ringN) ringN = this._rings.length - 1;
        this.setPoint(ringN, this._rings[ringN].length, point);
    }

    /**
     * Removes a point from the feature.
     * @param {Number} ringN - index of the ring (contour) the point will be removed from.
     * @param {Number} index - index of the point in the ring.
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
     * @param {Number} ringN - index of the ring to be removed.
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
     * Returns a copy of the feature. Only generic properties are copied.
     * @returns {sGis.feature.Poly}
     */
    clone(): Poly {
        return new Poly(this.rings, { crs: this.crs });
    }

    /**
     * Returns a copy of the feature, projected into the given coordinate system. Only generic properties are copied to the projected feature.
     * @param {sGis.Crs} crs - target coordinate system.
     * @returns {sGis.feature.Poly}
     */
    projectTo(crs: Crs): Poly {
        let projected = projectRings(this.rings, this.crs, crs);
        return new Poly(projected, { crs: crs, symbol: this.symbol });
    }

    /**
     * Sets new coordinates for a contour.
     * @param {Number} ringN - index of the contour to be set. If the index is larger then the number of rings of the feature, new ring will be appended to the ring list.
     * @param {Position[]} ring - coordinate set of the contour.
     */
    setRing(ringN: number, ring: Coordinates[]): void {
        ringN = Math.min(ringN, this._rings.length);
        this._rings[ringN] = ring;
        this._update();
    }

    /**
     * Sets a new value for a point in the feature.
     * @param {Number} ringN - index of the contour of the point.
     * @param {Number} pointN - index of the point in the contour.
     * @param {Position|sGis.IPoint} point - new coordinates
     */
    setPoint(ringN: number, pointN: number, point: IPoint | Coordinates) {
        pointN = Math.min(pointN, this._rings[ringN].length);
        this._rings[ringN][pointN] = (<IPoint>point).position && (<IPoint>point).projectTo ? (<IPoint>point).projectTo(this.crs).position : <Coordinates>point;
        this._update();
    }

    /**
     * Inserts a new point to the given position.
     * @param {Number} ringN - index of the contour the point will be inserted into.
     * @param {Number} pointN - index of the point to insert to.
     * @param {Position|sGis.IPoint} point - point to be inserted
     */
    insertPoint(ringN: number, pointN: number, point: IPoint | Coordinates) {
        pointN = Math.min(pointN, this._rings[ringN].length);
        this._rings[ringN].splice(pointN, 0, [0, 0]);
        this.setPoint(ringN, pointN, point);
    }

    /**
     * Bounding box of the feature
     * @type {sGis.Bbox}
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

    /**
     * Center of the feature. At the point it's the middle point of feature's bounding box.
     * @type {Position}
     */
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
}
