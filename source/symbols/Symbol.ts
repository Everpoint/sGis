import {deserialize, serialize} from "../serializers/symbolSerializer";
import {Feature} from "../features/Feature";
import {Crs} from "../Crs";
import {DynamicRender, Render} from "../renders/Render";
import {Bbox} from "../Bbox";
import {MouseEventFlags, mouseEvents} from "../EventHandler";
import {listenDomEvent} from "../utils/domEvent";
import {Offset} from "../baseTypes";
import {PointFeature} from "../features/PointFeature";
import {DynamicSymbolFeature} from "./DynamicSymbolFeature";


/**
 * Symbol that renders a feature to the screen coordinate system. All symbols take as input a feature, target resolution
 * and target crs, and must return a set of renders (rendered primitives) that then can be used to draw the feature.
 * @alias sGis.Symbol
 */
export abstract class Symbol<T extends Feature> {
    /**
     * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
     * If the symbol cannot render provided feature, empty array is returned.
     * @param feature - feature to be drawn.
     * @param resolution - resolution of the render.
     * @param crs - target coordinate system of the render.
     */
    abstract renderFunction(feature: T, resolution: number, crs: Crs): Render[]

    /**
     * Returns a copy of the symbol. Only essential properties are copied.
     */
    clone(): Symbol<T> {
        let desc = serialize(this);
        return deserialize(desc);
    }
}

export type SymbolConstructor = new () => Symbol<Feature>;

export interface DynamicPointSymbolParams {
    offset?: Offset;
    onRender?: () => void;
}

export abstract class DynamicPointSymbol extends Symbol<PointFeature> {
    protected abstract _getFeatureNode(feature: Feature): HTMLElement;

    readonly offset: Offset;
    readonly onRender?: () => void;

    constructor({offset = [0, 0], onRender}: DynamicPointSymbolParams = {}) {
        super();
        this.offset = offset;
        this.onRender = onRender;
    }

    renderFunction (feature: PointFeature, resolution: number, crs: Crs): Render[] {
        let dynamicFeature = <DynamicSymbolFeature>feature;
        if (dynamicFeature.__dynamicSymbolRender) return [dynamicFeature.__dynamicSymbolRender];

        let node = this._getFeatureNode(feature);
        node.style.position = 'absolute';

        dynamicFeature.__dynamicSymbolRender = new DynamicRender({
            node: node,
            onRender: this.onRender,
            update: (bbox: Bbox = null, resolution: number = null) => {
                if (bbox === null) bbox = dynamicFeature.__lastBbox;
                if (resolution === null) resolution = dynamicFeature.__lastResolution;

                if (!bbox || !resolution || !dynamicFeature.crs.canProjectTo(bbox.crs)) return;

                let point = dynamicFeature.projectTo(bbox.crs);
                let dx = Math.round((point.x - bbox.xMin) / resolution + this.offset[0]);
                let dy = Math.round((bbox.yMax - point.y) / resolution + this.offset[1]);

                node.style.left = `${dx.toString()}px`;
                node.style.top = `${dy.toString()}px`;

                dynamicFeature.__lastBbox = bbox;
                dynamicFeature.__lastResolution = resolution;
            },
            redraw: () => {
                this._updateFeatureNode(dynamicFeature);
            }
        });

        this._setEventListeners(dynamicFeature);

        return [dynamicFeature.__dynamicSymbolRender];
    }

    getNode(feature: PointFeature): HTMLElement {
        let [render] = this.renderFunction(feature, 1, null);
        return (<DynamicRender>render).node;
    }

    private _setEventListeners(dynamicFeature: DynamicSymbolFeature): void {
        if (dynamicFeature.eventFlags === MouseEventFlags.None) return;

        Object.keys(mouseEvents).forEach(eventName => {
            if (dynamicFeature.eventFlags & mouseEvents[eventName].flag) {
                listenDomEvent(dynamicFeature.__dynamicSymbolRender.node, mouseEvents[eventName].type, (event) => {
                    dynamicFeature.fire(mouseEvents[eventName].type, {
                        node: dynamicFeature.__dynamicSymbolRender.node,
                        browserEvent: event
                    });
                });
            }
        });
    }

    protected _updateFeatureNode(feature: PointFeature): void {
        // do nothing
    }
}

