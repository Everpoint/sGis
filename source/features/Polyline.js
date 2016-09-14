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
            let yMax = Number.MIN_VALUE;
            
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
    }

    utils.extend(Polyline.prototype, defaults);

    return Polyline;

});
