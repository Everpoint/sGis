'use strict';

(function() {
    
sGis.decorations = {};
    
sGis.decorations.Scale = function(map, options) {
    utils.init(this, options);
    this._map  = map;
    this.updateDisplay();
};

sGis.decorations.Scale.prototype = {
    _plusImageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAk0lEQVR4nO2XsQ2EMAxFHycKJrkSxvAETMkEGeMob5KUVFBQGCdCcvN/G8d6kuWnBJIztF4opXyBzSlZzewf7Te2AgATMD+ch/PpAHg1AhCAAAQwwKXXqMEeVQxEVVxPFW/4em2JB3fPnj4CAQggHeBcw5UkD/S8CWfg55QsZrZH+6WPQAACEIAAej6nFfBMV1uaHQE1GEAKbB76AAAAAElFTkSuQmCC',
    _minusImageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFpJREFUeNrs2LENwDAIAEETZTaGZjmsrODGQrkv6E+igejuNblnDQ8AAAAAAAAAAAAA4L+A9xtVNe4sy8ywQgAAAAAAALcLz10AAAAAAAAAAAAAAACAs7YAAwDJuQpbR1QAogAAAABJRU5ErkJggg==',
    _xAlign: 'left',
    _yAlign: 'top',
    _xOffset: 32,
    _yOffset: 32,
    _width: 32,
    _height: 32,
    _horizontal: false,
    _css: 'sGis-decorations-button',
    _plusCss: '',
    _minusCss: '',
    
    updateDisplay: function() {
        if (this._buttons) {
            this._map.innerWrapper.removeChild(this._buttons.plus);
            this._map.innerWrapper.removeChild(this._buttons.minus);
        }
        
        var buttons = {
            plus: getButton(this._plusImageSrc, this, this._plusCss),
            minus: getButton(this._minusImageSrc, this, this._minusCss)
        };
        
        if (this._horizontal) {
            var but = this._xAlign === 'right' ? 'plus' : 'minus';
            buttons[but].style[this._xAlign] = this._xOffset + this._width + 4 + 'px';
        } else {
            var but = this._yAlign === 'bottom' ? 'plus' : 'minus';
            buttons[but].style[this._yAlign] = this._yOffset + this._height + 4 + 'px';
        }
        
        var map = this._map;
        buttons.plus.onclick = function(e) {
            map.animateChangeScale(0.5);
            e.stopPropagation();
        };
        buttons.minus.onclick = function(e) {
            map.animateChangeScale(2);
            e.stopPropagation();
        };

        buttons.plus.ondblclick = function(e) {
            e.stopPropagation();
        };
        buttons.minus.ondblclick = function(e) {
            e.stopPropagation();
        };
        
        if (map.innerWrapper) {
            map.innerWrapper.appendChild(buttons.plus);
            map.innerWrapper.appendChild(buttons.minus);
        } else {
            map.addListener('wrapperSet', function() {
                map.innerWrapper.appendChild(buttons.plus);
                map.innerWrapper.appendChild(buttons.minus);
            });
        }
    }
};

Object.defineProperties(sGis.decorations.Scale.prototype, {
    map: {
        get: function() {
            return this._map;
        }
    },
    
    plusImageSrc: {
        get: function() {
            return this._plusImageSrc;
        },
        set: function(src) {
            utils.validateString(src);
            this._plusImageSrc = src;
        }
    },
    
    minusImageSrc: {
        get: function() {
            return this._minusImageSrc;
        },
        set: function(src) {
            utils.validateString(src);
            this._minusImageSrc = src;
        }
    },
    
    xAlign: {
        get: function() {
            return this._xAlign;
        },
        set: function(align) {
            utils.validateValue(align, ['left', 'right']);
            this._xAlign = align;
        }
    },
    
    yAlign: {
        get: function() {
            return this._yAlign;
        },
        set: function(align) {
            utils.validateValue(align, ['top', 'bottom']);
            this._yAlign = align;
        }
    },
    
    xOffset: {
        get: function() {
            return this._xOffset;
        },
        set: function(offset) {
            utils.validateNumber(offset);
            this._xOffset = offset;
        }
    },
    
    yOffset: {
        get: function() {
            return this._yOffset;
        },
        set: function(offset) {
            utils.validateNumber(offset);
            this._yOffset = offset;
        }
    },
    
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            utils.validatePositiveNumber(width);
            this._width = width;
        }
    },
    
    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            utils.validatePositiveNumber(height);
            this._height = height;
        }
    },
    
    horizontal: {
        get: function() {
            return this._horizontal;
        },
        set: function(bool) {
            utils.validateBool(bool);
            this._horizontal = bool;
        }
    },
    
    css: {
        get: function() {
            return this._css;
        },
        set: function(css) {
            utils.validateString(css);
            this._css = css;
        }
    },

    plusCss: {
        get: function() {
            return this._plusCss;
        },
        set: function(css) {
            utils.validateString(css);
            this._plusCss = css;
        }
    },

    minusCss: {
        get: function() {
            return this._minusCss;
        },
        set: function(css) {
            utils.validateString(css);
            this._minusCss = css;
        }
    }
});

function getButton(src, control, css) {
    var button = document.createElement('div');
    button.className = control.css + ' ' + css;
    button.style[control.xAlign] = control.xOffset + 'px';
    button.style[control.yAlign] = control.yOffset + 'px';
    button.style.width = control.width + 'px';
    button.style.height = control.height + 'px';
    button.style.position = 'absolute';
    button.style.backgroundSize = '100%';
    if (src) {
        button.style.backgroundImage = 'url(' + src + ')';
    }
    
    return button;
}
    
var defaultCss = '.sGis-decorations-button {border: 1px solid gray; background-color: #F0F0F0; border-radius: 5px; font-size: 32px; text-align: center;cursor: pointer;} .sGis-decorations-button:hover {background-color: #E0E0E0;}',
    buttonStyle = document.createElement('style');
buttonStyle.type = 'text/css';
if (buttonStyle.styleSheet) {
    buttonStyle.styleSheet.cssText = defaultCss;
} else {
    buttonStyle.appendChild(document.createTextNode(defaultCss));
}

document.head.appendChild(buttonStyle);

})();