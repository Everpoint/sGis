sGis.module('Symbol', [
    'render.HtmlElement'
], function(HtmlElement) {
    'use strict';

    var Symbol = function(options) {
        for (var i in options) {
            this[i] = options[i];
        }
    };

    Symbol.fromDescription = function(desc) {
        var classDesc = desc.symbolName.split('.');
        var classLink = sGis.symbol[classDesc[0]];
        for (var i = 1; i < classDesc.length; i++) {
            classLink = classLink[classDesc[i]];
        }

        return new classLink(desc);
    };

    Symbol.prototype = {
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
    
    return Symbol;
    
});

sGis.module('symbol.image', [
    'utils',
    'Symbol'
], function(utils, Symbol) {
    'use strict';

    var imageSymbols = {
        Image: function(style) {
            sGis.utils.init(this, style, true);
        }
    };

    imageSymbols.Image.prototype = new sGis.Symbol({
        _transitionTime: 0,

        renderFunction: function(feature, resolution, crs) {
            if (!feature._cache) {
                var render = new sGis.render.Image(feature.src, feature.bbox, feature.width, feature.height);
                if (feature.transitionTime > 0) {
                    render.opacity = 0;
                    render.onAfterDisplayed = function(node) {
                        setTimeout(function() {
                            node.style.transition = 'opacity ' + feature.transitionTime / 1000 + 's linear';
                            node.style.opacity = feature.opacity; 
                        }, 0);
                    }
                } else {
                    render.opacity = feature.opacity;
                }
                
                feature._cache = [render];
            }
            return feature._cache;
        }
    });

    Object.defineProperties(imageSymbols.Image.prototype, {
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

    return imageSymbols;
    
});
