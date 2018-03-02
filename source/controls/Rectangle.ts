import {PolyDrag} from "./PolyDrag";
import {Contour} from "../baseTypes";
import {Point} from "../Point";

/**
 * Control for drawing rectangles by dragging from corner to corner.
 * @alias sGis.controls.Rectangle
 */
export class Rectangle extends PolyDrag {
    protected _getNewCoordinates(point: Point): Contour[] {
        const position = point.position;
        return [[position, position, position, position]];
    }

    protected _getUpdatedCoordinates(point: Point): Contour[] {
        const baseCoord = this._activeFeature.rings[0][0];
        const pointCoord = point.position;

        return [[baseCoord, [baseCoord[0], pointCoord[1]], pointCoord, [pointCoord[0], baseCoord[1]]]];
    }
}
