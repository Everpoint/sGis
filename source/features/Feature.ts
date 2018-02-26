import {Crs, geo} from "../Crs";
import {EventHandler, MouseEventFlags} from "../EventHandler";
import {Symbol} from "../symbols/Symbol";
import {Bbox} from "../Bbox";
import {Render} from "../renders/Render";
import {Coordinates} from "../baseTypes";

export type RenderCache = {
    resolution: number,
    crs: Crs,
    renders: Render[]
};

export interface FeatureParams {
    crs?: Crs;
    symbol?: Symbol<Feature>;
    persistOnMap?: boolean;
}

/**
 * Abstract feature object without any geometry. All other features inherit from this class. It can be used to store attributes in the way compatible with other features.
 * @alias sGis.Feature
 */
export abstract class Feature extends EventHandler {
    private _crs: Crs;
    private _hidden: boolean = false;
    private readonly _symbolContainer: FeatureSymbolContainer;

    persistOnMap: boolean;

    /**
     * Sets default coordinate system for all features.<br><br>
     *     <strong>
     *     NOTE: This method affects all already created features that do not have explicitly specified crs.
     *     You should use this function only when initializing the library.
     *     </strong>
     * @param crs
     */
    static setDefaultCrs(crs: Crs): void {
        Feature.prototype._crs = crs;
    }

    constructor({ crs = geo, symbol, persistOnMap = false }: FeatureParams = {}) {
        super();

        this._symbolContainer = new FeatureSymbolContainer(this, symbol);
        this._crs = crs;
        this.persistOnMap = persistOnMap;
    }

    render(resolution: number, crs: Crs): Render[] { return this._symbolContainer.render(resolution, crs); }

    /**
     * Resets the rendered cache of the feature, making it to redraw in the next redraw cycle.
     */
    redraw(): void {
        this._symbolContainer.reset();
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
     * @param symbol
     */
    setTempSymbol(symbol: Symbol<Feature>): void {
        this._symbolContainer.setTempSymbol(symbol);
    }

    /**
     * Clears the previously set temporary symbol, restoring the original symbol.
     */
    clearTempSymbol() {
        this._symbolContainer.clearTempSymbol();
    }

    /**
     * Returns true, if a temporary symbol is currently set for this feature.
     */
    get isTempSymbolSet(): boolean { return this._symbolContainer.isTempSymbolSet; }

    /**
     * Returns the original symbol of the feature. If temporary symbol is not set, the returned value will be same as value of the .symbol property.
     */
    get originalSymbol(): Symbol<Feature> { return this._symbolContainer.originalSymbol; }

    /**
     * Coordinate system of the feature.
     */
    get crs(): Crs { return this._crs; }

    /**
     * Current symbol of the feature. If temporary symbol is set, the value will be the temporary symbol.
     */
    get symbol(): Symbol<Feature> { return this._symbolContainer.symbol; }
    set symbol(symbol: Symbol<Feature>) { this._symbolContainer.symbol = symbol; }

    /**
     * Specifies weather the feature is hidden by .hide() method.
     */
    get hidden(): boolean { return this._hidden; }

    /**
     * Bounding box of the feature.
     */
    abstract get bbox(): Bbox;
    abstract projectTo(crs: Crs): Feature;
    abstract get centroid(): Coordinates;
}

class FeatureSymbolContainer {
    private readonly _feature: Feature;
    private _symbol: Symbol<Feature> | null;
    private _tempSymbol: Symbol<Feature> | null = null;
    private _cached: RenderCache | null = null;

    constructor(feature: Feature, symbol: Symbol<Feature> = null) {
        this._feature = feature;
        this._symbol = symbol;
    }

    get symbol() { return this._tempSymbol || this._symbol; }
    set symbol(symbol: Symbol<Feature>) {
        this._symbol = symbol;
        this.reset();
    }

    /**
     * Renders the feature with the given parameters.
     * @param resolution
     * @param crs
     */
    render(resolution: number, crs: Crs): Render[] {
        if (this._feature.hidden || !this.symbol) return [];
        if (!this._needToRender(resolution, crs)) return this._cached.renders;

        this._cached = {
            resolution: resolution,
            crs: crs,
            renders: this.symbol.renderFunction(this._feature, resolution, crs)
        };

        if (this._feature.eventFlags !== MouseEventFlags.None) this._cached.renders.forEach(render => {
            render.listenFor(this._feature.eventFlags, (event) => {
                this._feature.fire(event);
            });
        });

        return this._cached.renders;
    }

    private _needToRender(resolution: number, crs: Crs): boolean {
        return !this._cached || this._cached.resolution !== resolution || this._cached.crs !== crs || this._cached.renders.length === 0;
    }

    reset() {
        this._cached = null;
    }

    setTempSymbol(symbol: Symbol<Feature>): void {
        this._tempSymbol = symbol;
        this.reset();
    }

    clearTempSymbol() {
        this._tempSymbol = null;
        this.reset();
    }

    get isTempSymbolSet(): boolean { return !!this._tempSymbol; }
    get originalSymbol(): Symbol<Feature> { return this._symbol; }
}