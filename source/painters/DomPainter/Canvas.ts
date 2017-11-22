import {Arc} from "../../renders/Arc";
import {PolylineRender} from "../../renders/Polyline";
import {VectorImage} from "../../renders/VectorImage";
import {Point} from "../../renders/Point";
import {FillStyle, PolygonRender} from "../../renders/Polygon";
import {error} from "../../utils/utils";

/**
 * @alias sGis.painter.domPainter.Canvas
 * @ignore
 */
export class Canvas {
    private _canvasNode: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _isEmpty: boolean;

    constructor() {
        this._setNode();
    }

    _setNode() {
        this._canvasNode = document.createElement('canvas');
        this._canvasNode.style.pointerEvents = 'none';
        this._ctx = this._canvasNode.getContext('2d');
    }

    reset(bbox, resolution, width, height) {
        this._ctx.clearRect(0, 0, this._canvasNode.width, this._canvasNode.height);

        this._canvasNode.width = width;
        this._canvasNode.height = height;
        this._isEmpty = true;

        this._ctx.translate(Math.round(-bbox.xMin / resolution), Math.round(bbox.yMax / resolution));
    }

    get width() { return this._canvasNode.width; }
    get height() { return this._canvasNode.height; }

    draw(render) {
        if (render instanceof Arc) {
            this._drawArc(render);
        } else if (render instanceof Point) {
            this._drawPoint(render);
        } else if (render instanceof PolylineRender || render instanceof PolygonRender) {
            this._drawPoly(render);
        } else if (render instanceof VectorImage) {
            this._drawImage(render);
        } else {
            error('Unknown vector geometry type.');
        }

        this._isEmpty = false;
    }

    setIndex(index) {
        this._canvasNode.style.zIndex = index;
    }

    _drawArc(render) {
        var center = render.center;

        this._ctx.beginPath();
        this._ctx.lineWidth = render.strokeWidth;
        this._ctx.strokeStyle = render.strokeColor;
        this._ctx.fillStyle = render.fillColor;

        if (render.isSector) {
            this._ctx.moveTo(center[0], center[1]);
        }
        this._ctx.arc(center[0], center[1], render.radius, render.startAngle, render.endAngle, !render.clockwise);
        if (render.isSector) {
            this._ctx.lineTo(center[0], center[1]);
        }
        this._ctx.fill();
        this._ctx.stroke();
    }

    _drawPoint(render) {
        this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
        this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
    }

    _drawImage(render) {
        let [x, y] = render.origin;
        this._ctx.drawImage(render.node, Math.round(x), Math.round(y));
    }

    _drawPoly(render) {
        var coordinates = render.coordinates;

        this._ctx.beginPath();
        this._ctx.lineCap = 'round';
        this._ctx.lineJoin = 'round';
        this._ctx.lineWidth = render.strokeWidth;
        this._ctx.strokeStyle = render.strokeColor;
        this._ctx.setLineDash(render.lineDash || []);

        for (var ring = 0, ringsCount = coordinates.length; ring < ringsCount; ring++) {
            this._ctx.moveTo(coordinates[ring][0][0], coordinates[ring][0][1]);
            for (var i = 1, len = coordinates[ring].length; i < len; i++) {
                this._ctx.lineTo(coordinates[ring][i][0], coordinates[ring][i][1]);
            }

            if (render instanceof PolygonRender) {
                this._ctx.closePath();
            }
        }

        if (render instanceof PolygonRender) {
            if (render.fillStyle === FillStyle.Color) {
                this._ctx.fillStyle = render.fillColor;
            } else if (render.fillStyle === FillStyle.Image) {
                this._ctx.fillStyle = this._ctx.createPattern(render.fillImage, 'repeat');
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

    get node() { return this._canvasNode; }
}
