'use strict';

(function() {

    sGis.Crs = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
    };

    sGis.Crs.prototype = {
        getWkidString: function() {
            if (this.ESRIcode) {
                return {wkid: this.ESRIcode};
            } else if (this.description) {
                return this.description;
            }
        },

        equals: function(crs) {
            return this === crs || this.description && crs.description && (this.description === crs.description || this.description.wkt === crs.description.wkt || this.description.wkid === crs.description.wkid);
        }
    };

    sGis.CRS = {
        plain: new sGis.Crs({}),

        geo: new sGis.Crs({
            from: function(xCrs, yCrs) {
                return {x: xCrs, y: yCrs};
            },
            to: function(xGeo, yGeo) {
                return {x: xGeo, y: yGeo};
            }
        }),
        webMercator: new sGis.Crs({
            defaultBbox: {
                minX: -20037508.342789244,
                maxX: 20037508.342789244,
                maxY: 20037508.342789244,
                minY: -20037508.342789244
            },
            ESRIcode: 102113,
            EPSGcode: 3857,
            from: function(xCrs, yCrs) {
                var a = 6378137,
                    rLat = Math.PI / 2 - 2 * Math.atan(Math.exp(-yCrs/a)),
                    rLong = xCrs / a,
                    lon = toDeg(rLong),
                    lat = toDeg(rLat);
                return {x: lon, y: lat, lon: lon, lat: lat};
            },
            to: function(xGeo, yGeo) {
                var a = 6378137,
                    rLat = toRad(yGeo),
                    rLon = toRad(xGeo),
                    X = a * rLon,
                    Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));
                return {x: X, y: Y};
            }
        }),
        ellipticalMercator: new sGis.Crs({
            defaultBbox: {
                minX: -20037508.342789244,
                maxX: 20037508.342789244,
                maxY: 20037508.34278924,
                minY: -20037508.34278924
            },
            ESRIcode: 54004,
            EPSGcode: 3395,
            from: function(xCrs, yCrs) {
                var a = 6378137,
                    b = 6356752.3142,
                    f = (a-b) / a,
                    e = Math.sqrt(1 - b*b/a/a),
                    eh = e/2,
                    pih = Math.PI/2,
                    ts = Math.exp(-yCrs/a),
                    phi = pih - 2 * Math.atan(ts),
                    i = 0,
                    dphi = 1;

                while (Math.abs(dphi) > 0.000000001 && i++ < 15) {
                    var con = e * Math.sin(phi);
                    dphi = pih - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eh)) - phi;
                    phi += dphi;
                };

                var rLong = xCrs / a,
                    rLat = phi,
                    lon = toDeg(rLong),
                    lat = toDeg(rLat);

                return {x: lon, y: lat, lon: lon, lat: lat};
            },
            to: function(xGeo, yGeo) {
                var rLat = toRad(yGeo),
                    rLon = toRad(xGeo),
                    a = 6378137,
                    b = 6356752.3142,
                    f = (a-b) / a,
                    e = Math.sqrt(2 * f - f * f),
                    X = a * rLon,
                    Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2) * Math.pow((1 - e * Math.sin(rLat)) / (1 + e * Math.sin(rLat)), (e/2)));

                return {x: X, y: Y};
            }
        }),

        moscowBessel: new sGis.Crs({
            description: {"wkt":"PROJCS[\"Moscow_bessel\",GEOGCS[\"GCS_Bessel_1841\",DATUM[\"D_Bessel_1841\",SPHEROID[\"Bessel_1841\",6377397.155,299.1528128]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",37.5],PARAMETER[\"Scale_Factor\",1.0],PARAMETER[\"Latitude_Of_Origin\",55.66666666666666],UNIT[\"Meter\",1.0]]"}
        })
    };

//http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html    

    sGis.CRS.AlbertsEqualArea = function(lat0, lon0, stLat1, stLat2) {
        this._lat0 = toRad(lat0);
        this._lon0 = toRad(lon0);
        this._stLat1 = toRad(stLat1);
        this._stLat2 = toRad(stLat2);
        this._n = (Math.sin(this._stLat1) + Math.sin(this._stLat2)) / 2;
        this._c = Math.pow(Math.cos(this._stLat1), 2) + 2 * this._n * Math.sin(this._stLat1);
        this._ro0 = Math.sqrt(this._c - 2 * this._n * Math.sin(this._lat0)) / this._n;
        this._R = 6372795;
    };

    sGis.CRS.AlbertsEqualArea.prototype = new sGis.Crs({
        to: function(lon, lat) {
            var rlon = toRad(lon),
                rlat = toRad(lat),
                th = this._n * (rlon - this._lon0),
                ro = Math.sqrt(this._c - 2 * this._n * Math.sin(rlat)) / this._n,
                x = ro * Math.sin(th) * this._R,
                y = this._ro0 - ro * Math.cos(th) * this._R;

            return {x: x, y: y};
        },

        from: function(x, y) {
            var xRad = x / this._R,
                yRad = y / this._R,
//            ro = Math.sqrt(xRad*xRad + Math.pow((this._ro0 - yRad),2)),
                th = Math.atan(xRad / (this._ro0 - yRad)),
                ro = xRad / Math.sin(th),
                rlat = Math.asin((this._c - ro*ro * this._n * this._n) / 2 / this._n),
                rlon = this._lon0 + th / this._n,

                lat = toDeg(rlat),
                lon = toDeg(rlon);

            return {x: lon, y: lat, lon: lon, lat: lat};
        }
    });

    function toRad(d) {
        return d * Math.PI / 180;
    }

    function toDeg(r) {
        return r * 180 / Math.PI;
    }

    sGis.CRS.CylindicalEqualArea = new sGis.CRS.AlbertsEqualArea(0, 180, 60, 50);

})();