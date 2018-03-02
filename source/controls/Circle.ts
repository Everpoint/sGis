import {PolyDrag} from "./PolyDrag";
import {Point} from "../Point";
import {Contour, Coordinates} from "../baseTypes";

/**
 * Control for drawing circles by dragging from center to the radius.
 * @alias sGis.controls.Circle
 */
export class Circle extends PolyDrag {
    /** The number of segments of the circle. The higher this number is the smoother the circle will be. */
    segmentNo: number = 36;
    private _centerPoint?: Coordinates;

    protected _getNewCoordinates(point: Point): Contour[] {
        this._centerPoint = point.position;
        return [[]];
    }

    protected _getUpdatedCoordinates(point: Point): Contour[] {
        if (!this._centerPoint) return [];

        let radius = Math.sqrt(Math.pow(this._centerPoint[0] - point.position[0], 2) + Math.pow(this._centerPoint[1] - point.position[1], 2));
        let angleStep = 2 * Math.PI / this.segmentNo;

        let coordinates = [];
        for (let i = 0; i < this.segmentNo; i++) {
            coordinates.push(<Coordinates>[
                this._centerPoint[0] + radius * Math.sin(angleStep * i),
                this._centerPoint[1] + radius * Math.cos(angleStep * i)
            ]);
        }

        return [coordinates];
    }
}
