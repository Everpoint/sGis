import {Layer, LayerConstructorParams, PropertyChangeEvent} from "./Layer";
import {Crs} from "../Crs";
import {Bbox} from "../Bbox";
import {Render} from "../renders/Render";
import {StaticHtmlImageRender} from "../renders/StaticHtmlImageRender";

export type GetUrlDelegate = (bbox: Bbox, resolution: number) => string;

/**
 * Represents a layer that is fully drawn by server and is displayed as an image overlay.
 * @alias sGis.DynamicLayer
 */
export abstract class DynamicLayer extends Layer {
    private _crs: Crs;
    private _forceUpdate: boolean = false;

    private _currentRender: StaticHtmlImageRender;
    private _nextRender: StaticHtmlImageRender;

    private _toLoad?: {bbox: Bbox, resolution: number};

    delayedUpdate = true;

    /**
     * @param properties - properties to be set to the corresponding fields
     * @param extensions - [JS ONLY]additional properties to be copied to the created instance
     */
    constructor(properties: LayerConstructorParams = {}, extensions?: Object) {
        super(properties, extensions);
    }

    abstract getUrl(bbox: Bbox, resolution: number);

    getRenders(bbox: Bbox, resolution: number): Render[] {
        if (!this.checkVisibility(resolution)) return [];

        if (this.crs) {
            if (bbox.crs.canProjectTo(this.crs)) {
                bbox = bbox.projectTo(this.crs);
            } else {
                return [];
            }
        }

        let needRedraw = this._forceUpdate || !this._currentRender || !bbox.equals(this._currentRender.bbox);
        if (needRedraw) {
            this._loadNextRender(bbox, resolution);
        }

        if (this._nextRender !== this._currentRender && this._nextRender.isReady) {
            this._currentRender = this._nextRender;
        }

        this._forceUpdate = false;
        return this._currentRender ? [this._currentRender] : [];
    }

    private _loadNextRender(bbox: Bbox, resolution: number): void {
        if (this._currentRender === this._nextRender) {
            let height = Math.round(bbox.height / resolution);
            let width = Math.round(bbox.width / resolution);
            let src = this.getUrl(bbox, resolution);
            if (this._forceUpdate) src += `&ts=${Date.now()}`;

            this._nextRender = new StaticHtmlImageRender({
                src,
                bbox,
                height,
                width,
                opacity: this.opacity,
                onLoad: () => {
                    this.redraw();
                },
                onDisplayed: () => {
                    this._startNextLoad();
                }
            });
            this._toLoad = null;
        } else {
            this._toLoad = {bbox, resolution};
        }
    }

    private _startNextLoad(): void {
        if (this._toLoad) {
            this._loadNextRender(this._toLoad.bbox, this._toLoad.resolution);
            this._toLoad = null;
        }
    }

    /**
     * Ensures update of the layer image
     */
    forceUpdate(): void {
        this._forceUpdate = true;
        this.fire(new PropertyChangeEvent('source'));
    }

    get opacity() { return this.getOpacity(); }
    set opacity(opacity) {
        this.setOpacity(opacity);
    }

    protected setOpacity(value: number): void {
        if (this._currentRender) this._currentRender.opacity = value;
        if (this._nextRender) this._nextRender.opacity = value;
        super.setOpacity(value);
    }

    /**
     * Coordinate system of the layer
     */
    get crs(): Crs { return this._crs; }
    set crs(crs: Crs) { this._crs = crs; }
}
