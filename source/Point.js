sGis.module('Point', [
    'utils',
    'CRS'
], function(/**sGis.utils*/ utils, /**sGis.CRS*/ CRS) {
    'use strict';

    var defaults = {
        x: 0,
        y: 0,
        crs: CRS.geo
    };

    class Point {
        constructor(x, y, crs) {
            this.x = x;
            this.y = y;
            if (crs !== undefined) this.crs = crs;
        }

        projectTo(newCrs) {
            var projection = this.crs.projectionTo(newCrs);
            if (projection === null) utils.error();

            var [x, y] = projection([this.x, this.y]);
            return new Point(x, y, newCrs);
        }

        clone() {
            return new Point(this.x, this.y, this.crs);
        }

        get coordinates() {
            return [this.x, this.y];
        }
        set coordinates(coord) {
            this.x = coord[0];
            this.y = coord[1];
        }
    }

    utils.extend(Point.prototype, defaults);

    return Point;
});