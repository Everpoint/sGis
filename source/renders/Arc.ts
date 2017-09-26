import {Coordinates} from "../baseTypes";
import {IRender} from "../interfaces/IRender";

/**
 * Rendered arc (circle) on a map.
 * @alias sGis.render.Arc
 * @implements sGis.IRender
 */
export class Arc implements IRender {

    /** The center of the arc in [x, y] format. */
    center: Coordinates = [0, 0];

    /** The radius of the arc. */
    radius: number = 5;

    /** The stroke color of the arc (outline color). The value can be any valid css color string. */
    strokeColor: string = 'black';

    /** The stroke width of the arc. */
    strokeWidth: number = 1;

    /** The fill color of the arc. The value can be any valid css color string. */
    fillColor: string = 'transparent';

    /** Specifies whether this render can catch mouse events. If true, this render will be transparent for any pointer events. */
    ignoreEvents: boolean = false;

    /** Start angle of the sector. */
    startAngle: number = 0;

    /** End angle of the sector. */
    endAngle: number = 2 * Math.PI;

    /** Shows whether the arc is a sector of a circle rather then simple arc. Set to false if you need to draw a circle, for sector has all its boundaries outlined. */
    isSector: boolean = false;

    /** Direction of the arc. */
    clockwise: boolean = true;

    /**
     * @param {Position} center - the center of the arc, in the [x, y] format.
     * @param {Object} [options] - key-value options of any Arc parameters
     */
    constructor(center, options) {
        Object.assign(this, options);
        this.center = center;
    }

    contains(position) {
        let dx = position[0] - this.center[0];
        let dy = position[1] - this.center[1];
        let distance2 = dx * dx + dy * dy;

        return distance2 < (this.radius + 2)*(this.radius + 2);
    }

    get isVector() { return true; }
}
