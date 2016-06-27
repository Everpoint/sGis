sGis.module('painter.domPainter.SvgRender', [
    'render.Arc',
    'render.Point',
    'render.Polyline',
    'render.Polygon',
    'utils.Color'
], (Arc, Point, Polyline, Polygon, Color) => {
    
    'use strict';
   
    var NS = 'http://www.w3.org/2000/svg';
    
    class SvgRender{
        constructor(render) {
            this._baseRender = render;
        }
        
        getNode(callback) {
            if (!this._node) this._setNode();
            callback(null, this._node);
        }

        get baseRender() { return this._baseRender; }
        get position() { return this._position; }
        
        _setNode() {
            if (this._baseRender instanceof Arc) {
                this._setArcNode();
            } else if (this._baseRender instanceof Polygon) {
                this._setPolygonNode();
            } else if (this._baseRender instanceof Polyline) {
                this._setPolylineNode();
            }
        }
        
        _setPolygonNode() {
            var path = this._getSvgPath();
            path.d += ' Z';
            path.d = path.d.replace(/ M/g, ' Z M');

            this._node = this._getPathNode({
                stroke: this._baseRender.strokeColor,
                'stroke-width': this._baseRender.strokeWidth,
                fill: this._baseRender.fillStyle === 'color' ? this._baseRender.fillColor : undefined,
                fillImage: this._baseRender.fillStyle === 'image' ? this._baseRender.fillImage : undefined,
                width: path.width,
                height: path.height,
                x: path.x,
                y: path.y,
                viewBox: [path.x, path.y, path.width, path.height].join(' '),
                d: path.d
            });

            this._position = [path.x, path.y];
        }
        
        _setPolylineNode() {
            var path = this._getSvgPath();
            this._node = this._getPathNode({
                stroke: this._baseRender.strokeColor,
                'stroke-width': this._baseRender.strokeWidth,
                fill: 'transparent',
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
                var id = sGis.utils.getGuid();
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

        _setArcNode() {
            var r2 = this._baseRender.radius * 2 + this._baseRender.strokeWidth;
            var x = this._baseRender.center[0] - this._baseRender.radius - this._baseRender.strokeWidth / 2;
            var y = this._baseRender.center[1] - this._baseRender.radius - this._baseRender.strokeWidth / 2;

            this._node = this._getCircle({
                r: this._baseRender.radius,
                cx: this._baseRender.center[0],
                cy: this._baseRender.center[1],
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
            var x = coordinates[0][0][0];
            var y = coordinates[0][0][1];
            var xmax = x;
            var ymax = y;

            for (var ring = 0; ring < coordinates.length; ring++) {
                d += 'M' + coordinates[ring][0].join(' ') + ' ';
                for (var i = 1; i < coordinates[ring].length; i++) {
                    d += 'L' + coordinates[ring][i].join(' ') + ' ';
                    x = Math.min(x, coordinates[ring][i][0]);
                    y = Math.min(y, coordinates[ring][i][1]);
                    xmax = Math.max(xmax, coordinates[ring][i][0]);
                    ymax = Math.max(ymax, coordinates[ring][i][1]);
                }
            }

            var width = xmax - x + this._baseRender.width;
            var height = ymax - y + this._baseRender.width;
            x -= this._baseRender.width / 2;
            y -= this._baseRender.width / 2;
            d = d.trim();

            return {width: width, height: height, x: x, y: y, d: d};
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

    return SvgRender;
    
});