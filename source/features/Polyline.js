sGis.module('feature.Polyline', [
    'utils',
    'Feature',
    'symbol.polyline.Simple',
    'Bbox',
    'Point',
    'Crs'
], function(utils, Feature, PolylineSymbol, Bbox, Point, Crs) {
    'use strict';

    var defaults = {
        _symbol: new PolylineSymbol()
    };

    /**
     * @alias sGis.feature.Polyline
     * @extends sGis.Feature
     */
    class Polyline extends Feature {
        constructor(rings, properties) {
            super(properties);
            if (rings && rings.length > 0) {
                if (rings[0].length > 0 && !Array.isArray(rings[0][0])) rings = [rings];
                this.rings = utils.copyArray(rings);
            } else {
                this._rings = [[]];
            }
        }
        
        get rings() { return this._rings; }
        set rings(rings) { 
            this._rings = rings;
            this._update();
        }

        addPoint(point, ringN) {
            if (!ringN) ringN = this._rings.length - 1;
            this.setPoint(ringN, this._rings[ringN].length, point);
        }

        removePoint(ringN, index) {
            this._rings[ringN].splice(index, 1);
            if (this._rings[ringN].length === 0) {
                this.removeRing(ringN);
            }
            this._update();
        }

        removeRing(ringN) {
            this._rings.splice(ringN, 1);
            this._update();
        }
        
        _update() {
            this._bbox = null;
            this.redraw();
        }

        clone() {
            return new Polyline(this._rings, {crs: this.crs, symbol: this.originalSymbol});
        }

        projectTo(/** sGis.Crs */ crs) {
            var projected = this._rings.map(ring => {
                return ring.map(point => { return this.crs.projectionTo(crs)(point); });
            });
            return new Polyline(projected, { crs: crs, symbol: this.originalSymbol });
        }

        setRing(ringN, ring) {
            ringN = Math.min(ringN, this._rings.length);
            this._rings[ringN] = ring;
            this._update();
        }

        setPoint(ringN, pointN, point) {
            pointN = Math.min(pointN, this._rings[ringN].length);
            this._rings[ringN][pointN] = point.position && point.projectTo ? point.projectTo(this.crs).position : point;
            this._update();
        }

        insertPoint(ringN, pointN, point) {
            pointN = Math.min(pointN, this._rings[ringN].length);
            this._rings[ringN].splice(pointN, 0, [0, 0]);
            this.setPoint(ringN, pointN, point);
        }

        get bbox() {
            if (this._bbox) return this._bbox;
            let xMin = Number.MAX_VALUE;
            let yMin = Number.MAX_VALUE;
            let xMax = Number.MIN_VALUE;
            let yMax = Number.MAX_VALUE;
            
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
        
        get centroid() {
            let bbox = this.bbox;
            let x = (bbox.xMin + bbox.xMax) / 2;
            let y = (bbox.yMin + bbox.yMax) / 2;
            return [x, y];
        }

        /**
         * @deprecated
         */
        get coordinates() { return utils.copyArray(this._rings); }
        set coordinates(rings) { this.rings = utils.copyArray(rings); }

        transform(matrix, center) {
            if (center instanceof sGis.Point || center instanceof sGis.feature.Point) {
                var basePoint = center.projectTo(this.crs),
                    base = [basePoint.x, basePoint.y];
            } else if (sGis.utils.isArray(center) && sGis.utils.isNumber(center[0]) && sGis.utils.isNumber(center[1])) {
                base = [parseFloat(center[0]), parseFloat(center[1])];
            } else if (center === undefined) {
                base = this.centroid;
            } else {
                sGis.utils.error('Unknown format of center point: ' + center);
            }
            var coord = this.coordinates,
                result = [];
            for (var ring = 0, l = coord.length; ring < l; ring++) {
                var extended = extendCoordinates(coord[ring], base),
                    transformed = sGis.utils.multiplyMatrix(extended, matrix);
                result[ring] = collapseCoordinates(transformed, base);
            }

            this.coordinates = result;
            this.redraw();
        }

        rotate(angle, center) {
            if (!sGis.utils.isNumber(angle)) sGis.utils.error('Number is expected but got ' + angle + ' instead');

            var sin = Math.sin(angle),
                cos = Math.cos(angle);

            this.transform([[cos, sin, 0], [-sin, cos, 0], [0, 0, 1]], center);
        }

        scale(scale, center) {
            if (sGis.utils.isNumber(scale)) {
                scale = [scale, scale];
            } else if (!sGis.utils.isArray(scale)) {
                sGis.utils.error('Number or array is expected but got ' + scale + ' instead');
            }
            this.transform([[parseFloat(scale[0]), 0, 0], [0, parseFloat(scale[1]), 0], [0, 0, 1]], center);
        }

        move(x, y) {
            this.transform([[1, 0 ,0], [0, 1, 1], [x, y, 1]]);
        }
    }

    utils.extend(Polyline.prototype, defaults);

    //TODO: use sGis.utils.extendCoordinates
    function extendCoordinates(coord, center) {
        var extended = [];
        for (var i = 0, l = coord.length; i < l; i++) {
            extended[i] = [coord[i][0] - center[0], coord[i][1] - center[1], 1];
        }
        return extended;
    }

    //TODO: use sGis.utils.collapseCoordinates
    function collapseCoordinates(extended, center) {
        var coord = [];
        for (var i = 0, l = extended.length; i < l; i++) {
            coord[i] = [extended[i][0] + center[0], extended[i][1] + center[1]];
        }
        return coord;
    }
    

    return Polyline;

});
