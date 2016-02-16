(function() {

    sGis.geom.Arc = function(center, options) {
        utils.init(this, options);

        this.center = center;
    };

    sGis.geom.Arc.prototype = {
        _radius: 5,
        _strokeColor: 'black',
        _strokeWidth: 1,
        _fillColor: 'transparent',
        ignoreEvents: false,

        contains: function(position) {
            var dx = position.x - this._center[0],
                dy = position.y - this._center[1],
                distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < this._radius + 2;
        },

        _resetCache: function() {
            this._cachedSvg = null;
        }
    };

    Object.defineProperties(sGis.geom.Arc.prototype, {
        center: {
            get: function() {
                return this._center;
            },
            set: function(coordinates) {
                this._center = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];

                if (this._cachedSvg) {
                    var r2 = this._radius * 2 + this._strokeWidth;

                    this._cachedSvg.childNodes[0].setAttribute('cx', coordinates[0]);
                    this._cachedSvg.childNodes[0].setAttribute('cy', coordinates[1]);
                    this._cachedSvg.position = coordinates;

                    this._cachedSvg.setAttribute('viewBox', [
                        this._center[0] - this._radius - this._strokeWidth / 2,
                        this._center[1] - this._radius - this._strokeWidth / 2,
                        r2 + this._strokeWidth,
                        r2 + this._strokeWidth
                    ].join(' '));
                }
            }
        },

        radius: {
            get: function() {
                return this._radius;
            },
            set: function(r) {
                this._radius = parseFloat(r);
                this._resetCache();
            }
        },

        strokeColor: {
            get: function() {
                return this._strokeColor;
            },
            set: function(color) {
                this._strokeColor = color;
                this._resetCache();
            }
        },

        strokeWidth: {
            get: function() {
                return this._strokeWidth;
            },
            set: function(w) {
                this._strokeWidth = parseFloat(w);
                this._resetCache();
            }
        },

        fillColor: {
            get: function() {
                return this._fillColor;
            },
            set: function(color) {
                this._fillColor = color;
                this._resetCache();
            }
        },
        svg: {
            get: function() {
                var r2 = this._radius * 2 + this._strokeWidth;
                if (!this._cachedSvg) {
                    this._cachedSvg = sGis.utils.svg.circle({
                        r: this._radius,
                        cx: this.center[0],
                        cy: this.center[1],
                        stroke: this._strokeColor,
                        'stroke-width': this._strokeWidth,
                        fill: this._fillColor,

                        width: r2,
                        height: r2,
                        viewBox: [
                            this._center[0] - this._radius - this._strokeWidth / 2,
                            this._center[1] - this._radius - this._strokeWidth / 2,
                            r2,
                            r2
                        ].join(' ')
                    });
                }

                return this._cachedSvg;
            }
        },

        node: {
            get: function() {
                var svg = this.svg;
                var x = this._center[0] - this._radius - this._strokeWidth / 2;
                var y = this._center[1] - this._radius - this._strokeWidth / 2;

                svg.position = [x, y];
                return svg;
            }
        }
    });

})();