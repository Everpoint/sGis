(function() {

    sGis.geom.Polygon = function (coordinates, options) {
        utils.init(this, options);

        this._coordinates = [[]];
        if (coordinates) this.coordinates = coordinates;
    };

    sGis.geom.Polygon.prototype = new sGis.geom.Polyline();

    Object.defineProperties(sGis.geom.Polygon.prototype, {
        _fillStyle: {
            value: 'color',
            writable: true
        },

        _fillColor: {
            value: 'transparent',
            writable: true
        },

        _fillImage: {
            value: null,
            writable: true
        },

        clone: {
            value: function () {
                return new sGis.geom.Polygon(this._coordinates, {
                    color: this._color,
                    width: this._width,
                    fillColor: this._fillColor
                });
            }
        },

        contains: {
            value: function (a, b) {
                var position = b && isValidPoint([a, b]) ? [a, b] : utils.isArray(a) && isValidPoint(a) ? a : a.x && a.y ? [a.x, a.y] : utils.error('Point coordinates are expecred but got ' + a + ' instead'),
                    coordinates = this._coordinates;

                return sGis.geotools.contains(coordinates, position, this.width / 2 + 2);
            }
        },

        fillStyle: {
            get: function () {
                return this._fillStyle;
            },

            set: function (style) {
                if (style === 'color') {
                    this._fillStyle = 'color';
                } else if (style === 'image') {
                    this._fillStyle = 'image';
                } else {
                    utils.error('Unknown fill style: ' + style);
                }
            }
        },

        fillColor: {
            get: function () {
                return this._fillColor;
            },

            set: function (color) {
                if (!utils.isString(color)) utils.error('Color string is expected, but got ' + color + ' instead');
                this._fillColor = color;
                this._clearCache();
            }
        },

        fillImage: {
            get: function () {
                return this._fillImage;
            },

            set: function (image) {
                if (!(image instanceof Image)) utils.error('Image is expected but got ' + image + ' istead');
                this._fillImage = image;
            }
        },

        svg: {
            get: function() {
                if (!this._cachedSvg) {
                    var path = this._getSvgPath();
                    path.d += ' Z';
                    path.d = path.d.replace(/ M/g, ' Z M');

                    this._cachedSvg = sGis.utils.svg.path({
                        stroke: this._color,
                        'stroke-width': this._width,
                        fill: this._fillStyle === 'color' ? this._fillColor : undefined,
                        fillImage: this._fillStyle === 'image' ? this._fillImage : undefined,
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
        }
    });

    function isValidPoint(point) {
        return utils.isArray(point) & utils.isNumber(point[0]) && utils.isNumber(point[1]);
    }

})();