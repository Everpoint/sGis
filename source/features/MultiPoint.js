sGis.module('feature.MultiPoint', [
    'utils',
    'utils.proto',
    'Crs',
    'Point',
    'Bbox',
    'Feature',
    'feature.Point',
    'symbol.point'
], function(utils, proto, Crs, Feature, Point, Bbox, PointF, pointSymbols) {
    'use strict';

    var defaults = {
        _symbol: new sGis.symbol.point.Point()
    };

    class MultiPoint extends Feature {
        constructor(coordinates, properties) {
            super(properties);
            this._coordinates = [];
            if (coordinates) this.coordinates = coordinates;
        }

        projectTo(crs) {
            var projected = [];
            this._coordinates.forEach(function(point) {
                projected.push(new sGis.Point(point[0], point[1], this._crs).projectTo(crs).coordinates);
            }, this);

            return new MultiPoint(projected, {symbol: this.symbol, crs: crs});
        }

        clone() {
            return this.projectTo(this._crs);
        }

        addPoint(point) {
            if (point instanceof sGis.Point || point instanceof sGis.feature.Point) {
                this._coordinates.push(point.projectTo(this._crs).coordinates);
            } else {
                this._coordinates.push([point[0], point[1]]);
            }
        }

        render(resolution, crs) {
            if (this._hidden || !this.symbol) return [];
            if (!this._needToRender(resolution, crs)) return this._rendered.renders;

            var renders = [];
            this._coordinates.forEach(point => {
                var f = new Point(point, {crs: this._crs, symbol: this.symbol});
                renders = renders.concat(f.render(arguments));
            });
            
            this._rendered = {
                resolution: resolution,
                crs: crs,
                renders: renders
            };

            return this._rendered.renders;
        }
    }
    
    utils.extend(MultiPoint.prototype, defaults);

    sGis.utils.proto.setProperties(MultiPoint.prototype, {
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

    return MultiPoint;

});
