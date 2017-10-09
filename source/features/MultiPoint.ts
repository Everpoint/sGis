import {Point} from "../Point";
import {Feature, IFeatureConstructorArgs} from "./Feature";
import {Bbox} from "../Bbox";
import {PointFeature} from "./Point";
import {PointSymbol} from "../symbols/point/Point";
import {IRender} from "../interfaces/IRender";
import {Symbol} from "../symbols/Symbol";

/**
 * Represents a set of points on a map that behave as one feature: have same symbol, can be added, transformed or removed as one.
 * @alias sGis.feature.MultiPoint
 * @extends sGis.Feature
 */
export class MultiPoint extends Feature {
    private _points: any[];
    private _bbox: Bbox;

    _symbol: Symbol;

    /**
     * @param {Position[]} points - set of the points' coordinates
     * @param {Object} properties - key-value set of properties to be set to the instance
     */
    constructor(points = [], { symbol = new PointSymbol(), crs }: IFeatureConstructorArgs  = {}) {
        super({ symbol, crs });
        this._points = points;
    }

    /**
     * Set of points' coordinates
     * @type {Position[]}
     * @default []
     */
    get points() { return this._points; }
    set points(/** Position[] */ points) {
        this._points = points.slice();
        this._update();
    }

    /**
     * Returns a copy of the feature, projected into the given coordinate system. Only generic properties are copied to the projected feature.
     * @param {sGis.Crs} crs - target coordinate system.
     * @returns {sGis.feature.MultiPoint}
     */
    projectTo(crs) {
        let projected = [];
        this._points.forEach(point => {
            projected.push(new Point(point, this.crs).projectTo(crs).coordinates);
        });

        return new MultiPoint(projected, {symbol: this.symbol, crs: crs});
    }

    /**
     * Returns a copy of the feature. Only generic properties are copied.
     * @returns {sGis.feature.MultiPoint}
     */
    clone() {
        return this.projectTo(this.crs);
    }

    /**
     * Adds a point to the end of the coordinates' list
     * @param {sGis.IPoint|Position} point - if sGis.IPoint instance is given, it will be automatically projected to the multipoint coordinate system.
     */
    addPoint(point) {
        if (point.position && point.crs) {
            this._points.push(point.projectTo(this.crs).position);
        } else {
            this._points.push([point[0], point[1]]);
        }
        this._update();
    }

    _update() {
        this._bbox = null;
        this.redraw();
    }

    render(resolution, crs): IRender[] {
        if (this.hidden || !this.symbol) return [];
        if (!this._needToRender(resolution, crs)) return this._rendered.renders;

        let renders = [];
        this._points.forEach(point => {
            let f = new PointFeature(point, {crs: this.crs, symbol: this.symbol});
            renders = renders.concat(f.render(resolution, crs));
        });

        this._rendered = {
            resolution: resolution,
            crs: crs,
            renders: renders
        };

        return this._rendered.renders;
    }

    get bbox() {
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
}
