import * as math from './utils/math';
import {Position} from './baseTypes';

type Projection = (Point) => Position;

let identityProjection = ([x,y]: Position): Position => [x,y];

/**
 * @class
 * @alias sGis.Crs
 * @property {Object} description - description of the crs
 */
export class Crs {
    public readonly wkid: number;
    public readonly authority: string;
    public readonly wkt: string;
    public readonly details: string;

    private projections: Map<Crs, Projection>;

    private discoveryMode: boolean = false;

    /**
     * @constructor
     * @param {Object} [description] - description of the crs
     */
    public constructor(description?:Partial<Crs>) {
        Object.assign(this, description);
    }

    public toString(): string {
        if (this.wkid) return this.wkid.toString();
        if (this.wkt) return this.wkt;

        return this.details;
    }

    /**
     * Returns true if given crs represents the same spatial reference system
     * @param {sGis.Crs} crs
     * @returns {boolean}
     */
    public equals(crs: Crs): boolean {
        if (this === crs) return true;
        if (this.wkid && this.wkid === crs.wkid) return true;

        return this.wkt && this.wkt === crs.wkt;
    }

    /**
     * Returns projection function from the current coordinate system to specified. Returned function takes one [x,y] parameter and returns projected [x,y] (corresponding to crs parameter)
     * @param {sGis.Crs} crs
     * @returns {Function|null}
     */
    public projectionTo(crs: Crs): Projection {
        if (this.projections.get(crs)) return this.projections.get(crs);
        return this.discoverProjectionTo(crs);
    }

    /**
     * Returns true if the current coordinate system can be projected to the given crs
     * @param {Crs} crs
     * @returns {boolean}
     */
    public canProjectTo(crs: Crs): boolean {
        return this.projectionTo(crs) !== null;
    }

    /**
     * Adds the projection function to the coordinate system
     * @param {sGis.Crs} crs
     * @param {Projection} projection
     */
    public setProjectionTo(crs: Crs, projection: Projection): void {
        this.projections.set(crs, projection);
    }

    private discoverProjectionTo(crs: Crs): Projection {
        if (this.discoveryMode) return null;
        if (this.equals(crs)) return identityProjection;

        this.discoveryMode = true;
        for (let [ownCrs, func] of this.projections) {
            if (ownCrs.equals(crs)) {
                this.projections.set(crs, func);
                break;
            }

            let innerProjection = ownCrs.discoverProjectionTo(crs);
            if (innerProjection) {
                let result = function([x, y]) { return innerProjection(func([x, y])); };
                this.projections.set(crs, result);
                break;
            }
        }
        this.discoveryMode = false;

        return this.projections.get(crs) || null;
    }
}

/**
 * Plain euclidean coordinate system. This projection cannot be projected to any other projection.
 * @type sGis.Crs
 * @alias sGis.CRS.plain
 * @memberof sGis.CRS
 */
export const plain = new Crs({ details: 'Plain crs without any projection functions' });


/**
 * Geographical coordinate system, which has longitude set as X coordinate, and latitude as Y coordinate.
 * @type sGis.Crs
 * @alias sGis.CRS.wgs84
 * @memberof sGis.CRS
 */
export const wgs84 = new Crs({
    wkid: 84,
    authority: 'OCG',
    wkt: 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]]'
});

/**
 * @type sGis.Crs
 * @alias sGis.CRS.geo
 * @memberof sGis.CRS
 */
export const geo = new Crs({
    wkid: 4326,
    authority: 'EPSG'
});

geo.setProjectionTo(wgs84, ([x,y]) => [y,x]);
wgs84.setProjectionTo(geo, ([x,y]) => [y,x]);

/**
 * @type sGis.Crs
 * @alias sGis.CRS.webMercator
 * @memberof sGis.CRS
 */
export const webMercator = new Crs({
    wkid: 3857,
    authority: 'EPSG',
    wkt: 'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'
});

{
    const a = 6378137;

    webMercator.setProjectionTo(wgs84, ([x, y]) => {
        let rLat = Math.PI / 2 - 2 * Math.atan(Math.exp(-y / a));
        let rLong = x / a;
        let lon = math.radToDeg(rLong);
        let lat = math.radToDeg(rLat);

        return [lon, lat];
    });
    wgs84.setProjectionTo(webMercator, ([x, y]) => {
        let rLon = math.degToRad(x);
        let rLat = math.degToRad(y);
        let X = a * rLon;
        let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));

        return [X, Y];
    });
}

/**
 * @type sGis.Crs
 * @alias sGis.CRS.ellipticalMercator
 * @memberof sGis.CRS
 */
export const ellipticalMercator = new Crs({
    wkid: 3395,
    authority: 'EPSG',
    wkt: 'PROJCS["WGS 84 / World Mercator",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Mercator"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["Meter",1]]'
});

{
    const a = 6378137;
    const b = 6356752.3142451793;
    const e =  Math.sqrt(1 - b*b/a/a);
    const eh = e/2;
    const pih = Math.PI/2;

    ellipticalMercator.setProjectionTo(wgs84, ([x,y]) => {
        let ts = Math.exp(-y/a);
        let phi = pih - 2 * Math.atan(ts);
        let i = 0;
        let dphi = 1;

        while (Math.abs(dphi) > 0.000000001 && i++ < 15) {
            let con = e * Math.sin(phi);
            dphi = pih - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eh)) - phi;
            phi += dphi;
        }

        let rLong = x / a,
            rLat = phi,
            lon = math.radToDeg(rLong),
            lat = math.radToDeg(rLat);

        return [lon, lat];
    });

    wgs84.setProjectionTo(ellipticalMercator, ([x,y]) => {
        let rLat = math.degToRad(y);
        let rLon = math.degToRad(x);
        let X = a * rLon;
        let Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2) * Math.pow((1 - e * Math.sin(rLat)) / (1 + e * Math.sin(rLat)), (e/2)));

        return [X, Y];
    });
}


//http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html

/**
 * Class constructor of Alber's equal area projections.
 * @alias sGis.CRS.AlbersEqualArea
 * @extends Crs
 */
export class AlbersEqualArea extends Crs {
    private R = 6372795;

    /**
     * @param {Number} lat0 - latitude of origin
     * @param {Number} lon0 - longitude of origin
     * @param {Number} stLat1 - first standard parallel
     * @param {Number} stLat2 - second standard parallel
     */
    constructor(lat0, lon0, stLat1, stLat2) {
        super({
            details: 'Albers Equal-Area Conic Projection: ' + lat0 + ',' + lon0 + ',' + stLat1 + ',' + stLat2
        });

        let _lat0 = math.degToRad(lat0);
        let _lon0 = math.degToRad(lon0);
        let _stLat1 = math.degToRad(stLat1);
        let _stLat2 = math.degToRad(stLat2);
        let _n = (Math.sin(_stLat1) + Math.sin(_stLat2)) / 2;
        let _c = Math.pow(Math.cos(_stLat1), 2) + 2 * _n * Math.sin(_stLat1);
        let _ro0 = Math.sqrt(_c - 2 * _n * Math.sin(_lat0)) / _n;

        this.setProjectionTo(wgs84, ([x,y]) => {
            let xRad = x / this.R;
            let yRad = y / this.R;
            let th = Math.atan(xRad / (_ro0 - yRad));
            let ro = xRad / Math.sin(th);
            let rLat = Math.asin((_c - ro * ro * _n * _n) / 2 / _n);
            let rLon = _lon0 + th / _n;

            let lat = math.radToDeg(rLat);
            let lon = math.radToDeg(rLon);

            return [lon, lat];
        });

        wgs84.setProjectionTo(this, ([lon,lat]) => {
            let rLon = math.degToRad(lon),
                rLat = math.degToRad(lat),
                th = _n * (rLat - _lon0),
                ro = Math.sqrt(_c - 2 * _n * Math.sin(rLon)) / _n,
                x = ro * Math.sin(th) * this.R,
                y = _ro0 - ro * Math.cos(th) * this.R;

            return [x, y];
        });
    }
}

/**
* @type sGis.Crs
* @alias sGis.CRS.cylindricalEqualArea
* @memberof sGis.CRS
*/
export const cylindricalEqualArea = new AlbersEqualArea(0, 180, 60, 50);

