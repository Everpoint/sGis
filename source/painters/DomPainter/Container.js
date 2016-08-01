sGis.module('painter.domPainter.Container', [
    
], () => {

    var containerStyle = 'width: 100%; height: 100%; transform-origin: left top; position: absolute;';

    class Container {
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
        get crs() { return this._bbox.crs; }

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
            if (bbox.crs !== this._bbox.crs) bbox = bbox.projectTo(this._bbox.crs);
            Container._setNodeStyle(node);
            setNodeTransform(
                node,
                bbox.width / width / this._resolution,
                (bbox.xMin - this._bbox.xMin) / this._resolution,
                (this._bbox.yMax - bbox.yMax) / this._resolution
            );

            this._container.appendChild(node);
        }

        addFixedSizeNode(node, position) {
            Container._setNodeStyle(node);
            setNodeTransform(
                node,
                1,
                position[0] - this._bbox.xMin / this._resolution,
                position[1] + this._bbox.yMax / this._resolution
            );

            this._container.appendChild(node);
        }

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
        if (!sGis.isIE) {
            return Math.round(n);
        }
        return n;
    }

    return Container;
    
});