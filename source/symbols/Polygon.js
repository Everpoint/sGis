(function() {

    sGis.symbol.polygon = {
        Simple: function(style) {
            utils.init(this, style, true);
        },
        BrushFill: function(style) {
            utils.init(this, style, true);
        },
        ImageFill: function(style) {
            utils.init(this, style, true);
        }
    };

    var defaultBrush =
       [[255,255,  0,  0,  0,   0,  0,  0,255,255],
        [255,255,255,  0,  0,   0,  0,  0,  0,255],
        [255,255,255,255,  0,   0,  0,  0,  0,  0],
        [  0,255,255,255,255,   0,  0,  0,  0,  0],
        [  0,  0,255,255,255, 255,  0,  0,  0,  0],
        [  0,  0,  0,255,255, 255,255,  0,  0,  0],
        [  0,  0,  0,  0,255, 255,255,255,  0,  0],
        [  0,  0,  0,  0,  0, 255,255,255,255,  0],
        [  0,  0,  0,  0,  0,   0,255,255,255,255],
        [255,  0,  0,  0,  0,   0,  0,255,255,255]];


    sGis.symbol.polygon.Simple.prototype = new sGis.Symbol({
        _strokeWidth: 1,
        _strokeColor: 'black',
        _fillColor: 'transparent',

        renderFunction: function(feature, resolution, crs) {
            var coordinates = getPolylineRenderedCoordinates(feature, resolution, crs);
            return [new sGis.geom.Polygon(coordinates, {color: this.strokeColor, width: this.strokeWidth, fillColor: this.fillColor})];
        },

        clone: function() {
            return new sGis.symbol.polygon.Simple({fillColor: this.fillColor, strokeWidth: this.strokeWidth, strokeColor: this.strokeColor, offset: this.offset});
        },

        getDescription: function() {
            return {
                symbolName: 'polygon.Simple',
                fillColor: this.fillColor,
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor
            }
        }
    });

    Object.defineProperties(sGis.symbol.polygon.Simple.prototype, {
        type: {
            value: 'polygon'
        },

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        strokeColor: {
            get: function() {
                return this._strokeColor;
            },
            set: function(color) {
                this._strokeColor = color;
            }
        },

        fillColor: {
            get: function() {
                return this._fillColor;
            },
            set: function(color) {
                this._fillColor = color;
            }
        }
    });


    sGis.symbol.polygon.BrushFill.prototype = new sGis.Symbol({
        _strokeWidth: 1,
        _strokeColor: 'black',
        _fillBrush: defaultBrush,
        _fillForeground: 'black',
        _fillBackground: 'transparent',

        renderFunction: function(feature, resolution, crs) {
            if (!this._image) this.fillBrush = this.fillBrush;
            var coordinates = getPolylineRenderedCoordinates(feature, resolution, crs);

            return [new sGis.geom.Polygon(coordinates, {color: this.strokeColor, width: this.strokeWidth, fillStyle: 'image', fillImage: this._image})];
        },

        clone: function() {
            return new sGis.symbol.polygon.BrushFill({fillBrush: this.fillBrush, fillForeground: this.fillForeground, fillBackground: this.fillBackground, strokeWidth: this.strokeWidth, strokeColor: this.strokeColor, offset: this.offset});
        }
    });

    Object.defineProperties(sGis.symbol.polygon.BrushFill.prototype, {
        type: {
            value: 'polygon'
        },

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        strokeColor: {
            get: function() {
                return this._strokeColor;
            },
            set: function(color) {
                this._strokeColor = color;
            }
        },

        fillBrush: {
            get: function() {
                return this._fillBrush;
            },
            set: function(brush) {
                this._fillBrush = utils.copyArray(brush);
                this._imageSrc = getBrushImage(this);
                if (!this._image) this._image = new Image();
                this._image.src = this._imageSrc;
            }
        },

        fillForeground: {
            get: function() {
                return this._fillForeground;
            },
            set: function(color) {
                this._fillForeground = color;
                this._imageSrc = getBrushImage(this);
                if (!this._image) this._image = new Image();
                this._image.src = this._imageSrc;
            }
        },

        fillBackground: {
            get: function() {
                return this._fillBackground;
            },
            set: function(color) {
                this._fillBackground = color;
                this._imageSrc = getBrushImage(this);
                if (!this._image) this._image = new Image();
                this._image.src = this._imageSrc;
            }
        }
    });

    sGis.symbol.polygon.ImageFill.prototype = new sGis.Symbol({
        _strokeWidth: 1,
        _strokeColor: 'black',
        _src: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',

        renderFunction: function(feature, resolution, crs) {
            if (!this._image) this.fillImage = this.fillImage;
            var coordinates = getPolylineRenderedCoordinates(feature, resolution, crs);

            return [new sGis.geom.Polygon(coordinates, {color: this.strokeColor, width: this.strokeWidth, fillStyle: 'image', fillImage: this._image})];
        },

        clone: function() {
            return new sGis.symbol.polygon.BrushFill({fillImage: this.fillImage, strokeWidth: this.strokeWidth, strokeColor: this.strokeColor, offset: this.offset});
        }
    });

    Object.defineProperties(sGis.symbol.polygon.ImageFill.prototype, {
        type: {
            value: 'polygon'
        },

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        strokeColor: {
            get: function() {
                return this._strokeColor;
            },
            set: function(color) {
                this._strokeColor = color;
            }
        },

        fillImage: {
            get: function() {
                return this._src;
            },
            set: function(src) {
                this._src = src;
                if (!this._image) this._image = new Image();
                this._image.src = this._src;
            }
        }
    });

    function getPolylineRenderedCoordinates(feature, resolution, crs) {
        if (!feature._cache[resolution]) {
            var projected = feature.projectTo(crs).coordinates;

            for (var ring = 0, l = projected.length; ring < l; ring++) {
                for (var i = 0, m = projected[ring].length; i < m; i++) {
                    projected[ring][i][0] /= resolution;
                    projected[ring][i][1] /= -resolution;
                }
            }

            var simpl = utils.simplify(projected, 0.5);
            feature._cache[resolution] = simpl;
        } else {
            simpl = feature._cache[resolution];
        }
        return simpl;
    }

    function getBrushImage(style) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            brush = style.fillBrush,
            foreground = new sGis.utils.Color(style.fillForeground),
            background = new sGis.utils.Color(style.fillBackground),
            alphaNormalizer = 65025;

        canvas.height = brush.length;
        canvas.width = brush[0].length;

        for (var i = 0, l = brush.length; i < l; i++) {
            for (var j = 0, m = brush[i].length; j < m; j++) {
                var srcA = brush[i][j] * foreground.a / alphaNormalizer,
                    dstA = background.a / 255 * (1 - srcA),
                    a = + Math.min(1, (srcA + dstA)).toFixed(2),
                    r = Math.round(Math.min(255, background.r * dstA + foreground.r * srcA)),
                    g = Math.round(Math.min(255, background.g * dstA + foreground.g * srcA)),
                    b = Math.round(Math.min(255, background.b * dstA + foreground.b * srcA));

                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                ctx.fillRect(j,i,1,1);
            }
        }

        return canvas.toDataURL();
    }

})();