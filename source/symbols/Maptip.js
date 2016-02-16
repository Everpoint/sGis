(function() {

    sGis.symbol.maptip = {
        Simple: function(style) {
            utils.init(this, style);
        }
    };

    sGis.symbol.maptip.Simple.prototype = new sGis.Symbol({
        _width: 200,
        _height: 200,
        _offset: {x: -100, y: -220},

        renderFunction: function(feature, resolution, crs) {
            if (this._changed || this._cacheResolution !== resolution) {
                feature.clearCache();
                this._changed = false;
            }

            var point = feature.position.projectTo(crs),
                position = [Math.round(point.x / resolution), - Math.round(point.y / resolution)];

            if (!feature._cache) {
                var baloonCoordinates = getBaloonCoordinates(feature, position);

                feature._cache = [new sGis.geom.Polygon(baloonCoordinates, {fillColor: 'white'})];

                var div = document.createElement('div'),
                    divPosition = [position[0] + this.offset.x, position[1] + this.offset.y];

                if (utils.isNode(feature.content)) {
                    div.appendChild(feature.content);
                } else {
                    utils.html(div, feature.content);
                }
                div.style.position = 'absolute';
                div.style.height = this.height + 'px';
                div.style.width = this.width + 'px';
                div.style.backgroundColor = 'white';
                div.style.overflow = 'auto';
                div.position = divPosition;

                var divRender = {
                    node: div,
                    position: position
                };

                feature._cache.push(divRender);

                this._cacheResolution = resolution;
            }

            return feature._cache;
        }
    });

    Object.defineProperties(sGis.symbol.maptip.Simple.prototype, {
        type: {
            value: 'maptip'
        },

        width: {
            get: function() {
                return this._width;
            },
            set: function(width) {
                this._width = width;
                this._changed = true;
            }
        },

        height: {
            get: function() {
                return this._height;
            },
            set: function(height) {
                this._height = height;
                this._changed = true;
            }
        },

        offset: {
            get: function() {
                return this._offset;
            },
            set: function(offset) {
                this._offset = offset;
                this._changed = true;
            }
        }
    });


    function getBaloonCoordinates(feature, position) {
        var baloonSquare = getBaloonSquare(feature, position);

        if (isInside(position, baloonSquare)) return baloonSquare;

        var tailBase = getTailBasePoint(position, baloonSquare),
            startIndex = tailBase.index,
            tailBaseLine = getTailBaseLine(tailBase, baloonSquare),
            contour = [position, tailBaseLine[0]];

        if (!isOnTheLine(tailBaseLine[0], [baloonSquare[startIndex], baloonSquare[(startIndex + 1) % 4]])) startIndex++;
        for (var i = 1; i <= 4; i++) {
            contour.push(baloonSquare[(startIndex + i) % 4]);
            if (isOnTheLine(tailBaseLine[1], [baloonSquare[(startIndex + i) % 4], baloonSquare[(startIndex + i + 1) % 4]])) break;
        }

        contour.push(tailBaseLine[1]);
        return contour;
    }

    function getTailBaseLine(tailBase, baloonSquare) {
        var point = tailBase.point,
            index = tailBase.index,
            square = baloonSquare.concat([baloonSquare[0]]),
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

    function getBaloonSquare(feature, position) {
        var offset = feature.style.offset,
            x = position[0] + offset.x,
            y = position[1] + offset.y,
            width = feature.style.width,
            height = feature.style.height,
            square = [
                [x - 1, y],
                [x + width, y],
                [x + width, y + height + 1],
                [x - 1, y + height + 1]
            ];
        return square;
    }

    function isInside(position, square) {
        return position[0] >= square[0][0] &&
            position[0] <= square[2][0] &&
            position[1] >= square[0][1] &&
            position[1] <= square[2][1];
    }

    function getTailBasePoint(position, baloonSquare) {
        var square = baloonSquare.concat([baloonSquare[0]]),
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
            devisor = (dx1 * dy2 - dy1 * dx2),
            x = (da * dx2 - dx1 * db) / devisor,
            y = (da * dy2 - dy1 * db) / devisor;

        return [x, y];
    }

})();