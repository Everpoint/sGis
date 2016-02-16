'use strict';

(function() {

    sGis.feature.Polyline = function(coordinates, options) {
        this.__initialize(options);

        this._coordinates = [[]];
        if (coordinates) this.coordinates = coordinates;
    };

    sGis.feature.Polyline.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.polyline.Simple,
        _cache: {},

        addPoint: function(point, ring) {
            ring = ring || 0;
            if (!this._coordinates[ring]) utils.error('The ring with index ' + ring + ' does not exist in feature');
            this.setPoint(ring, this._coordinates[ring].length, point);
        },

        removePoint: function(ring, index) {
            if (!this._coordinates[ring]) utils.error('The ring with index ' + ring + ' does not exist in the feature');
            if (!this._coordinates[ring][index]) utils.error('The point with specified index ' + index + ' does not exist in the feature');
            this._coordinates[ring].splice(index, 1);
            if (this._coordinates[ring].length === 0) {
                this._coordinates.splice(ring, 1);
            }
            this._cache = {};
            this._bbox = null;
        },

        removeRing: function(ring) {
            if (this._coordinates.length > 1 && this._coordinates[ring]) {
                this._coordinates.splice(ring, 1);
            }
        },

        clone: function() {
            return new sGis.feature.Polyline(this._coordinates, {crs: this._crs, color: this._color, width: this._width, symbol: this.originalSymbol});
        },

        projectTo: function(crs) {
            var projected = this.clone();
            projected.crs = crs;
            return projected;
        },

        setRing: function(n, coordinates) {
            if (!utils.isInteger(n) || n < 0) utils.error('Positive integer is expected for index but got ' + n + ' instead');
            if (!utils.isArray(coordinates)) utils.error('Array is expected but got ' + coordinates + ' instead');

            if (n > this._coordinates.length) n = this._coordinates.length;
            this._coordinates[n] = [];
            for (var i = 0, l = coordinates.length; i < l; i++) {
                this.setPoint(n, i, coordinates[i]);
            }
        },

        setPoint: function(ring, n, point) {
            if (!isValidPoint(point)) utils.error('Point is expected but got ' + point + ' instead');
            if (!this._coordinates[ring]) utils.error('The ring with index ' + ring + ' does not exist');
            if (!utils.isInteger(n) || n < 0) utils.error('Positive integer is expected for index but got ' + n + ' instead');

            if (n > this._coordinates[ring].length) n = this._coordinates[ring].length;
            if (point instanceof sGis.Point) {
                var projected = point.projectTo(this.crs);
                this._coordinates[ring][n] = this.crs === sGis.CRS.geo ? [projected.y, projected.x] : [projected.x, projected.y];
            } else {
                this._coordinates[ring][n] = point;
            }
            this._bbox = null;
            this._cache = {};
        },

        insertPoint: function(ring, n, point) {
            if (!isValidPoint(point)) utils.error('Point is expected but got ' + point + ' instead');
            if (!this._coordinates[ring]) utils.error('The ring with index ' + ring + ' does not exist');
            if (!utils.isInteger(n) || n < 0) utils.error('Positive integer is expected for index but got ' + n + ' instead');

            this._coordinates[ring].splice(n, 0, [0, 0]);
            this.setPoint(ring, n, point);
        },

        transform: function(matrix, center) {
            if (center instanceof sGis.Point || center instanceof sGis.feature.Point) {
                var basePoint = center.projectTo(this.crs),
                    base = [basePoint.x, basePoint.y];
            } else if (utils.isArray(center) && utils.isNumber(center[0]) && utils.isNumber(center[1])) {
                base = [parseFloat(center[0]), parseFloat(center[1])];
            } else if (center === undefined) {
                base = this.centroid;
            } else {
                utils.error('Unknown format of center point: ' + center);
            }
            var coord = this.coordinates,
                result = [];
            for (var ring = 0, l = coord.length; ring < l; ring++) {
                var extended = extendCoordinates(coord[ring], base),
                    transformed = utils.multiplyMatrix(extended, matrix);
                result[ring] = collapseCoordinates(transformed, base);
            }

            this.coordinates = result;
        },

        rotate: function(angle, center) {
            if (!utils.isNumber(angle)) utils.error('Number is expected but got ' + angle + ' instead');

            var sin = Math.sin(angle),
                cos = Math.cos(angle);

            this.transform([[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center);
        },

        scale: function(scale, center) {
            if (utils.isNumber(scale)) {
                scale = [scale, scale];
            } else if (!utils.isArray(scale)) {
                utils.error('Number or array is expected but got ' + scale + ' instead');
            }
            this.transform([[parseFloat(scale[0]), 0, 0], [0, parseFloat(scale[1]), 0], [0, 0, 1]], center);
        },

        move: function(x, y) {
            this.transform([[1, 0 ,0], [0, 1, 1], [x, y, 1]]);
        }
    });

    function extendCoordinates(coord, center) {
        var extended = [];
        for (var i = 0, l = coord.length; i < l; i++) {
            extended[i] = [coord[i][0] - center[0], coord[i][1] - center[1], 1];
        }
        return extended;
    }

    function collapseCoordinates(extended, center) {
        var coord = [];
        for (var i = 0, l = extended.length; i < l; i++) {
            coord[i] = [extended[i][0] + center[0], extended[i][1] + center[1]];
        }
        return coord;
    }

    Object.defineProperties(sGis.feature.Polyline.prototype, {
        coordinates: {
            get: function() {
                return utils.copyArray(this._coordinates);
            },
            set: function(coordinates) {
                if (!utils.isArray(coordinates)) utils.error('Array is expected but got ' + coordinates + ' instead');

                this._coordinates = [[]];
                if (!utils.isArray(coordinates[0]) || utils.isNumber(coordinates[0][0])) {
                    // One ring is specified
                    this.setRing(0, coordinates);
                } else {
                    // Array of rings is specified

                    for (var ring = 0, l = coordinates.length; ring < l; ring++) {
                        this.setRing(ring, coordinates[ring]);
                    }
                }
            }
        },

        bbox: {
            get: function() {
                if (!this._bbox) {
                    var point1 = [this._coordinates[0][0][0], this._coordinates[0][0][1]],
                        point2 = [this._coordinates[0][0][0], this._coordinates[0][0][1]];
                    for (var ring = 0, l = this._coordinates.length; ring < l; ring++) {
                        for (var i = 0, m = this._coordinates[ring].length; i < m; i++) {
                            if (point1[0] > this._coordinates[ring][i][0]) point1[0] = this._coordinates[ring][i][0];
                            if (point1[1] > this._coordinates[ring][i][1]) point1[1] = this._coordinates[ring][i][1];
                            if (point2[0] < this._coordinates[ring][i][0]) point2[0] = this._coordinates[ring][i][0];
                            if (point2[1] < this._coordinates[ring][i][1]) point2[1] = this._coordinates[ring][i][1];
                        }
                    }
                    this._bbox = new sGis.Bbox(new sGis.Point(point1[0], point1[1], this._crs), new sGis.Point(point2[0], point2[1], this._crs));
                }
                return this._bbox;
            }
        },

        type: {
            value: 'polyline'
        },

        width: {
            get: function() {
                return this._symbol.strokeWidth;
            },

            set: function(width) {
                this._symbol.strokeWidth = width;
            }
        },

        color: {
            get: function() {
                return this._symbol.strokeColor;
            },

            set: function(color) {
                this._symbol.strokeColor = color;
            }
        },

        crs: {
            get: function() {
                return this._crs;
            },

            set: function(crs) {
                if (crs === this.crs) return;
                if (!(crs instanceof sGis.Crs)) utils.error('sGis.Crs instance is expected but got ' + crs + ' instead');

                if (this._coordinates) {
                    for (var ring = 0, l = this._coordinates.length; ring < l; ring++) {
                        for (var i = 0, m = this._coordinates[ring].length; i < m; i++) {
                            var coord = this._coordinates[ring][i],
                                point = new sGis.Point(coord[0], coord[1], this.crs),
                                projected = point.projectTo(crs);

                            this._coordinates[ring][i] = [projected.x, projected.y];
                        }
                    }
                }

                this._crs = crs;
                this._cache = {};
                this._bbox = null;
            }
        },

        centroid: {
            get: function() {
                var bbox = this.bbox,
                    x = (bbox.p[0].x + bbox.p[1].x) / 2,
                    y = (bbox.p[0].y + bbox.p[1].y) / 2;

                return [x, y];
            }
        }
    });

    function isValidPoint(point) {
        return utils.isArray(point) && utils.isNumber(point[0]) && utils.isNumber(point[1]) || (point instanceof sGis.Point);
    }

})();