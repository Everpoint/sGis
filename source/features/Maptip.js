sGis.module('feature.Maptip', [
    'Feature',
    'Point',
    'Bbox',
    'symbol.maptip.Simple'
], function(Feature, Point, Bbox, MaptipSymbol) {

    'use strict';

    /**
     * @alias sGis.feature.Maptip
     * @extends sGis.Feature
     * @implements sGis.IPoint
     */
    class Maptip extends Feature {
        constructor(position, properties) {
            super(properties);
            this._position = position;
        }

        get content() { return this._content; }
        set content(content) {
            this._content = content;
            this.redraw();
        }
        
        get position() { return this._position; }
        set position(position) {
            this._position = position;
            this.redraw();
        }

        projectTo(crs) {
            let projected = this.point.projectTo(crs);
            return new Maptip(projected.position, { crs: crs, content: this.content });
        }

        get point() {
            return new Point(this.position, this.crs);
        }

        get x() {
            return this.position[0];
        }

        get y() {
            return this.position[1];
        }

        get bbox() { return new Bbox(this._position, this._position, this.crs); }
    }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @member symbol
     * @memberof sGis.feature.Maptip
     * @type sGis.Symbol
     * @instance
     * @default new sGis.symbol.Maptip()
     */
    Maptip.prototype._symbol = new MaptipSymbol();


    return Maptip;

});
