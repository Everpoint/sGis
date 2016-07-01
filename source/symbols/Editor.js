sGis.module('symbol.Editor', [
    'Symbol',
    'symbol.point.Point',
    'symbol.point.Image',
    'render.Point',
    'render.Polyline',
    'render.Polygon',
    'render.Arc'
], function(Symbol, PointSymbol, PointImageSymbol, PointRender, PolylineRender, PolygonRender, ArcRender) {
    
    'use strict';

    /**
     * Symbol of a highlighted feature for editor.
     * @alias sGis.symbol.Editor
     * @extends sGis.Symbol
     */
    class EditorSymbol extends Symbol {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(feature, resolution, crs) {
            var baseRender = this.baseSymbol.renderFunction(feature, resolution, crs);
            var halo;
            for (var i = 0; i < baseRender.length; i++) {
                if (baseRender[i] instanceof ArcRender) {
                    halo = new ArcRender(baseRender[i].center, {
                        fillColor: this.color,
                        radius: parseFloat(baseRender[i].radius) + this.haloSize,
                        strokeColor: 'transparent'
                    });
                    break;
                } else if (baseRender[i] instanceof PolygonRender) {
                    halo = new PolygonRender(baseRender[i].coordinates, {
                        strokeColor: this.color,
                        fillColor: this.color,
                        strokeWidth: parseFloat(baseRender[i].width) + 2 * this.haloSize
                    });
                    break;
                } else if (baseRender[i] instanceof PolylineRender) {
                    halo = new PolylineRender(baseRender[i].coordinates, {
                        strokeColor: this.color,
                        strokeWidth: parseFloat(baseRender[i].width) + 2 * this.haloSize
                    });
                    break;
                } else if (this.baseSymbol instanceof PointImageSymbol) {
                    halo = new sGis.render.Arc([baseRender[i].position[0] + baseRender[i].node.width / 2, baseRender[i].position[1] + baseRender[i].node.height / 2], {
                        fillColor: this.color,
                        radius: this.baseSymbol.size / 2 + this.haloSize,
                        strokeColor: 'transparent'
                    });
                    break;
                }
            }

            if (halo) baseRender.unshift(halo);
            return baseRender;
        }
    }

    /**
     * Base symbol of the feature. Used to render original feature with the highlight.
     * @member {sGis.Symbol} baseSymbol
     * @memberof sGis.symbol.Editor
     * @instance
     * @default new sGis.symbol.point.Point()
     */
    EditorSymbol.prototype.baseSymbol = new PointSymbol();

    /**
     * Color of the halo (highlight). Can be any valid css color string.
     * @member {String} color
     * @memberof sGis.symbol.Editor
     * @instance
     * @default "rgba(97,239,255,0.5)"
     */
    EditorSymbol.prototype.color = 'rgba(97,239,255,0.5)';

    /**
     * Size of the halo around the feature.
     * @member {Number} haloSize
     * @memberof sGis.symbol.Editor
     * @instance
     * @default
     */
    EditorSymbol.prototype.haloSize = 5;
    
    return EditorSymbol;
    
});
