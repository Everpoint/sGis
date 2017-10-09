import {Crs, geo} from "../Crs";
import {EventHandler} from "../EventHandler";
import {Symbol} from "../symbols/Symbol";
import {IRender} from "../interfaces/IRender";
import {Bbox} from "../Bbox";

export type RenderCache = {
    resolution: number,
    crs: Crs,
    renders: IRender[]
};

export interface IFeatureConstructorArgs {
    crs?: Crs,
    symbol?: Symbol
}

/**
 * Abstract feature object without any geometry. All other features inherit from this class. It can be used to store attributes in the way compatible with other features.
 * @alias sGis.Feature
 * @extends sGis.EventHandler
 */
export abstract class Feature extends EventHandler {
    private _crs: Crs;
    private _hidden: boolean = false;
    private _tempSymbol: Symbol;

    protected _symbol: Symbol;
    protected _rendered: RenderCache;

    /**
     * Sets default coordinate system for all features.<br><br>
     *     <strong>
     *     NOTE: This method affects all already created features that do not have explicitly specified crs.
     *     You should use this function only when initializing library.
     *     </strong>
     * @param {sGis.Crs} crs
     * @static
     */
    static setDefaultCrs(crs: Crs): void {
        Feature.prototype._crs = crs;
    }

    constructor({ crs = geo, symbol }: IFeatureConstructorArgs = {}) {
        super();

        this._symbol = symbol;
        this._crs = crs;
    }

    /**
     * Renders the feature with the given parameters.
     * @param {Number} resolution
     * @param {sGis.Crs} crs
     * @returns {sGis.IRender[]}
     */
    render(resolution: number, crs: Crs): IRender[] {
        if (this._hidden || !this.symbol) return [];
        if (!this._needToRender(resolution, crs)) return this._rendered.renders;

        /**
         * @type {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
         * @private
         */
        this._rendered = {
            resolution: resolution,
            crs: crs,
            renders: this.symbol.renderFunction(this, resolution, crs)
        };

        return this._rendered.renders;
    }

    protected _needToRender(resolution: number, crs: Crs): boolean {
        return !this._rendered || this._rendered.resolution !== resolution || this._rendered.crs !== crs;
    }

    /**
     * Returns the cached render of the feature.
     * @returns {{resolution: Number, crs: sGis.Crs, renders: sGis.IRender[]}}
     */
    getRenderCache(): RenderCache {
        return this._rendered;
    }

    /**
     * Resets the rendered cache of the feature, making it to redraw in the next redraw cycle.
     */
    redraw(): void {
        delete this._rendered;
    }

    /**
     * Prevents feature from rendering.
     */
    hide(): void { this._hidden = true; }

    /**
     * Allows feature to render after it was hidden.
     */
    show(): void { this._hidden = false; }

    /**
     * Sets a temporary symbol for the feature. This symbol is used instead of the original symbol until cleared.
     * @param {sGis.Symbol} symbol
     */
    setTempSymbol(symbol: Symbol): void {
        this._tempSymbol = symbol;
        this.redraw();
    }

    /**
     * Clears the previously set temporary symbol, restoring the original symbol.
     */
    clearTempSymbol() {
        this._tempSymbol = null;
        this.redraw();
    }

    /**
     * Returns true, if a temporary symbol is currently set for this feature.
     * @returns {Boolean}
     */
    get isTempSymbolSet(): boolean { return !!this._tempSymbol; }

    /**
     * Returns the original symbol of the feature. If temporary symbol is not set, the returned value will be same as value of the .symbol property.
     * @returns {sGis.Symbol}
     */
    get originalSymbol(): Symbol { return this._symbol; }

    /**
     * Coordinate system of the feature.
     * @readonly
     * @type {sGis.Crs}
     * @default sGis.CRS.geo
     */
    get crs(): Crs { return this._crs; }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     * @type {sGis.Symbol}
     * @default null
     */
    get symbol(): Symbol { return this._tempSymbol || this._symbol; }
    set symbol(symbol: Symbol) {
        this._symbol = symbol;
        this.redraw();
    }

    /**
     * Specifies weather the feature is hidden by .hide() method.
     * @type Boolean
     * @readonly
     */
    get hidden(): boolean { return this._hidden; }

    /**
     * Bounding box of the feature.
     * @type {sGis.Bbox}
     * @readonly
     */
    abstract get bbox(): Bbox;
}

/**
 * @typedef {function(Object)} sGis.Feature.constructor
 * @returns sGis.Feature
 */

