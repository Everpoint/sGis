sGis.module('controls.Snapping', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'geotools'
], (
    /** function(new:sGis.Control) */ Control,
    /** function(new:sGis.FeatureLayer) */ FeatureLayer,
    /** function(new:sGis.feature.Point) */ PointFeature,
    /** function(new:sGis.symbol.point.Point) */ PointSymbol,
    /** sGis.geotools */ geotools) => {

    'use strict';

    /**
     * Control for finding snapping points inside a layer during editing with other controls. When active it will watch
     * mousemove events and draw a little point whenever it can find an appropriate snapping.
     * @alias sGis.controls.Snapping
     * @extends sGis.Control
     */
    class Snapping extends Control {
        /**
         * @param {sGis.Map} map - map object the control will work with
         * @param {Object} [options] - key-value set of properties to be set to the instance
         */
        constructor(map, options) {
            super(map, options);

            this._onMouseMove = this._onMouseMove.bind(this);
        }

        _activate() {
            this._tempLayer = new FeatureLayer();
            this.map.addLayer(this._tempLayer);
            this._setListeners();
        }

        _setListeners() {
            this.map.on('mousemove', this._onMouseMove);
        }

        _deactivate() {
            this._removeListeners();
            this.map.removeLayer(this._tempLayer);
            this._tempLayer = null;
            this._snapping = null;
        }

        _removeListeners() {
            this.map.off('mousemove', this._onMouseMove);
        }

        _onMouseMove(sGisEvent) {
            let point = sGisEvent.point;
            let snapping = this.getSnapping(point);

            this._tempLayer.features = snapping ? [ new PointFeature(snapping.position, {crs: point.crs, symbol: this.symbol}) ] : [];

            this._snapping = snapping;
        }

        /**
         * Returns snapping result for given point. If no snapping is found, null is returned.
         * @param {sGis.IPoint} point
         * @returns {sGis.controls.Snapping.SnappingResult|null}
         */
        getSnapping(point) {
            let distance = this.map.resolution * this.snappingDistance;
            for (var i = 0; i < this.snappingTypes.length; i++) {
                let snappingResult = snapping[this.snappingTypes[i]](point, this.activeLayer, distance, this.activeFeature, this.activeRingIndex, this.activePointIndex);
                if (snappingResult) return snappingResult;
            }
            return null;
        }

        /**
         * Position of the current snapping point.
         * @returns {sGis.controls.Snapping.SnappingResult|null}
         */
        get position() { return this._snapping && this._snapping.position; }
    }

    /**
     * The types of snapping to use. The priority of snapping is given by the order in this list (earlier in the list is more important). Possible values are:<br>
     *     * vertex - snaps to any point in the active layer. This includes point features and vertexes of polylines and polygons.<br>
     *     * midpoint - snaps to middle points of sides of polylines and polygons.<br>
     *     * line - snaps to any point on sides of polylines and polygons.<br>
     *     * axis - if activeFeature, activeRingIndex and activePointIndex properties are set, snaps to position on the plane so that the current point would make a vertical or horizontal line with its neighbours.<br>
     *     * orthogonal - if activeFeature, activeRingIndex and activePointIndex properties are set, snaps to position on the plane so that the current point would make a 90deg angle with its neighbours.
     * @member {String[]} sGis.controls.Snapping#snappingTypes
     * @default ['vertex', 'midpoint', 'line', 'axis', 'orthogonal']
     */
    Snapping.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    /**
     * Symbol of the snapping point
     * @member {sGis.Symbol} sGis.controls.Snapping#symbol
     * #default new PointSymbol({fillColor: 'red', size: 5})
     */
    Snapping.prototype.symbol = new PointSymbol({fillColor: 'red', size: 5});

    /**
     * Maximum distance in pixels from current point to the snapping point.
     * @member {Number} sGis.controls.Snapping#snappingDistance
     * #default 7
     */
    Snapping.prototype.snappingDistance = 7;

    /**
     * The feature that is being edited currently. Setting this property is necessary to prevent snapping to self, and to calculate certain types of snapping.
     * @member {sGis.Feature} sGis.controls.Snapping#activeFeature
     */
    Snapping.prototype.activeFeature = null;

    /**
     * If the feature that is being edited is a polyline or polygon, represents the contour index that is being edited currently.
     * @member {Number} sGis.controls.Snapping#activeRingIndex
     */
    Snapping.prototype.activeRingIndex = null;

    /**
     * If the feature that is being edited is a polyline or polygon, represents the point index in the contour that is being edited currently.
     * @member {Number} sGis.controls.Snapping#activePointIndex
     */
    Snapping.prototype.activePointIndex = null;

    var snapping = {
        vertex: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);

                if (feature.position) {
                    if (features[i] === activeFeature) continue;
                    if (Math.abs(feature.x - point.x) < distance && Math.abs(feature.y - point.y) < distance) {
                        return { position: feature.position, feature: features[i] };
                    }
                } else if (feature.rings) {
                    let rings = feature.rings;
                    for (let ring = 0; ring < rings.length; ring++) {
                        for (let j = 0; j < rings[ring].length; j++) {
                            if (features[i] === activeFeature && ring === activeRing && (Math.abs(j - activeIndex) < 2 || Math.abs(j - activeIndex) === rings[ring].length - 1)) continue;

                            if (Math.abs(rings[ring][j][0] - point.x) < distance && Math.abs(rings[ring][j][1] - point.y) < distance) {
                                return { position: rings[ring][j], feature: features[i], ring: ring, index: j };
                            }
                        }
                    }
                }
            }
        },

        midpoint: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let  i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;
                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j-1 === activeIndex || activeIndex === 0 && j === ring.length-1)) continue;

                        let midPointX = (ring[j][0] + ring[j-1][0]) / 2;
                        let midPointY = (ring[j][1] + ring[j-1][1]) / 2;

                        if (Math.abs(midPointX - point.x) < distance && Math.abs(midPointY - point.y) < distance) {
                            return { position: [midPointX, midPointY], feature: features[i], ring: ringIndex, index: j };
                        }
                    }
                }
            }
        },

        line: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;

                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        if (features[i] === activeFeature && ringIndex === activeRing && (j === activeIndex || j-1 === activeIndex || activeIndex === 0 && j === ring.length-1)) continue;

                        let projection = geotools.pointToLineProjection(point.position, [ring[j-1], ring[j]]);

                        let minX = Math.min(ring[j-1][0], ring[j][0]);
                        let maxX = Math.max(ring[j-1][0], ring[j][0]);
                        if (projection[0] >= minX && projection[0] <= maxX && Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            return { position: projection, feature: features[i], ring: ringIndex, index: j-1 };
                        }
                    }
                }
            }
        },

        axis: function(point, layer, distance, activeFeature, activeRing = null, activeIndex = null) {
            if (!activeFeature || activeRing === null || activeIndex === null) return null;

            let lines = [];
            let ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) ring.push(ring[0]);

            if (activeIndex < ring.length - 1) {
                lines.push([ring[activeIndex], ring[activeIndex + 1]]);
            }
            if (activeIndex === 0) {
                if (activeFeature.isEnclosed) lines.push([ring[activeIndex], ring[ring.length - 2]]);
            } else {
                lines.push([ring[activeIndex], ring[activeIndex - 1]]);
            }

            var basePoint = [];
            for (let i = 0; i < lines.length; i++) {
                for (let axis = 0; axis < 2; axis++) {
                    let projection = [lines[i][axis][0], lines[i][(axis + 1)%2][1]];
                    if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                        basePoint[(axis+1)%2] = lines[i][1][(axis+1)%2];
                        break;
                    }
                }
            }

            if (basePoint.length > 0) {
                let position = [basePoint[0] === undefined ? point.x : basePoint[0], basePoint[1] === undefined ? point.y : basePoint[1]];
                return { position: position, feature: activeFeature, ring: activeRing, index: activeIndex };
            }
        },

        orthogonal: function(point, layer, distance, activeFeature, activeRing = null, activeIndex = null) {
            if (!activeFeature || activeRing === null || activeIndex === null) return null;
            
            let lines = [];
            let ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) {
                var n = ring.length;
                lines.push([ring[(activeIndex+1) % n], ring[(activeIndex+2) % n]]);
                lines.push([ring[(n + activeIndex - 1) % n], ring[(n + activeIndex - 2) % n]]);
            } else {
                if (ring[activeIndex+2]) {
                    lines.push([ring[activeIndex+1], ring[activeIndex+2]]);
                }
                if (ring[activeIndex-2]) {
                    lines.push([ring[activeIndex-1], ring[activeIndex-2]]);
                }
            }

            for (let i = 0; i < lines.length; i++) {
                let projection = geotools.pointToLineProjection(point.position, lines[i]);
                let dx = projection[0] - lines[i][0][0];
                let dy = projection[1] - lines[i][0][1];
                if (Math.abs(dx) < distance && Math.abs(dy) < distance) {
                    let basePoint = [point.x - dx, point.y - dy];
                    let direction = i === 0 ? 1 : -1;
                    let nextPoint = n ? ring[(n + activeIndex + direction) % n] : ring[activeIndex + direction];
                    let prevPoint = n ? ring[(n + activeIndex - direction) % n] : ring[activeIndex - direction];
                    if (nextPoint && prevPoint) {
                        projection = geotools.pointToLineProjection(prevPoint, [ring[activeIndex], nextPoint]);
                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            basePoint = projection;
                        }
                    }
                    return { position: basePoint, feature: activeFeature, ring: activeRing, index: activeIndex };
                }
            }
        }
    };

    return Snapping;

    /**
     * @typedef {Object} sGis.controls.Snapping.SnappingResult
     * @prop {Position} position - position of the snapping point
     * @prop {sGis.Feature} feature - feature that the snapping snapped to
     * @prop {Number} ring - if the feature is sGis.feature.Poly instance, this property will contain the contour index which triggered snapping
     * @prop {Number} index - if the feature is sGis.feature.Poly instance, this property will contain the index of vertex in contour which is followed by snapping point.
     *                        E.g. if the point snapped to the [i, i+1] side of the ring, i will be set as the value of this property.
     */

});