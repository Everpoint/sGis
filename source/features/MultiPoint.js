(function() {

    var MultiPoint = function(coordinates, options) {
        this._coordinates = [];
        this.__initialize(options);

        this.coordinates = coordinates;
    };

    MultiPoint.prototype = new sGis.Feature({
        _defaultSymbol: sGis.symbol.point.Point,
        _crs: sGis.CRS.geo,

        projectTo: function(crs) {
            var projected = [];
            this._coordinates.forEach(function(point) {
                projected.push(new sGis.Point(point[0], point[1], this._crs).projectTo(crs).coordinates);
            }, this);

            return new MultiPoint(projected, {symbol: this.symbol, crs: crs});
        },

        clone: function() {
            return this.projectTo(this._crs);
        },

        addPoint: function(point) {
            if (point instanceof sGis.Point || point instanceof sGis.feature.Point) {
                this._coordinates.push(point.projectTo(this._crs).coordinates);
            } else {
                this._coordinates.push([point[0], point[1]]);
            }
        },

        render: function(resolution, crs) {
            if (this._hidden) {
                return [];
            } else {
                var rendered = [];
                this._coordinates.forEach(function(point) { rendered = rendered.concat(new sGis.feature.Point(point, {crs: this._crs, symbol: this.symbol}).render(resolution, crs))}, this);

                return rendered;
            }
        }
    });

    sGis.utils.proto.setProperties(MultiPoint.prototype, {
        crs: {
            default: sGis.CRS.geo,
            set: function(crs) {
                this._coordinates = this._coordinates.map(function(point) { return new sGis.Point(point[0], point[1], this._crs).projectTo(crs); }, this);
                this._crs = crs;
            }
        },

        bbox: {
            get: function() {
                if (this._coordinates.length === 0) {
                    return new sGis.Bbox([Number.MIN_VALUE, Number.MIN_VALUE],[Number.MIN_VALUE, Number.MIN_VALUE], this._crs);
                } else {
                    var xs = [];
                    var ys = [];
                    this._coordinates.forEach(function(point) { xs.push(point[0]); ys.push(point[1]); });

                    return new sGis.Bbox([Math.min.apply(Math, xs), Math.min.apply(Math, ys)], [Math.max.apply(Math, xs), Math.max.apply(Math, ys)], this._crs);
                }
            }
        },

        coordinates: {
            get: function() {
                return this._coordinates.concat();
            },

            set: function(coordinates) {
                this._coordinates = [];
                coordinates.forEach(function(point) { this.addPoint(point); }, this);
            }
        },

        type: {
            default: 'point',
            set: null
        }
    });

    sGis.feature.MultiPoint = MultiPoint;

})();