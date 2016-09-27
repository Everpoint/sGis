sGis.module('controls.Circle', [
    'controls.PolyDrag',
    'feature.Polygon'
], function(PolyDrag, Polygon) {

    'use strict';

    /**
     * Control for drawing circles by dragging from center to the radius.
     * @alias sGis.controls.Circle
     * @extends sGis.controls.PolyDrag
     */
    class Circle extends PolyDrag {
        _startNewFeature(point) {
            this._centerPoint = point.position;
            this._activeFeature = new Polygon([[]], { crs: point.crs, symbol: this.symbol });
            this.tempLayer.add(this._activeFeature);
        }

        _updateFeature(point) {
            let radius = Math.sqrt(Math.pow(this._centerPoint[0] - point.position[0], 2) + Math.pow(this._centerPoint[1] - point.position[1], 2));
            let angleStep = 2 * Math.PI / this.segmentNo;

            let coordinates = [];
            for (var i = 0; i < this.segmentNo; i++) {
                coordinates.push([
                    this._centerPoint[0] + radius * Math.sin(angleStep * i),
                    this._centerPoint[1] + radius * Math.cos(angleStep * i)
                ]);
            }

            this._activeFeature.rings = [coordinates];
        }
    }

    /**
     * The number of segments of the circle. The higher this number is the smoother the circle will be.
     * @member {Number} sGis.controls.Circle#segmentNo
     */
    Circle.prototype.segmentNo = 36;

    return Circle;

});
