import {IPoint} from "../Point";
import {Feature, FeatureParams} from "./Feature";
import {Bbox} from "../Bbox";
import {PointSymbol} from "../symbols/point/Point";
import {Contour, Coordinates} from "../baseTypes";
import {MultiPointSymbol} from "../symbols/MultiPointSymbol";
import {Crs} from "../Crs";
import {projectPoints} from "../geotools";

/**
 * Represents a set of points on a map that behave as one feature: have same symbol, can be added, transformed or removed as one.
 * @alias sGis.feature.MultiPoint
 */
export class MultiPoint extends Feature {
    private _points: Contour;
    private _bbox: Bbox;

    constructor(points: Contour = [], {symbol = new MultiPointSymbol(new PointSymbol()), ...params}: FeatureParams  = {}) {
        super({symbol, ...params});
        this._points = points;
    }

    /**
     * Set of points' coordinates.
     */
    get points(): Coordinates[] { return this._points; }
    set points(points: Coordinates[]) {
        this._points = points.slice();
        this._update();
    }

    projectTo(crs: Crs): MultiPoint {
        let projected = projectPoints(this.points, this.crs, crs);
        return new MultiPoint(projected, {symbol: this.symbol, crs: crs, persistOnMap: this.persistOnMap});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     */
    clone(): MultiPoint {
        return this.projectTo(this.crs);
    }

    /**
     * Adds a point to the end of the coordinates' list.
     * @param point - if sGis.IPoint instance is given, it will be automatically projected to the multipoint coordinate system.
     */
    addPoint(point: IPoint | Coordinates): void {
        if ((<IPoint>point).position && (<IPoint>point).crs) {
            this._points.push((<IPoint>point).projectTo(this.crs).position);
        } else {
            this._points.push([point[0], point[1]]);
        }
        this._update();
    }

    _update(): void {
        this._bbox = null;
        this.redraw();
    }

    get bbox(): Bbox {
        if (this._bbox) return this._bbox;
        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = Number.MIN_VALUE;
        let yMax = Number.MIN_VALUE;

        this._points.forEach(point => {
            xMin = Math.min(xMin, point[0]);
            yMin = Math.min(yMin, point[1]);
            xMax = Math.max(xMax, point[0]);
            yMax = Math.max(yMax, point[1]);
        });

        this._bbox = new Bbox([xMin, yMin], [xMax, yMax], this.crs);
        return this._bbox;
    }

    /**
     * @deprecated
     */
    get coordinates() { return this._points.slice(); }
    set coordinates(points) { this.points = points; }

    get centroid(): Coordinates {
        return this.bbox.center;
    }
}
