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
