'use strict';

(function() {

    sGis.decorations.ScaleSlider = function(map, options) {
        this._map = map;
        this._createGrid();
        this._createSlider();

        sGis.utils.init(this, options);
        this.updateDisplay();
        this._setListeners();
    };

    sGis.decorations.ScaleSlider.prototype = {
        _gridCss: 'sGis-decorations-scaleSlider-grid',
        _gridWidth: 8,
        _gridHeight: 120,
        _gridTop: 50,
        _gridLeft: 50,
        _sliderCss: 'sGis-decorations-scaleSlider-slider',
        _sliderWidth: 25,
        _sliderHeight: 10,
        _eventNamespace: '.sGis-decorations-scaleSlider',

        updateDisplay: function() {
            var wrapper = this._map.innerWrapper;
            if (wrapper) {
                wrapper.appendChild(this._grid);
                wrapper.appendChild(this._slider);
            } else if (this._grid.parentNode) {
                this._grid.parentNode.removeChild(this._grid);
                this._slider.parentNode.removeChild(this._grid);
            }
        },

        _setListeners: function() {
            this._map.on('wrapperSet', this.updateDisplay.bind(this));
        },

        _createGrid: function() {
            var grid = document.createElement('div');
            grid.style.position = 'absolute';
            grid.style.width = this._gridWidth + 'px';
            grid.style.height = this._gridHeight + 'px';
            grid.style.top = this._gridTop + 'px';
            grid.style.left = this._gridLeft + 'px';
            grid.className = this._gridCss;

            this._grid = grid;
        },

        _createSlider: function() {
            var slider = document.createElement('div');

            slider.style.position = 'absolute';
            slider.style.width = this._sliderWidth + 'px';
            slider.style.height = this._sliderHeight + 'px';
            slider.style.top = this._getSliderPosition() +  'px';
            slider.style.left = this._getSliderLeft() + 'px';
            slider.className = this._sliderCss;

            this._slider = slider;
            this._setSliderEvents();
        },

        _getSliderLeft: function() {
            return this._gridLeft + (this._gridWidth - this._sliderWidth) / 2;
        },

        _getSliderPosition: function() {
            var height = this._gridHeight - this._sliderHeight;
            var maxResolution = this._map.maxResolution;
            var minResolution = this._map.minResolution;
            var curResolution = this._map.resolution;

            var offset = height * Math.log2(curResolution / minResolution) / Math.log2(maxResolution / minResolution) ;
            if (sGis.utils.is.number(offset)) {
                return offset + this._gridTop;
            } else {
                return this._gridTop;
            }
        },

        _setSliderEvents: function() {
            var self = this;
            this._map.addListener('dragStart' + this._eventNamespace, function(sGisEvent) {
                if (sGisEvent.browserEvent.target === self._slider) {
                    sGisEvent.draggingObject = self;
                    self._map.painter.prohibitUpdate();
                    sGisEvent.stopPropagation();
                }
            });

            this._map.addListener('layerAdd layerRemove bboxChangeEnd', this._updateSliderPosition.bind(this));
        },

        _updateSliderPosition: function() {
            this._slider.style.top = this._getSliderPosition() + 'px';
        },

        _moveSlider: function(delta) {
            var offset = parseInt(this._slider.style.top) - this._gridTop;
            offset -= delta;
            if (offset < 0) {
                offset = 0;
            } else if (offset > this._gridHeight - this._sliderHeight) {
                offset = this._gridHeight - this._sliderHeight;
            }

            this._slider.style.top = this._gridTop + offset + 'px';

            var height = this._gridHeight - this._sliderHeight;
            var maxResolution = this._map.maxResolution;
            var minResolution = this._map.minResolution;

            var resolution = minResolution * Math.pow(2, offset * Math.log2(maxResolution / minResolution) / height);
            this._map.resolution = resolution;
        },

        _defaultHandlers: {
            drag: function(sGisEvent) {
                this._moveSlider(sGisEvent.offset.yPx);
            },

            dragEnd: function() {
                this._map.painter.allowUpdate();
                this._map.adjustResolution();
            }
        }
    };

    Object.defineProperties(sGis.decorations.ScaleSlider.prototype, {
        map: {
            get: function() {
                return this._map;
            }
        },

        gridCss: {
            get: function() {
                return this._gridCss;
            },
            set: function(css) {
                sGis.utils.validate(css, 'string');
                this._gridCss = css;
                this._grid.className = css;
            }
        },

        gridWidth: {
            get: function() {
                return this._gridWidth;
            },
            set: function(w) {
                sGis.utils.validate(w, 'number');
                this._gridWidth = w;

                this._grid.style.width = w + 'px';
            }
        },

        gridHeight: {
            get: function() {
                return this._gridHeight;
            },
            set: function(h) {
                sGis.utils.validate(h, 'number');
                this._gridHeight = h;

                this._grid.style.height = h + 'px';
            }
        },

        gridTop: {
            get: function() {
                return this._gridTop;
            },
            set: function(n) {
                sGis.utils.validate(n, 'number');
                this._gridTop = n;
                this._grid.style.top = n + 'px';
            }
        },

        gridLeft: {
            get: function() {
                return this._gridLeft;
            },
            set: function(n) {
                sGis.utils.validate(n, 'number');
                this._gridLeft = n;
                this._grid.style.left = n + 'px';
            }
        },

        sliderCss: {
            get: function() {
                return this._sliderCss;
            },
            set: function(css) {
                sGis.utils.validate(css, 'string');
                this._sliderCss = css;
                this._slider.className = css;
            }
        },

        sliderWidth: {
            get: function() {
                return this._sliderWidth;
            },
            set: function(w) {
                sGis.utils.validate(w, 'number');
                this._sliderWidth = w;

                this._slider.style.width = w + 'px';
                this._slider.style.left = this._getSliderLeft() + 'px';
            }
        },

        sliderHeight: {
            get: function() {
                return this._sliderHeight;
            },
            set: function(h) {
                sGis.utils.validate(h, 'number');
                this._sliderHeight = h;

                this._slider.style.height = h + 'px';
            }
        }
    });

    sGis.utils.proto.setMethods(sGis.decorations.ScaleSlider.prototype, sGis.IEventHandler);

    var defaultCss = '.sGis-decorations-scaleSlider-grid {' +
            'border: 1px solid gray; ' +
            'background-color: #CCCCCC; ' +
            'border-radius: 5px;} ' +
            '.sGis-decorations-scaleSlider-slider {' +
            'border: 1px solid gray;' +
            'background-color: white;' +
            'border-radius: 5px;' +
            'cursor: pointer;}',
        styles = document.createElement('style');
    styles.type = 'text/css';
    if (styles.styleSheet) {
        styles.styleSheet.cssText = defaultCss;
    } else {
        styles.appendChild(document.createTextNode(defaultCss));
    }

    document.head.appendChild(styles);

})();