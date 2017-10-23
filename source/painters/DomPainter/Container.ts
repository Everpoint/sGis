import {isIE} from "../../utils/utils";
import {Bbox} from "../../Bbox";
import {Crs} from "../../Crs";

let containerStyle = 'width: 100%; height: 100%; transform-origin: left top; position: absolute;';

/**
 * @alias sGis.painter.domPainter.Container
 */
export class Container {
    private _onEmpty: Function;
    private _bbox: Bbox;
    private _resolution: number;
    private _container: HTMLElement;
    private _scale: number;

    constructor(wrapper, bbox, resolution, onEmpty) {
        this._onEmpty = onEmpty;
        this._bbox = bbox;
        this._resolution = resolution;

        this._setContainer(wrapper);
    }

    _setContainer(wrapper) {
        this._container = document.createElement('div');
        this._container.style.cssText = containerStyle;
        wrapper.appendChild(this._container);
    }

    remove() {
        this._container.innerHTML = '';
        if (this._container.parentNode) this._container.parentNode.removeChild(this._container);
    }

    get isEmpty() { return this._container.childElementCount === 0; }
    get scale() { return this._scale; }
    get crs(): Crs { return this._bbox.crs; }

    updateTransform(parentBbox, parentResolution) {
        if (parentBbox.crs !== this._bbox.crs) parentBbox = parentBbox.projectTo(this._bbox.crs);
        this._scale = this._resolution / parentResolution;
        setNodeTransform(
            this._container,
            this._scale,
            (this._bbox.xMin - parentBbox.xMin) / parentResolution,
            (parentBbox.yMax - this._bbox.yMax) / parentResolution
        );
    }

    addNode(node, width, height, bbox) {
        if (bbox.crs !== this._bbox.crs) {
            if (!bbox.crs.canProjectTo(this._bbox.crs)) return;
            bbox = bbox.projectTo(this._bbox.crs);
        }
        Container._setNodeStyle(node);
        setNodeTransform(
            node,
            bbox.width / width / this._resolution,
            (bbox.xMin - this._bbox.xMin) / this._resolution,
            (this._bbox.yMax - bbox.yMax) / this._resolution
        );

        this._container.appendChild(node);
    }

    addFixedSizeNode(node, position, offset = [0, 0]) {
        Container._setNodeStyle(node);
        setNodeTransform(
            node,
            1,
            position[0] + offset[0] - this._bbox.xMin / this._resolution,
            position[1] + offset[1] + this._bbox.yMax / this._resolution
        );

        this._container.appendChild(node);
    }

    get resolution() { return this._resolution; }

    static _setNodeStyle(node) {
        node.style.position = 'absolute';
        node.style.transformOrigin = 'left top';
    }

    removeNode(node) {
        if (node.parentNode === this._container) {
            this._container.removeChild(node);
            if (this._container.childElementCount === 0) {
                this._onEmpty();
            }
        }
    }
}

function setNodeTransform(node, scale, tx, ty) {
    tx = browserAdj(normalize(tx));
    ty = browserAdj(normalize(ty));
    scale = normalize(scale);
    node.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0px) scale(' + scale.toPrecision(6) + ',' + scale.toPrecision(6) + ')';
}

function normalize(n) {
    return Math.abs(n - Math.round(n)) < 0.001 ? Math.round(n) : n;
}

function browserAdj(n) {
    if (!isIE) {
        return Math.round(n);
    }
    return n;
}
