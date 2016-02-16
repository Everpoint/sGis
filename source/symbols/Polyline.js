(function() {

    sGis.symbol.polyline = {
        Simple: function(style) {
            utils.init(this, style, true);
        }
    };

    sGis.symbol.polyline.Simple.prototype = new sGis.Symbol({
        _strokeWidth: 1,
        _strokeColor: 'black',

        renderFunction: function(feature, resolution, crs) {
            var coordinates = getPolylineRenderedCoordinates(feature, resolution, crs);

            return [new sGis.geom.Polyline(coordinates, {color: this.strokeColor, width: this.strokeWidth})];
        },

        clone: function() {
            return new sGis.symbol.polyline.Simple({strokeWidth: this.strokeWidth, strokeColor: this.strokeColor});
        },

        getDescription: function() {
            return {
                symbolName: 'polyline.Simple',
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor,
            }
        }
    });

    Object.defineProperties(sGis.symbol.polyline.Simple.prototype, {
        type: {
            value: 'polyline'
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

})();