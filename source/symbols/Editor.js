sGis.module('symbol.editor', [
    'utils',
    'Symbol',
    'symbol.point',
    'geom.Point',
    'geom.Polyline',
    'geom.Polygon',
    'geom.Arc'
], function(Symbol, pointSymbols, Point, Polyline, Polygon) {
    'use strict';

    var editorSymbols = {
        Point: function(properties) {
            sGis.utils.init(this, properties);
        },
        Polyline: function(properties) {
            sGis.utils.init(this, properties);
        },
        Polygon: function(properties) {
            sGis.utils.init(this, properties);
        }
    };

    editorSymbols.Point.prototype = new sGis.Symbol({
        _baseSymbol: new sGis.symbol.point.Point(),
        _color: 'rgba(97,239,255,0.5)',
        _haloSize: 5,

        renderFunction: function(feature, resolution, crs) {
            var baseRender = this.baseSymbol.renderFunction(feature, resolution, crs);
            var halo;
            for (var i = 0; i < baseRender.length; i++) {
                if (baseRender[i] instanceof sGis.geom.Arc) {
                    halo = new sGis.geom.Arc(baseRender[i].center, {fillColor: this.color, radius: parseFloat(baseRender[i].radius) + this.haloSize, strokeColor: 'transparent'});
                    break;
                } else if (baseRender[i] instanceof sGis.geom.Polygon) {
                    halo = new sGis.geom.Polygon(baseRender[i].coordinates, {color: this.color, fillColor: this.color, width: parseFloat(baseRender[i].width) + 2 * this.haloSize});
                    break;
                } else if (baseRender[i] instanceof sGis.geom.Polyline) {
                    halo = new sGis.geom.Polyline(baseRender[i].coordinates, {color: this.color, width: parseFloat(baseRender[i].width) + 2 * this.haloSize});
                    break;
                } else if (this.baseSymbol instanceof sGis.symbol.point.Image) {
                    halo = new sGis.geom.Arc([baseRender[i].position[0] + baseRender[i].node.width / 2, baseRender[i].position[1] + baseRender[i].node.height / 2], {fillColor: this.color, radius: this.baseSymbol.size / 2 + this.haloSize, strokeColor: 'transparent'});
                    break;
                }
            }

            if (halo) baseRender.unshift(halo);
            return baseRender;
        }
    });

    Object.defineProperties(editorSymbols.Point.prototype, {
        type: {
            value: 'point'
        },

        baseSymbol: {
            get: function() {
                return this._baseSymbol;
            },
            set: function(baseSymbol) {
                this._baseSymbol = baseSymbol;
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

        haloSize: {
            get: function() {
                return this._haloSize;
            },
            set: function(size) {
                this._haloSize = size;
            }
        }
    });

    return editorSymbols;
    
});
