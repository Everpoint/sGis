import {Arc} from "../../renders/Arc";
import {Point} from "../../renders/Point";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {error, isChrome, isOpera} from "../../utils/utils";
import {RenderForCanvas} from "./LayerRenderer";
import {StaticVectorImageRender} from "../../renders/StaticVectorImageRender";
import {VectorLabel} from "../../renders/VectorLabel";
import {Bbox} from "../../Bbox";

/**
 * @alias sGis.painter.domPainter.Canvas
 * @ignore
 */
export class Canvas {
    private _canvasNode: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _isEmpty: boolean;

    bbox: Bbox;

    constructor(canvasNode?: HTMLCanvasElement) {
        if (canvasNode) {
          this._canvasNode = canvasNode;
          this._ctx = this._canvasNode.getContext('2d');
        } else {
          this._createNode();
        }
    }

    _createNode() {
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
        this.bbox = bbox;
    }

    get width() { return this._canvasNode.width; }
    get height() { return this._canvasNode.height; }

    draw(render: RenderForCanvas) {
        if (render instanceof Arc) {
            this._drawArc(render);
        } else if (render instanceof Point) {
            this._drawPoint(render);
        } else if (render instanceof PolyRender) {
            this._drawPoly(render);
        } else if (render instanceof StaticVectorImageRender || render instanceof VectorLabel) {
            this._drawImage(render);
        } else {
            error('Unknown vector geometry type.');
        }

        this._isEmpty = false;
    }

    setIndex(index) {
        this._canvasNode.style.zIndex = index;
    }

    _drawArc(render: Arc) {
        const center = render.center;

        this._ctx.beginPath();
        this._ctx.lineWidth = render.strokeWidth;
        this._ctx.strokeStyle = render.strokeColor;
        this._ctx.fillStyle = render.fillColor;
        this._ctx.setLineDash(render.lineDash || []);
        this._ctx.lineCap = render.lineCap;

        if (render.isSector) {
            this._ctx.moveTo(center[0], center[1]);
        }

        if (isChrome || isOpera) {
            let step = 0.01;
            let start = render.startAngle;
            let end = render.endAngle;

            if (!render.clockwise) {
                end -= step / 2;
                for (let ang = start; Math.abs(ang) < end; ang -= step) {
                    this._ctx.lineTo(
                        Math.cos(ang) * render.radius + center[0],
                        Math.sin(ang) * render.radius + center[1],
                    );
                }
            } else {
                end += step / 2;
                for (let ang = start; ang < end; ang += step) {
                    this._ctx.lineTo(
                        Math.cos(ang) * render.radius + center[0],
                        Math.sin(ang) * render.radius + center[1],
                    );
                }
            }

            this._ctx.lineTo(
                Math.cos(render.clockwise ? render.endAngle : -render.endAngle) * render.radius + center[0],
                Math.sin(render.clockwise ? render.endAngle : -render.endAngle) * render.radius + center[1],
            );
        } else {
            this._ctx.arc(center[0], center[1], render.radius, render.startAngle, render.endAngle, !render.clockwise);
        }

        if (render.isSector) {
            this._ctx.lineTo(center[0], center[1]);
        }
        this._ctx.fill();
        this._ctx.stroke();
    }

    _drawPoint(render: Point) {
        this._ctx.strokeStyle = this._ctx.fillStyle = render.color;
        this._ctx.fillRect(render.coordinates[0], render.coordinates[1], 1, 1);
    }

    _drawImage(render: StaticVectorImageRender | VectorLabel) {
        let [x, y] = render.position;

        x = Math.round(x);
        y = Math.round(y);

        this._ctx.translate(x, y);

        if (!(render instanceof VectorLabel)) {
            this._ctx.rotate(render.angle);
        }

        let opacity = !(render instanceof VectorLabel) ? render.opacity : 1;
        if (opacity !== 1) this._ctx.globalAlpha = opacity;

        this._ctx.drawImage(render.node, render.offset[0], render.offset[1], render.width, render.height);

        if (opacity !== 1) this._ctx.globalAlpha = 1;

        if (!(render instanceof VectorLabel)) {
            this._ctx.rotate(-render.angle);
        }
        this._ctx.translate(-x, -y);
    }

    private _drawLines(render: PolyRender) {
        const coordinates = render.coordinates;

        for (let i = 0, ringsCount = coordinates.length; i < ringsCount; i++) {
            const ring = coordinates[i]

            this._ctx.moveTo(ring[0][0], ring[0][1]);

            for (let j = 1, len = ring.length; j < len; j++) {
                this._ctx.lineTo(ring[j][0], ring[j][1]);
            }
            if (render.enclosed) {
                this._ctx.closePath();
            }
        }
    }
    private _resetShadow() {
        this._ctx.shadowOffsetX = 0;
        this._ctx.shadowOffsetY = 0;
        this._ctx.shadowBlur = 0;
        this._ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    }

    private _setShadow(render: PolyRender | null) {
        if (render === null || render.shadow === null) {
            this._resetShadow();
        } else {
            const {offsetX, offsetY, blur, color, isOuter} = render.shadow;

            this._ctx.shadowOffsetX = offsetX;
            this._ctx.shadowOffsetY = offsetY;
            this._ctx.shadowBlur = blur;
            this._ctx.shadowColor = color;

            if (isOuter) {
                this._ctx.fillStyle = color;
                this._ctx.fill();

                this._resetShadow();
                this._ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                this._ctx.globalCompositeOperation = 'destination-out';
                this._ctx.fill();

                this._ctx.fillStyle = render.fillColor;
                this._ctx.globalCompositeOperation = 'source-over';
            }
        }
    }

    _drawPoly(render: PolyRender) {
        const coordinates = render.coordinates;

        this._ctx.beginPath();

        this._ctx.lineCap = render.lineCap;
        this._ctx.lineJoin = render.lineJoin;
        this._ctx.miterLimit = render.miterLimit;
        this._ctx.lineWidth = render.strokeWidth;
        this._ctx.strokeStyle = render.strokeWidth <= 0 ? "transparent" : render.strokeColor;
        this._ctx.setLineDash(render.lineDash || []);

        this._drawLines(render);
        this._setShadow(render);

        if (render.isOutsideStroke) {
            this._ctx.lineWidth = render.strokeWidth * 2;
            this._ctx.stroke();
            this._ctx.globalCompositeOperation = "destination-out";
            this._ctx.fillStyle = "#000";
            this._ctx.fill();
            this._ctx.globalCompositeOperation = 'source-over';
        }

        if (render.fillStyle === FillStyle.Color) {
            this._ctx.fillStyle = render.fillColor;
            this._ctx.fill();
        } else if (render.fillStyle === FillStyle.Image) {
            this._ctx.fillStyle = this._ctx.createPattern(render.fillImage, 'repeat');
            const patternOffsetX = (coordinates[0][0][0]) % render.fillImage.width,
                patternOffsetY = (coordinates[0][0][1]) % render.fillImage.height;

            this._ctx.translate(patternOffsetX, patternOffsetY);
            this._ctx.fill();
            this._ctx.translate(-patternOffsetX, -patternOffsetY);
        }

        if (render.enclosed) {
            this._setShadow(null);
        }

        if (render.isInsideStroke) {
            this._ctx.lineWidth = render.strokeWidth * 2;
            this._ctx.clip();
            this._ctx.stroke();
        }

        if (!render.isOutsideStroke && !render.isInsideStroke) {
            this._ctx.stroke();
        }
    }

    get isEmpty() { return this._isEmpty; }

    get node() { return this._canvasNode; }
}
