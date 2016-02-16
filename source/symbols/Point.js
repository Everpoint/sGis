(function() {

    sGis.symbol.point = {
        Point: function(style) {
            sGis.utils.init(this, style, true);
        },

        Image: function(style) {
            sGis.utils.init(this, style, true);
        },

        Square: function(style) {
            sGis.utils.init(this, style, true);
        },

        MaskedImage: function(style) {
            sGis.utils.init(this, style, true);
            this._updateMasked();
        }
    };

    sGis.symbol.point.Point.prototype = new sGis.Symbol({
        _fillColor: 'black',
        _strokeColor: 'transparent',
        _strokeWidth: 1,
        _offset: {x: 0, y: 0},

        renderFunction: function(feature, resolution, crs) {
            var f = feature.projectTo(crs),
                pxPosition = [f._point[0] / resolution + this.offset.x, - f._point[1] / resolution + this.offset.y];

            var point = new sGis.geom.Arc(pxPosition, {fillColor: this.fillColor, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth, radius: this.size / 2});
            return [point];
        },

        clone: function() {
            return new sGis.symbol.point.Point({size: this.size, fillColor: this.fillColor, strokeWidth: this.strokeWidth, strokeColor: this.strokeColor, offset: this.offset});
        },

        getDescription: function() {
            return {
                symbolName: 'point.Point',
                size: this.size,
                fillColor: this.fillColor,
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor,
                offset: this.offset
            }
        }
    });

    sGis.utils.proto.setProperties(sGis.symbol.point.Point.prototype, {
        type: {default: 'point', set: null},
        size: 10
    });

    Object.defineProperties(sGis.symbol.point.Point.prototype, {
        fillColor: {
            get: function() {
                return this._fillColor;
            },
            set: function(color) {
                this._fillColor = color;
            }
        },

        /**
         * @deprecated
         */
        color: {
            get: function() {
                return this.fillColor;
            },
            set: function(color) {
                this.fillColor = color;
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

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        offset: {
            get: function() {
                return utils.copyObject(this._offset);
            },
            set: function(offset) {
                this._offset = offset;
            }
        }
    });


    sGis.symbol.point.Image.prototype = new sGis.Symbol({
        _source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAN5QTFRFAAAAAAAAAAAAAAAAji4jiCwhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKg4KJgwJxEAw20o040Up41hE5EYq5Ugs5kov50wx6E406GNR6GNS6GZV6GpY6G1c6G9f6HBg6HNj6HZm6Hlq6VA26X1t6YBx6Yd56lI56oN16ot96o6A6pGE61Q765WI65mN7J2R7KCV7VY+7aWa7lhA7qme7q2j71pC77Ko8FxF8Lat8Lqx8V5H8mBK8r+38sS982JM9GRO9WZR9mhT+GtW+W1Y+m9b+3Fd/HNf/XVi+RwEUgAAABF0Uk5TAAYHERYXHB0eIiM3OD1JSlRYXujgAAABPUlEQVQ4y2WS2ULCMBBFE0qxlWIdwI19EZBFFhFEUHBX/v+HTJtOmAnnqTn3hodwhYiQAFIwuJGw2/EGNxK2hcKW36AmDZuCYkNvUOPC+iJmjQ3JjITVZcJKNyzjwPIKWeobVDjCycLiGlmAlOyYdYTM5GB+g8yBHXKZ6CdVY3aL5PPmc6Zz3ZjeHTHFXDcm9xaTQ64b4wfGmOa6MXokjHiuG8Mnw9DOVcOHwbNhAL6Vq/frvRB6x/vovzL69j66bxZd2khD5/2IzqHhQvsDKRbNZxsbLrQ+kRawQ7Ko5hfShPMzdoz30fhG6hCe+jmoG9GIF1X7SahB6KWiNyUmXlT1N6Ya5frVjUkWVflTVHQuqDGLKu/3ZcyJIYsqlQ55ZMLIsEXRXBkvVIYuKhvQXIiUFwQndFGOY/+9aP4B2y1gaNteoqgAAAAASUVORK5CYII=',
        _size: 32,
        _color: 'black',
        _anchorPoint: {x: 16, y: 16},
        _renderToCanvas: true,

        renderFunction: function(feature, resolution, crs) {
            if (!this._image) this.source = this.source; //creates the image and saves to cache

            var f = feature.projectTo(crs);
            var pxPosition = [f._point[0] / resolution, - f._point[1] / resolution];
            var imageCache = this._image;

            //if (imageCache.complete) {
            var image = new Image();
            image.src = this.source;

            var k = this.size / image.width;
            image.width = this.size;

            if (imageCache.width) {
                image.height = this.size / imageCache.width * imageCache.height;
            } else {
                var self = this;
                imageCache.onload = function() {
                    image.height = self.size / imageCache.width * imageCache.height;
                }
            }


            image.position = [pxPosition[0] - this.anchorPoint.x * k, pxPosition[1] - this.anchorPoint.y * k];

            var render = {
                node: image,
                position: image.position,
                persistent: true,
                renderToCanvas: this.renderToCanvas
            };
            return [render];
        },

        clone: function() {
            return new sGis.symbol.point.Image({size: this.size, color: this.color, source: this.source, anchorPoint: this.anchorPoint, renderToCanvas: this.renderToCanvas});
        },

        getDescriptions: function() {
            return {
                symbolName: 'point.Image',
                size: this.size,
                source: this.source,
                anchorPoint: this.anchorPoint,
                renderToCanvas: this.renderToCanvas
            }
        }
    });

    Object.defineProperties(sGis.symbol.point.Image.prototype, {
        type: {
            value: 'point'
        },

        source: {
            get: function() {
                return this._source;
            },
            set: function(source) {
                this._image = new Image();
                this._image.src = source;
                this._source = source;
            }
        },

        size: {
            get: function() {
                return this._size;
            },
            set: function(size) {
                this._size = size;
            }
        },

        color: {
            get: function() {
                return this._color;
            },
            set: function(color) {
                this._color = color;
            }
        },

        anchorPoint: {
            get: function() {
                return utils.copyObject(this._anchorPoint);
            },
            set: function(point) {
                this._anchorPoint = point;
            }
        },

        renderToCanvas: {
            get: function() {
                return this._renderToCanvas;
            },
            set: function(bool) {
                this._renderToCanvas = bool;
            }
        }
    });


    sGis.symbol.point.Square.prototype = new sGis.Symbol({
        _size: 10,
        _strokeWidth: 2,
        _strokeColor: 'black',
        _fillColor: 'transparent',
        _offset: {x: 0, y: 0},

        renderFunction: function(feature, resolution, crs) {
            var f = feature.projectTo(crs),
                pxPosition = [f._point[0] / resolution, - f._point[1] / resolution],
                halfSize = this.size / 2,
                offset = this.offset,
                coordinates = [
                    [pxPosition[0] - halfSize + offset.x, pxPosition[1] - halfSize + offset.y],
                    [pxPosition[0] - halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                    [pxPosition[0] + halfSize + offset.x, pxPosition[1] + halfSize + offset.y],
                    [pxPosition[0] + halfSize + offset.x, pxPosition[1] - halfSize + offset.y]
                ];

            return [new sGis.geom.Polygon(coordinates, {fillColor: this.fillColor, color: this.strokeColor, width: this.strokeWidth})];
        },

        clone: function() {
            return new sGis.symbol.point.Square({size: this.size, fillColor: this.fillColor, strokeWidth: this.strokeWidth, strokeColor: this.strokeColor, offset: this.offset});
        },

        getDescription: function() {
            return {
                symbolName: 'point.Square',
                size: this.size,
                fillColor: this.fillColor,
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor,
                offset: this.offset
            }
        }
    });

    Object.defineProperties(sGis.symbol.point.Square.prototype, {
        type: {
            value: 'point'
        },

        size: {
            get: function() {
                return this._size;
            },
            set: function(size) {
                this._size = size;
            }
        },

        fillColor: {
            get: function() {
                return this._fillColor;
            },
            set: function(color) {
                this._fillColor = color;
            }
        },

        /**
         * @deprecated
         */
        color: {
            get: function() {
                return this.fillColor;
            },
            set: function(color) {
                this.fillColor = color;
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

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(width) {
                this._strokeWidth = width;
            }
        },

        offset: {
            get: function() {
                return utils.copyObject(this._offset);
            },
            set: function(offset) {
                this._offset = offset;
            }
        }
    });


    sGis.symbol.point.MaskedImage.prototype = new sGis.Symbol({
        _size: 34,
        _anchorPoint: {x: 17, y: 34},
        _imageSource: 'data:image/png;base64,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',
        _maskSource: 'data:image/png;base64,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',
        _backgroundColor: 'rgba(155, 219, 0, 0)',
        _maskColor: '#9bdb00',

        _clearCache: function() {
            this._masked = null;
        },

        _updateMasked: function() {
            if (this._image && this._image.complete && this._mask && this._mask.complete) {
                var canvas = document.createElement('canvas');
                canvas.width = this._mask.width;
                canvas.height = this._mask.height;

                var ctx = canvas.getContext('2d');
                ctx.drawImage(this._mask, 0, 0);

                var maskColor = new sGis.utils.Color(this._maskColor);
                var alphaNormalizer = 65025;

                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var d = imageData.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var a = d[i+3];
                    var srcA = a * maskColor.a / alphaNormalizer;
                    d[i+3] = + Math.round(Math.min(1, srcA) * 255);
                    d[i] = maskColor.r * r / 255;
                    d[i+1] = maskColor.g * r / 255;
                    d[i+2] = maskColor.b * r / 255;
                }

                canvas.width = this._image.width;
                ctx.putImageData(imageData, 0, 0);

                var maskImage = new Image();
                maskImage.src = canvas.toDataURL();

                canvas.width = this._image.width;
                ctx.drawImage(this._image, 0, 0);
                ctx.drawImage(maskImage, 0, 0);

                var dataUrl = canvas.toDataURL();

                this._masked = new Image();
                this._masked.src = dataUrl;
            } else {
                this._masked = null;
                this.imageSource = this._imageSource;
                this.maskSource = this._maskSource;
            }
        },


        renderFunction: function(feature, resolution, crs) {
            if (this._masked) {
                var image = new Image();
                image.src = this._masked.src;
                image.width = this.size;
                var k = this._masked.width / this.size;
                image.height = this._masked.height / k;

                var f = feature.projectTo(crs);
                var pxPosition = [f._point[0] / resolution, -f._point[1] / resolution];

                image.position = [pxPosition[0] - this.anchorPoint.x, pxPosition[1] - this.anchorPoint.y];

                var render = {
                    node: image,
                    position: image.position,
                    persistent: true,
                    renderToCanvas: this.renderToCanvas
                };

                return [render];
            }
        },

        clone: function() {
            return new sGis.symbol.point.MaskedImage({size: this.size, anchorPoint: this.anchorPoint, renderToCanvas: this.renderToCanvas, imageSource: this.imageSource, maskSource: this.maskSource, maskColor: this.maskColor});
        },

        getDescription: function() {
            return {
                symbolName: 'point.MaskedImage',
                size: this.size,
                anchorPoint: this.anchorPoint,
                renderToCanvas: this.renderToCanvas,
                imageSource: this.imageSource,
                maskSource: this.maskSource,
                maskColor: this.maskColor,
                imageWidth: this.imageWidth,
                imageHeight: this.imageHeight
            }
        }
    });

    Object.defineProperties(sGis.symbol.point.MaskedImage.prototype, {
        type: {
            value: 'point'
        },

        size: {
            get: function() {
                return this._size;
            },
            set: function(size) {
                this._size = size;
                this._updateMasked();
            }
        },

        anchorPoint: {
            get: function() {
                return this._anchorPoint;
            },
            set: function(point) {
                this._anchorPoint = point;
            }
        },

        imageSource: {
            get: function() {
                return this._imageSource;
            },
            set: function(url) {
                this._clearCache();
                this._image = new Image();
                this._image.onload = this._updateMasked.bind(this);
                this._image.src = url;
                this._imageSource = url;
            }
        },

        maskSource: {
            get: function() {
                return this._maskSource;
            },
            set: function(url) {
                this._clearCache();
                this._mask = new Image();
                this._mask.onload = this._updateMasked.bind(this);
                this._mask.src = url;
                this._maskSource = url;
            }
        },

        maskColor: {
            get: function() {
                return this._maskColor;
            },
            set: function(color) {
                this._maskColor = color;
                this._updateMasked();
            }
        },

        imageWidth: {
            get: function() {
                return this._size;
            }
        },

        imageHeight: {
            get: function() {
                return this._masked ? this._masked.height * this._size / this._masked.width : this._size;
            }
        }
    });

    })();