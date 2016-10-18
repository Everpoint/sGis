sGis.module('symbol.maptip.Simple', [
    'utils',
    'Symbol',
    'render.Polygon',
    'render.HtmlElement'
], function(utils, Symbol, PolygonRender, HtmlElement) {

    'use strict';

    /**
     * @namespace sGis.symbol.maptip
     */

    /**
     * Balloon over a map with html content.
     * @alias sGis.symbol.maptip.Simple
     * @extends sGis.Symbol
     */
    class MaptipSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Maptip */ feature, resolution, crs) {
            var point = feature.position.projectTo(crs);
            var position = [Math.round(point.x / resolution), - Math.round(point.y / resolution)];

            var balloonCoordinates = this._getBalloonCoordinates(position);
            var balloon = new PolygonRender(balloonCoordinates, {fillColor: 'white'});

            var divPosition = [position[0] + this.offset.x, position[1] + this.offset.y];
            var html = '<div style="width:' + this.width + 'px; height:' + this.height + 'px; background-color:white; overflow:auto;">' + feature.content + '</div>';
            var divRender = new HtmlElement(html, divPosition);

            return [balloon, divRender];
        }

        _getBalloonCoordinates(position) {
            var balloonSquare = this._getBalloonSquare(position);

            if (isInside(position, balloonSquare)) return balloonSquare;

            var tailBase = getTailBasePoint(position, balloonSquare),
                startIndex = tailBase.index,
                tailBaseLine = getTailBaseLine(tailBase, balloonSquare),
                contour = [position, tailBaseLine[0]];

            if (!isOnTheLine(tailBaseLine[0], [balloonSquare[startIndex], balloonSquare[(startIndex + 1) % 4]])) startIndex++;
            for (var i = 1; i <= 4; i++) {
                contour.push(balloonSquare[(startIndex + i) % 4]);
                if (isOnTheLine(tailBaseLine[1], [balloonSquare[(startIndex + i) % 4], balloonSquare[(startIndex + i + 1) % 4]])) break;
            }

            contour.push(tailBaseLine[1]);
            return contour;
        }

        _getBalloonSquare(position) {
            var offset = this.offset;
            var x = position[0] + offset.x;
            var y = position[1] + offset.y;
            var width = this.width;
            var height = this.height;
            return [
                [x - 1, y],
                [x + width, y],
                [x + width, y + height + 1],
                [x - 1, y + height + 1]
            ];
        }
    }
    
    /**
     * Width of the balloon.
     * @member {Number} width
     * @memberof sGis.symbol.maptip.Simple
     * @instance
     * @default 200
     */
    MaptipSymbol.prototype.width = 200;

    /**
     * Height of the balloon.
     * @member {Number} height
     * @memberof sGis.symbol.maptip.Simple
     * @instance
     * @default 200
     */
    MaptipSymbol.prototype.height = 200;

    /**
     * Offset of the balloon from the position of the maptip feature. The arrow of the balloon will point to the feature position, and the left top corner of the rectangle will be have offset by this value.
     * @member {Object} offset
     * @memberof sGis.symbol.maptip.Simple
     * @instance
     * @default {x: -100, y: -220}
     */
    MaptipSymbol.prototype.offset = { x: -100, y: -220 };

    function getTailBaseLine(tailBase, balloonSquare) {
        var point = tailBase.point,
            index = tailBase.index,
            square = balloonSquare.concat([balloonSquare[0]]),
            side = index % 2,
            opSide = (side + 1) % 2,
            direction = index < 2 ? 1 : -1,
            length = 10,
            d1 = (square[index + 1][side] - point[side]) * direction,
            d2 = (point[side] - square[index][side]) * direction,
            baseLine = [[], []];

        if (d1 >= length) {
            baseLine[0][side] = point[side] + length * direction;
            baseLine[0][opSide] = point[opSide];
        } else {
            var k = index === 1 || index === 3 ? -1 : 1;
            baseLine[0][opSide] = point[opSide] + (length - d1) * direction * k;
            baseLine[0][side] = square[index + 1][side];
        }

        if (d2 >= length) {
            baseLine[1][side] = point[side] - length * direction;
            baseLine[1][opSide] = point[opSide];
        } else {
            var k = index === 0 || index === 2 ? -1 : 1;
            baseLine[1][opSide] = point[opSide] - (length - d2) * direction * k;
            baseLine[1][side] = square[index][side];
        }

        return baseLine;
    }

    function isInside(position, square) {
        return position[0] >= square[0][0] &&
            position[0] <= square[2][0] &&
            position[1] >= square[0][1] &&
            position[1] <= square[2][1];
    }

    function getTailBasePoint(position, balloonSquare) {
        var square = balloonSquare.concat([balloonSquare[0]]),
            center = [(square[0][0] + square[2][0]) / 2, (square[0][1] + square[2][1]) / 2];
        for (var i = 0; i < 4; i++) {
            var side = (i + 1) % 2,
                direction = i === 1 || i === 2 ? 1 : -1;
            if (position[side] * direction > square[i][side] * direction) {
                var intersectionPoint = getIntersectionPoint([position, center], [square[i], square[i + 1]]);
                if (isOnTheLine(intersectionPoint, [square[i], square[i + 1]])) return {point: intersectionPoint, index: i};
            }
        }
    }

    function isOnTheLine(point, line) {
        var x1 = Math.min(line[0][0], line[1][0]),
            x2 = Math.max(line[0][0], line[1][0]),
            y1 = Math.min(line[0][1], line[1][1]),
            y2 = Math.max(line[0][1], line[1][1]);
        return point[0] >= (x1 - 0.1) && point[0] <= (x2 + 0.1) && point[1] >= (y1 - 0.1) && point[1] <= (y2 + 0.1);
    }

    function getIntersectionPoint(a, b) {
        var dx1 = a[0][0] - a[1][0],
            dx2 = b[0][0] - b[1][0],
            dy1 = a[0][1] - a[1][1],
            dy2 = b[0][1] - b[1][1],
            da = (a[0][0] * a[1][1] - a[0][1] * a[1][0]),
            db = (b[0][0] * b[1][1] - b[0][1] * b[1][0]),
            divisor = (dx1 * dy2 - dy1 * dx2),
            x = (da * dx2 - dx1 * db) / divisor,
            y = (da * dy2 - dy1 * db) / divisor;

        return [x, y];
    }

    return MaptipSymbol;
    
});