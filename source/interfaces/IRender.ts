import {Coordinates} from "../baseTypes";

export interface IRender {
    /**
     * Returns true if 'position' is inside the render.
     * @param position in the rendered (px) coordinates in {x: X, y: Y} format.
     */
    contains(position: Coordinates): boolean | [number, number];

    /**
     * Specifies whether the render is vector or dom
     */
    isVector: boolean
}

export type OnAfterDisplayedHandler = (HTMLElement) => void;

export type GetNodeCallback = (Error, HTMLElement) => void;