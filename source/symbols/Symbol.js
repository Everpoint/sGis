(function() {

    sGis.symbol = {};

    sGis.Symbol = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
    };

    sGis.Symbol.fromDescription = function(desc) {
        var classDesc = desc.symbolName.split('.');
        var classLink = sGis.symbol[classDesc[0]];
        for (var i = 1; i < classDesc.length; i++) {
            classLink = classLink[classDesc[i]];
        }

        return new classLink(desc);
    };

    sGis.Symbol.prototype = {
        setDefaults: function(style) {
            this.defaults = {};
            for (var i in this.style) {
                Object.defineProperty(this.defaults, i, {
                    get: this.style[i].get,
                    set: this.style[i].set
                });
                this.defaults[i] = style && style[i] ? style[i] : this.style[i].defaultValue;
            }
        }
    };

    Object.defineProperties(sGis.Symbol.prototype, {

    });


    sGis.symbol.label = {
        Label: function(style) {
            utils.init(this, style, true);
        }
    };

    sGis.symbol.label.Label.prototype = new sGis.Symbol({
        _width: 200,
        _height: 20,
        _offset: {x: -100, y: -10},
        _align: 'center',
        _css: '',

        renderFunction: function(feature, resolution, crs) {
            if (!feature._cache || !utils.softEquals(resolution, feature._cache[0].resolution)) {
                var div = document.createElement('div');
                div.className = this.css;
                div.appendChild(feature.content);
                div.style.position = 'absolute';
                div.style.height = this.height + 'px';
                div.style.width = this.width + 'px';

                var point = feature.point.projectTo(crs);
                div.position = [point.x / resolution + this.offset.x, -point.y / resolution + this.offset.y];
                div.style.pointerEvents = 'none';
                div.style.cursor = 'inherit';
                div.style.textAlign = this.align;

                feature._cache = [{node: div, position: div.position, resolution: resolution, onAfterDisplay: this._getBboxSetter(point, resolution, div, feature)}];
            }

            return feature._cache;
        },

        _getBboxSetter: function(center, resolution, node, feature) {
            return function() {
                var width = node.offsetWidth * resolution / 2;
                var height = node.offsetHeight * resolution / 2;
                var offset = feature.symbol.offset;

                var bbox = new sGis.Bbox([center.x - width + offset.x, center.y - height + offset.y], [center.x + width + offset.x, center.y + height + offset.y], center.crs);
                feature.currentBbox = bbox;
            }
        }
    });

    Object.defineProperties(sGis.symbol.label.Label.prototype, {
        type: {
            value: 'label'
        },

        width: {
            get: function() {
                return this._width;
            },
            set: function(width) {
                this._width = width;
            }
        },

        height: {
            get: function() {
                return this._height;
            },
            set: function(height) {
                this._height = height;
            }
        },

        offset: {
            get: function() {
                return utils.copyObject(this._offset);
            },
            set: function(offset) {
                this._offset = offset;
            }
        },

        align: {
            get: function() {
                return this._align;
            },
            set: function(align) {
                this._align = align;
            }
        },

        css: {
            get: function() {
                return this._css;
            },
            set: function(css) {
                this._css = css;
            }
        }
    });



    sGis.symbol.image = {
        Image: function(style) {
            utils.init(this, style, true);
        }
    };

    sGis.symbol.image.Image.prototype = new sGis.Symbol({
        _transitionTime: 0,

        renderFunction: function(feature, resolution, crs) {
            if (!feature._cache) {
                var image = new Image();
                image.src = feature.src;
                image.width = feature.width;
                image.height = feature.height;

                image.bbox = feature.bbox;
                feature._cache = [{
                    node: image,
                    bbox: feature.bbox,
                    persistent: true
                }];

                if (feature.transitionTime > 0) {
                    image.style.opacity = 0;
                    image.style.transition = 'opacity ' + feature.transitionTime / 1000 + 's linear';

                    this._cache[0].onAfterDisplay = function() {
                        setTimeout(function() { image.style.opacity = feature.opacity; }, 0);
                    }
                } else {
                    image.style.opacity = feature.opacity;
                }
            }
            return feature._cache;
        }
    });

    Object.defineProperties(sGis.symbol.image.Image.prototype, {
        type: {
            value: 'image'
        },

        transitionTime: {
            get: function() {
                return this._transitionTime;
            },
            set: function(time) {
                this._transitionTime = time;
            }
        }
    });


})();