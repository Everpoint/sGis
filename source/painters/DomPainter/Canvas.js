sGis.module('painter.domPainter.Canvas', [
    'render.Arc',
    'render.Point',
    'render.Polygon',
    'render.Polyline',
    'utils'
], (Arc, Point, Polygon, Polyline, utils) => {

    'use strict';

    /**
     * @alias sGis.painter.domPainter.Canvas
     */
    class Canvas {
        constructor() {
            this._setNode();
        }
        
        _setNode() {
            this._svgNode = document.createElement('canvas');
            this._ctx = this._svgNode.getContext('2d');
        }
        
        reset(bbox, resolution, width, height) {
            this._ctx.clearRect(0, 0, this._svgNode.width, this._svgNode.height);

            this._svgNode.width = width;
            this._svgNode.height = height;
            this._isEmpty = true;
            
            this._ctx.translate(-bbox.xMin / resolution, bbox.yMax / resolution);
        }
        
        get width() { return this._svgNode.width; }
        get height() { return this._svgNode.height; }
        
        draw(render) {
            if (render instanceof Arc) {
                this._drawArc(render);
            } else if (render instanceof Point) {
                this._drawPoint(render);
            } else if (render instanceof Polyline || render instanceof Polygon) {
                this._drawPoly(render);
            } else {
                utils.error('Unknown vector geometry type.');
            }
            
            this._isEmpty = false;
        }

        _drawArc(render) {
            var center = render.center;

            this._ctx.beginPath();
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;
            this._ctx.fillStyle = render.fillColor;

            this._ctx.arc(center[0], center[1], render.radius, 0, Math.PI * 2);
            this._ctx.fill();
            this._ctx.stroke();
        }

        _drawPoint(render) {
            this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
            this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
        }

        _drawPoly(render) {
            var coordinates = render.coordinates;

            this._ctx.beginPath();
            this._ctx.lineCap = 'round';
            this._ctx.lineJoin = 'round';
            this._ctx.lineWidth = render.strokeWidth;
            this._ctx.strokeStyle = render.strokeColor;

            for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
                this._ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
                for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                    this._ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
                }

                if (render instanceof Polygon) {
                    this._ctx.closePath();
                }
            }

            if (render instanceof Polygon) {
                if (render.fillStyle === 'color') {
                    this._ctx.fillStyle = render.fillColor;
                } else if (render.fillStyle === 'image') {
                    this._ctx.fillStyle = ctx.createPattern(render.fillImage, 'repeat');
                    var patternOffsetX = (coordinates[0][0][0]) % render.fillImage.width,
                        patternOffsetY = (coordinates[0][0][1]) % render.fillImage.height;
                    this._ctx.translate(patternOffsetX, patternOffsetY);
                }
                this._ctx.fill();

                this._ctx.translate(-patternOffsetX, -patternOffsetY);
            }

            this._ctx.stroke();
        }
        
        get isEmpty() { return this._isEmpty; }
        
        get node() { return this._svgNode; }
    }
    
    return Canvas;
    
});