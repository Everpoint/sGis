'use strict';

(function() {

    sGis.Point = function(x, y, crs) {
        if (!utils.isNumber(x) || !utils.isNumber(y)) utils.error('Coordinates are expected but (' + x + ', ' + y + ') is received instead');

        if (crs && !(crs instanceof sGis.Crs)) utils.error('CRS is not a child of sGis.Crs');

        if (!crs || crs === sGis.CRS.geo) {
            this.x = y;
            this.y = x;
            this.crs = sGis.CRS.geo;
        } else {
            this.x = x;
            this.y = y;
            this.crs = crs;
        }
    };

    sGis.Point.prototype = {
        projectTo: function(newCrs) {
            if (!(newCrs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + newCrs + ' instead');
            if (!newCrs.equals(this.crs)) {
                var positionGeo = this.crs.from(this.x, this.y),
                    positionCrs = newCrs.to(positionGeo.x, positionGeo.y);
            } else {
                positionCrs = {x: this.x, y: this.y};
            }
            if (newCrs !== sGis.CRS.geo) {
                return new sGis.Point(positionCrs.x, positionCrs.y, newCrs);
            } else {
                return new sGis.Point(positionCrs.y, positionCrs.x, newCrs);
            }
        },

        setCoordinates: function(x, y, crs) {
            if (!crs || crs.equals(this.crs)) {
                this.x = x;
                this.y = y;
            } else {
                var newPoint = new sGis.Point(x, y, crs);
                newPoint = newPoint.projectTo(this.crs);
                this.x = newPoint.x;
                this.y = newPoint.y;
            }
        },

        clone: function() {
            return this.projectTo(this.crs);
        },

        getCoordinates: function() {
            if (this.crs === sGis.CRS.geo) {
                return [this.y, this.x];
            } else {
                return [this.x, this.y];
            }
        }
    };

    Object.defineProperties(sGis.Point.prototype, {
        coordinates: {
            get: function() {
                return this.getCoordinates();
            },

            set: function(coordinates) {
                this.setCoordinates(coordinates);
            }
        }
    });

    sGis.Bbox = function(point1, point2, crs) {
        this._crs = crs || point1.crs || point2.crs || sGis.CRS.geo;
        this.p = [];
        this.p1 = point1;
        this.p2 = point2;
    };

    sGis.Bbox.prototype = {
        projectTo: function(crs) {
            return new sGis.Bbox(this.p[0].projectTo(crs), this.p[1].projectTo(crs));
        },

        clone: function() {
            return this.projectTo(this.crs);
        },

        equals: function(bbox) {
            return this.p[0].x === bbox.p[0].x &&
                this.p[0].y === bbox.p[0].y &&
                this.p[1].x === bbox.p[1].x &&
                this.p[1].y === bbox.p[1].y &&
                this.p[0].crs === bbox.p[0].crs;
        },

        setEqual: function(bbox) {
            this.p[0] = bbox.p[0].clone();
            this.p[1] = bbox.p[1].clone();
            this._crs = bbox.crs;
        },

        intersects: function(bbox) {
            var proj = bbox.projectTo(this.p[0].crs);
            return this.xMax > proj.xMin && this.xMin < proj.xMax && this.yMax > proj.yMin && this.yMin < proj.yMax;
        },

        __setPoint: function(index, point) {
            if (point instanceof sGis.Point) {
                this.p[index] = point.projectTo(this._crs);
            } else if (utils.isArray(point)) {
                this.p[index] = new sGis.Point(point[0], point[1], this.crs);
            } else {
                utils.error('Point is expected but got ' + point + ' instead');
            }
        }
    };

    Object.defineProperties(sGis.Bbox.prototype, {
        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                this.setEqual(this.projectTo(crs));
            }
        },

        xMax: {
            get: function() {
                return Math.max(this.p1.x, this.p2.x);
            },

            set: function(value) {
                if (!utils.isNumber(value)) utils.error('Number is expected but got ' + value + ' instead');
                if (value < this.xMin) utils.error('Max value cannot be lower than the min value');
                if (this.p1.x > this.p2.x) {
                    this.p1.x = value;
                } else {
                    this.p2.x = value;
                }
            }
        },

        yMax: {
            get: function() {
                return Math.max(this.p1.y, this.p2.y);
            },

            set: function(value) {
                if (!utils.isNumber(value)) utils.error('Number is expected but got ' + value + ' instead');
                if (value < this.yMin) utils.error('Max value cannot be lower than the min value');
                if (this.p1.y > this.p2.y) {
                    this.p1.y = value;
                } else {
                    this.p2.y = value;
                }
            }
        },

        xMin: {
            get: function() {
                return Math.min(this.p1.x, this.p2.x);
            },

            set: function(value) {
                if (!utils.isNumber(value)) utils.error('Number is expected but got ' + value + ' instead');
                if (value > this.xMax) utils.error('Min value cannot be higher than the max value');
                if (this.p1.x > this.p2.x) {
                    this.p2.x = value;
                } else {
                    this.p1.x = value;
                }
            }
        },

        yMin: {
            get: function() {
                return Math.min(this.p1.y, this.p2.y);
            },

            set: function(value) {
                if (!utils.isNumber(value)) utils.error('Number is expected but got ' + value + ' instead');
                if (value > this.yMax) utils.error('Min value cannot be higher than the max value');
                if (this.p1.y > this.p2.y) {
                    this.p2.y = value;
                } else {
                    this.p1.y = value;
                }
            }
        },

        width: {
            get: function() {
                return this.xMax - this.xMin;
            }
        },

        height: {
            get: function() {
                return this.yMax - this.yMin;
            }
        },

        p1: {
            get: function() {
                return this.p[0];
            },

            set: function(point) {
                this.__setPoint(0, point);
            }
        },

        p2: {
            get: function() {
                return this.p[1];
            },

            set: function(point) {
                this.__setPoint(1, point);
            }
        }
    });

    sGis.geom = {};

})();