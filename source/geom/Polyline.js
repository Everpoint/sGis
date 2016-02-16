(function() {

    sGis.geom.Polyline = function(coordinates, options) {
        utils.init(this, options);

        this._coordinates = [[]];
        if (coordinates) this.coordinates = coordinates;
    };

    sGis.geom.Polyline.prototype = {
        _color: 'black',
        _width: 1,
        ignoreEvents: false,

        addPoint: function(point, ring) {
            if (!isValidPoint(point)) utils.error('Array of 2 coordinates is expected but got ' + point + ' instead');
            var ringAdj = ring || 0;
            this.setPoint(ringAdj, this._coordinates[ringAdj].length, point);
        },

        clone: function() {
            return new sGis.geom.Polyline(this._coordinates, {color: this._color, width: this._width});
        },

        contains: function(a, b) {
            var position = b && isValidPoint([a, b]) ? [a, b] : utils.isArray(a) && isValidPoint(a) ? a : utils.isNumber(a.x) && utils.isNumber(a.y) ? [a.x, a.y] : utils.error('Point coordinates are expecred but got ' + a + ' instead'),
                coordinates = this._coordinates;

            for (var ring = 0, l = coordinates.length; ring < l; ring++) {
                for (var i = 1, m = coordinates[ring].length; i < m; i++) {
                    if (pointToLineDistance(position, [coordinates[ring][i-1], coordinates[ring][i]]) < this._width / 2 + 2) return [ring, i - 1];
                }
            }
            return false;
        },

        getRing: function(index) {
            return this._coordinates[index] ? utils.copyArray(this._coordinates[index]) : undefined;
        },

        setRing: function(n, coordinates) {
            if (!utils.isArray(coordinates)) utils.error('Array is expected but got ' + coordinates + ' instead');
            if (!utils.isNumber(n)) utils.error('Number is expected for the ring index but got ' + n + ' instead');

            if (n > this._coordinates.length) n = this._coordinates.length;

            this._coordinates[n] = [];
            for (var i = 0, l = coordinates.length; i < l; i++) {
                this.setPoint(n, i, coordinates[i]);
            }
        },

        getPoint: function(ring, index) {
            return this._coordinates[ring] && this._coordinates[ring][index] ? [].concat(this._coordinates[ring][index]) : undefined;
        },

        setPoint: function(ring, n, point) {
            if (!isValidPoint(point)) utils.error('Array of 2 coordinates is expected but got ' + point + ' instead');
            if (this._coordinates[ring] === undefined) utils.error('The ring with index ' + ring + ' does not exist in the geometry');
            if (!utils.isNumber(n)) utils.error('Number is expected for the point index but got ' + n + ' instead');

            this._coordinates[ring][n] = [].concat(point);
        },

        _clearCache: function() {
            this._cachedSvg = null;
        },
        
        _getSvgPath: function() {
            var d = '';
            var coordinates = this._coordinates;
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

            var width = xmax - x + this._width;
            var height = ymax - y + this._width;
            x -= this._width / 2;
            y -= this._width / 2;
            d = d.trim();

            return {width: width, height: height, x: x, y: y, d: d};
        }
    };

    Object.defineProperties(sGis.geom.Polyline.prototype, {
        color: {
            get: function() {
                return this._color;
            },

            set: function(color) {
                if (!utils.isString(color)) utils.error('Unexpected value of color: ' + color);
                this._color = color;
                this._clearCache();
            }
        },

        width: {
            get: function() {
                return this._width;
            },

            set: function(width) {
                if (!utils.isNumber(width) || width < 0) utils.error('Unexpected value of width: ' + width);
                this._width = width;
                this._clearCache();
            }
        },

        coordinates: {
            get: function() {
                return utils.copyArray(this._coordinates);
            },
            set: function(coordinates) {
                if (!utils.isArray(coordinates)) utils.error('Array is expected but got ' + coordinates + ' instead');

                if (!utils.isArray(coordinates[0]) || !utils.isArray(coordinates[0][0])) {
                    this.setRing(0, coordinates);
                } else {
                    for (var i = 0, l = coordinates.length; i < l; i++) {
                        this.setRing(i, coordinates[i]);
                    }
                }

                if (this._cachedSvg) {
                    var props = this._getSvgPath();
                    this._cachedSvg.setAttribute('width', props.width);
                    this._cachedSvg.setAttribute('height', props.height);
                    this._cachedSvg.setAttribute('viewBox', [props.x, props.y, props.width, props.height].join(' '));
                    this._cachedSvg.childNodes[0].setAttribute('d', props.d);
                }
            }
        },

        svg: {
            get: function() {
                if (!this._cachedSvg) {
                    var path = this._getSvgPath();
                    this._cachedSvg = sGis.utils.svg.path({
                        stroke: this._color,
                        'stroke-width': this._width,
                        fill: 'transparent',
                        width: path.width,
                        height: path.height,
                        x: path.x,
                        y: path.y,
                        viewBox: [path.x, path.y, path.width, path.height].join(' '),
                        d: path.d
                    });
                }

                return this._cachedSvg;
            }
        },

        node: {
            get: function() {
                var svg = this.svg;
                var path;
                for (var i = 0; i < svg.childNodes.length; i++) {
                    if (svg.childNodes[i].nodeName === 'path') {
                        path = svg.childNodes[i];
                        var x = parseFloat(path.getAttribute('x'));
                        var y = parseFloat(path.getAttribute('y'));

                        svg.position = [x, y];
                        return svg;
                    }
                }
            }
        }
    });

    function isValidPoint(point) {
        return utils.isArray(point) & utils.isNumber(point[0]) && utils.isNumber(point[1]);
    }

    function pointToLineDistance(point, line) {
        var lx = line[1][0] - line[0][0],
            ly = line[1][1] - line[0][1],
            dx = line[0][0] - point[0],
            dy = line[0][1] - point[1],
            t = 0 - (dx * lx + dy * ly) / (lx * lx + ly * ly);

        t = t < 0 ? 0 : t > 1 ? 1 : t;
        var distance = Math.sqrt(Math.pow(lx * t + dx, 2) + Math.pow(ly * t + dy, 2));

        return distance;
    }

})();