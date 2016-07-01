sGis.module('symbol.image.Image', [
    'Symbol',
    'serializer.symbolSerializer'
], (Symbol, symbolSerializer) => {

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