import {Coordinates, HTMLRasterElement, Offset} from "../baseTypes";
import {VectorRender} from "./Render";

export type StaticCanvasImageParams = {

}

/**
 * Image render that is drawn to the vector container instead of DOM.
 */
export class StaticImage extends VectorRender {
    private _node: HTMLRasterElement;
    private _position: Coordinates;

    /**
     * Offset of the element from its position.
     */
    offset: Offset;

    constructor(imageNode: HTMLRasterElement, position: Coordinates, offset: Offset = [0, 0]) {
        super();

        this._node = imageNode;
        this._position = position;
        this.offset = offset;
    }

    /**
     * Image of the render.
     */
    get node(): HTMLRasterElement { return this._node; }

    get isVector(): boolean { return true; }

    get origin(): Coordinates { return [this._position[0] + this.offset[0], this._position[1] + this.offset[1]]; }

    contains(position: Coordinates): boolean {
         let [x, y] = this.origin;
         return position[0] >= x && position[0] <= x + this._node.width && position[1] >= y && position[1] <= y + this._node.height;
    }
}
