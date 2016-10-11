sGis.module('controls.Snapping', [
    'Control',
    'FeatureLayer',
    'feature.Point',
    'symbol.point.Point',
    'geotools'
], (Control, FeatureLayer, PointFeature, PointSymbol, geotools) => {

    'use strict';

    class Snapping extends Control {
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
        }

        _removeListeners() {
            this.map.off('mousemove', this._onMouseMove);
        }

        _onMouseMove(sGisEvent) {
            let point = sGisEvent.point;
            let snapping = this.getSnapping(point);

            this._tempLayer.features = snapping ? [ new PointFeature(snapping.position, {crs: point.crs, symbol: this.symbol}) ] : [];

            sGisEvent.snapping = snapping;
        }

        getSnapping(point) {
            let distance = this.map.resolution * this.snappingDistance;
            for (var i = 0; i < this.snappingTypes.length; i++) {
                let snappingResult = snapping[this.snappingTypes[i]](point, this.activeLayer, distance, this.activeFeature, this.activeRingIndex, this.activePointIndex);
                if (snappingResult) return snappingResult;
            }
            return null;
        }
    }

    Snapping.prototype.snappingTypes = ['vertex', 'midpoint', 'line', 'axis', 'orthogonal'];

    Snapping.prototype.symbol = new PointSymbol({fillColor: 'red', size: 5});

    Snapping.prototype.snappingDistance = 7;

    Snapping.prototype.activeFeature = null;
    Snapping.prototype.activeRingIndex = null;
    Snapping.prototype.activePointIndex = null;

    var snapping = {
        vertex: function(point, layer, distance, activeFeature) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                if (features[i] === activeFeature) continue;

                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);

                if (feature.position) {
                    if (Math.abs(feature.x - point.x) < distance && Math.abs(feature.y - point.y) < distance) {
                        return { position: feature.position, feature: features[i] };
                    }
                } else if (feature.rings) {
                    let rings = feature.rings;
                    for (let ring = 0; ring < rings.length; ring++) {
                        for (let j = 0; j < rings[ring].length; j++) {
                            if (Math.abs(rings[ring][j][0] - point.x) < distance && Math.abs(rings[ring][j][1] - point.y) < distance) {
                                return { position: rings[ring][j], feature: features[i], ring: ring, index: j };
                            }
                        }
                    }
                }
            }
        },

        midpoint: function(point, layer, distance) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let  i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;
                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        let midPointX = (ring[j][0] + ring[j-1][0]) / 2;
                        let midPointY = (ring[j][1] + ring[j-1][1]) / 2;

                        if (Math.abs(midPointX - point.x) < distance && Math.abs(midPointY - point.y) < distance) {
                            return { position: [midPointX, midPointY], feature: features[i], ring: ringIndex, index: j };
                        }
                    }
                }
            }
        },

        line: function(point, layer, distance) {
            let bbox = new sGis.Bbox([point.x - distance, point.y - distance], [point.x + distance, point.y + distance], point.crs);
            let features = layer.getFeatures(bbox);

            for (let i = 0; i < features.length; i++) {
                if (!features[i].rings) continue;

                let feature = features[i].crs.equals(point.crs) ? features[i] : features[i].projectTo(point.crs);
                let rings = feature.rings;

                for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
                    let ring = feature.isEnclosed ? rings[ringIndex].concat([rings[ringIndex][0]]) : rings[ringIndex];

                    for (let j = 1; j < ring.length; j++) {
                        let projection = geotools.pointToLineProjection(point.position, [ring[j-1], ring[j]]);

                        if (Math.abs(projection[0] - point.x) < distance && Math.abs(projection[1] - point.y) < distance) {
                            return { position: projection, feature: features[i], ring: ringIndex, index: j-1 };
                        }
                    }
                }
            }
        },

        axis: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            if (!activeFeature || !activeRing || !activeIndex) return null;

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

        orthogonal: function(point, layer, distance, activeFeature, activeRing, activeIndex) {
            let lines = [];
            let ring = activeFeature.rings[activeRing].slice();
            if (activeFeature.isEnclosed) {
                let n = ring.length;
                lines.push([ring[(activeIndex+1) % n], ring[(activeIndex+2) % n]]);
                lines.push([ring[(n + activeIndex - 1) % n], ring[(n + activeIndex - 2) % n]]);
            } else {
                if (ring[index+2]) {
                    lines.push([ring[activeIndex+1], ring[activeIndex+2]]);
                }
                if (ring[index-2]) {
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

});