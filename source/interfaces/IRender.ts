import {Coordinates} from "../baseTypes";

export interface IRender {
    /**
     * Returns true if 'position' is inside the rendered arc.
     * @param position in the rendered (px) coordinates in {x: X, y: Y} format.
     */
    contains(position: Coordinates): boolean | [number, number];

    /**
     * Specifies whether the render is vector or dom
     */
    isVector: boolean
}
