import {Arc} from "../../renders/Arc";
import {FillStyle, PolyRender} from "../../renders/Poly";
import {getGuid} from "../../utils/utils";
import {Color} from "../../utils/Color";

var NS = 'http://www.w3.org/2000/svg';

/**
 * @alias sGis.painter.domPainter.SvgRender
 */
export class SvgRender{
    private _baseRender: any;
    private _adjK: number;
    private _node: Element;
    private _position: [number, number];

    constructor(render, adjK = 1) {
        this._baseRender = render;
        this._adjK = adjK;
    }

    getNode(callback) {
        if (!this._node) this._setNode();
        callback(null, this._node);
    }

    get baseRender() { return this._baseRender; }
    get position() { return this._position; }

    _setNode() {
        if (this._baseRender instanceof Arc) {
            if (this._baseRender.startAngle == 0 || this._baseRender.endAngle == 2*Math.PI) {
                this._setArcNode();
            } else {
                this._setSegmentNode();
            }
        } else if (this._baseRender instanceof PolyRender) {
            this._setPolyNode();
        }
    }

    _setPolyNode() {
        var path = this._getSvgPath();

        if (this._baseRender.enclosed) {
            path.d += ' Z';
            path.d = path.d.replace(/ M/g, ' Z M');
        }

        this._node = this._getPathNode({
            stroke: this._baseRender.strokeColor,
            'stroke-dasharray': this._baseRender.lineDash && this._baseRender.lineDash.length > 0 ? this._baseRender.lineDash.join(',') : undefined,
            'stroke-width': this._baseRender.strokeWidth,
            fill: this._baseRender.fillStyle === FillStyle.Color ? this._baseRender.fillColor : undefined,
            fillImage: this._baseRender.fillStyle === FillStyle.Image ? this._baseRender.fillImage : undefined,
            width: path.width,
            height: path.height,
            x: path.x,
            y: path.y,
            viewBox: [path.x, path.y, path.width, path.height].join(' '),
            d: path.d
        });

        this._position = [path.x, path.y];
    }

    _getPathNode(properties) {
        if (properties.fillImage) {
            var defs = document.createElementNS(NS, 'defs');
            var pattern = document.createElementNS(NS, 'pattern');
            var id = getGuid();
            pattern.setAttribute('id', id);
            pattern.setAttribute('patternUnits', 'userSpaceOnUse');
            pattern.setAttribute('x', properties.x);
            pattern.setAttribute('y', properties.y);
            pattern.setAttribute('width', properties.fillImage.width);
            pattern.setAttribute('height', properties.fillImage.height);

            var image = document.createElementNS(NS, 'image');
            image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', properties.fillImage.src);
            image.setAttribute('width', properties.fillImage.width);
            image.setAttribute('height', properties.fillImage.height);

            pattern.appendChild(image);
            defs.appendChild(pattern);
        }

        var path = document.createElementNS(NS, 'path');
        var svgAttributes = setAttributes(path, properties);
        var svg = this._getSvgBase(svgAttributes);

        if (properties.fillImage) {
            svg.setAttribute('xmlns', NS);
            svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

            path.setAttribute('fill', 'url(#' + id + ')');
            svg.appendChild(defs);
        }

        svg.appendChild(path);

        return svg;
    }

    _setSegmentNode() {
        var path = this._getSegment();
        this._node = this._getPathNode({
            stroke: this._baseRender.strokeColor,
            'stroke-width': this._baseRender.strokeWidth,
            fill: this._baseRender.fillColor,
            width: path.width,
            height: path.height,
            x: path.x,
            y: path.y,
            viewBox: [path.x, path.y, path.width, path.height].join(' '),
            d: path.d
        });

        this._position = [path.x, path.y];
    }

    _getSegment() {
        var r = this._baseRender.radius;
        var r2 = r * 2 + this._baseRender.strokeWidth;
        var x = this._baseRender.center[0];
        var y = this._baseRender.center[1];

        var x1 = x + r * Math.cos(this._baseRender.startAngle);
        var y1 = y + r * Math.sin(this._baseRender.startAngle);

        var x2 = x + r * Math.cos(this._baseRender.endAngle);
        var y2 = y + r * Math.sin(this._baseRender.endAngle);

        var largeFlag = Math.abs(this._baseRender.endAngle - this._baseRender.startAngle) % (Math.PI * 2) > Math.PI ? 1 : 0;

        var path = `M ${x},${y} L ${x1},${y1} A ${r},${r} 0 ${largeFlag} 1 ${x2},${y2}`;
        var x0 = x - r - this._baseRender.strokeWidth / 2;
        var y0 = y - r - this._baseRender.strokeWidth / 2;

        return {x: x0, y: y0, width: r2, height: r2, d: path};
    }

    _setArcNode() {
        var r2 = this._baseRender.radius * 2 + this._baseRender.strokeWidth;
        var x = this._baseRender.center[0] * this._adjK - this._baseRender.radius - this._baseRender.strokeWidth / 2;
        var y = this._baseRender.center[1] * this._adjK - this._baseRender.radius - this._baseRender.strokeWidth / 2;

        this._node = this._getCircle({
            r: this._baseRender.radius,
            cx: this._baseRender.center[0] * this._adjK,
            cy: this._baseRender.center[1] * this._adjK,
            stroke: this._baseRender.strokeColor,
            'stroke-width': this._baseRender.strokeWidth,
            fill: this._baseRender.fillColor,

            width: r2,
            height: r2,
            viewBox: [x, y, r2, r2].join(' ')
        });

        this._position = [x, y];
    }

    _getCircle(properties) {
        var circle = document.createElementNS(NS, 'circle');
        var svgAttributes = setAttributes(circle, properties);
        var svg = this._getSvgBase(svgAttributes);

        svg.appendChild(circle);

        return svg;
    }

    _getSvgBase(properties) {
        var svg = document.createElementNS(NS, 'svg');
        setAttributes(svg, properties);
        svg.setAttribute('style', 'pointerEvents: none;');

        return svg;
    }

    _getSvgPath() {
        var d = '';
        var coordinates = this._baseRender.coordinates;
        var x = coordinates[0][0][0] * this._adjK;
        var y = coordinates[0][0][1] * this._adjK;
        var xMax = x;
        var yMax = y;

        for (var ring = 0; ring < coordinates.length; ring++) {
            d += 'M' + this._adj(coordinates[ring][0]).join(' ') + ' ';
            for (var i = 1; i < coordinates[ring].length; i++) {
                d += 'L' + this._adj(coordinates[ring][i]).join(' ') + ' ';
                x = Math.min(x, coordinates[ring][i][0] * this._adjK);
                y = Math.min(y, coordinates[ring][i][1] * this._adjK);
                xMax = Math.max(xMax, coordinates[ring][i][0] * this._adjK);
                yMax = Math.max(yMax, coordinates[ring][i][1] * this._adjK);
            }
        }

        var width = xMax - x + this._baseRender.strokeWidth;
        var height = yMax - y + this._baseRender.strokeWidth;
        x -= this._baseRender.strokeWidth / 2;
        y -= this._baseRender.strokeWidth / 2;
        d = d.trim();

        return {width: width, height: height, x: x, y: y, d: d};
    }

    _adj(position) {
        return [position[0] * this._adjK, position[1] * this._adjK];
    }
}

var svgAttributes = ['width', 'height', 'viewBox'];
function setAttributes(element, attributes) {
    var isSvg = element instanceof SVGSVGElement;
    var notSet = {};
    for (var i in attributes) {
        if (attributes.hasOwnProperty(i) && i !== 'fillImage' && attributes[i] !== undefined) {
            if (!isSvg && svgAttributes.indexOf(i) !== -1) {
                notSet[i] = attributes[i];
                continue;
            }

            if (i === 'stroke' || i === 'fill') {
                var color = new Color(attributes[i]);
                if (color.a < 255 || color.format === 'rgba') {
                    element.setAttribute(i, color.toString('rgb'));
                    if (color.a < 255) element.setAttribute(i + '-opacity', color.a / 255);
                    continue;
                }
            }
            element.setAttribute(i, attributes[i]);
        }
    }

    return notSet;
}
