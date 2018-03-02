import {Control} from "./Control";
import {Map} from "../Map";
import {DomPainter} from "../painters/DomPainter/DomPainter";
import {Feature} from "../features/Feature";
import {sGisClickEvent} from "../commonEvents";
import {Balloon} from "../features/Balloon";
import {Poly} from "../features/Poly";
import {PointFeature} from "../features/PointFeature";
import {getGuid} from "../utils/utils";
import {BalloonSymbol} from "../symbols/BalloonSymbol";
import {Bbox} from "../Bbox";

const OFFSET = 10;

export interface BalloonControlParams {
    painter?: DomPainter;
}

/**
 * @example controls/Balloon_Control
 */
export class BalloonControl extends Control {
    painter?: DomPainter;

    private _activeBalloon?: Balloon;
    private _ns: string;
    private _symbol: BalloonSymbol;

    constructor(map: Map, {painter}: BalloonControlParams = {}) {
        super(map, {useTempLayer: true});

        this.painter = painter;
        this._ns = '.' + getGuid;
        this._onMapClick = this._onMapClick.bind(this);
        this._symbol = new BalloonSymbol({onRender: this._onRender.bind(this)});
    }

    attach(feature: Feature, html: HTMLElement | string): void {
        let balloon = new Balloon([0, 0], {crs: feature.crs, content: html, symbol: this._symbol});
        feature.on(sGisClickEvent.type + this._ns, this._showBalloon.bind(this, feature, balloon));
    }

    detach(feature: Feature): void {
        feature.off(this._ns);
    }

    private _showBalloon(feature: Feature, balloon: Balloon, event: sGisClickEvent): void {
        event.stopPropagation();

        if (feature instanceof Poly) {
            balloon.position = feature.centroid;
        } else if (feature instanceof PointFeature) {
            balloon.position = feature.position;
        }

        if (this._activeBalloon && this._tempLayer) {
            this._tempLayer.remove(this._activeBalloon);
        }

        if (!this._isActive) this.activate();

        if (this._tempLayer) this._tempLayer.add(balloon);
        this._activeBalloon = balloon;
    }

    private _onRender() {
        if (!this.painter || !this._activeBalloon) return;

        let node = this._symbol.getNode(this._activeBalloon);
        if (!node) return;

        let size = node.getBoundingClientRect();
        let position = this._activeBalloon.projectTo(this.map.crs).position;
        let resolution = this.map.resolution;
        let halfWidth = size.width * resolution / 2;
        let height = size.height * resolution;
        let balloonBbox = new Bbox([position[0] - halfWidth, position[1]], [position[0] + halfWidth, position[1] + height], this._activeBalloon.crs)
            .offset([OFFSET * resolution, OFFSET * resolution]);
        let mapBbox = this.painter.bbox;

        let newBbox = mapBbox.clone();
        if (newBbox.yMin > balloonBbox.yMin) {
            newBbox.yMin = balloonBbox.yMin;
            newBbox.yMax = newBbox.yMin + mapBbox.height;
        } else if (newBbox.yMax < balloonBbox.yMax) {
            newBbox.yMax = balloonBbox.yMax;
            newBbox.yMin = newBbox.yMax - mapBbox.height;
        }

        if (newBbox.xMin > balloonBbox.xMin && newBbox.xMax < balloonBbox.xMax) {
            newBbox.xMin = balloonBbox.center[0] - mapBbox.width / 2;
            newBbox.xMax = balloonBbox.center[1] + mapBbox.width / 2;
        } else if (newBbox.xMin > balloonBbox.xMin) {
            newBbox.xMin = balloonBbox.xMin;
            newBbox.xMax = newBbox.xMin + mapBbox.width;
        } else if (newBbox.xMax < balloonBbox.xMax) {
            newBbox.xMax = balloonBbox.xMax;
            newBbox.xMin = newBbox.xMax - mapBbox.width;
        }

        this.painter.show(newBbox);
    }

    protected _activate(): void {
        this.map.on('click', this._onMapClick);
    }

    protected _deactivate(): void {
        this.map.off('click', this._onMapClick);
        this._activeBalloon = undefined;
    }

    private _onMapClick() {
        this.deactivate();
    }
}