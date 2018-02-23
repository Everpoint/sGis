import {Coordinates} from "../baseTypes";
import {VectorRender} from "./Render";

export interface ArcRenderConstructorParams {
    /** @see Arc.radius */
    radius?: number,
    /** @see Arc.strokeColor */
    strokeColor?: string,
    /** @see Arc.strokeWidth */
    strokeWidth?: number,
    /** @see Arc.fillColor */
    fillColor?: string,
    /** @see Arc.ignoreEvents */
    ignoreEvents?: boolean,
    /** @see Arc.startAngle */
    startAngle?: number,
    /** @see Arc.endAngle */
    endAngle?: number,
    /** @see Arc.isSector */
    isSector?: boolean,
    /** @see Arc.clockwise */
    clockwise?: boolean
}

/**
 * Rendered arc (circle) on a map.
 * @alias sGis.render.Arc
 */
export class Arc extends VectorRender {
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
     * @param center - the center of the arc, in the [x, y] format.
     * @param [options] - key-value options of any Arc parameters
     */
    constructor(center: Coordinates, options: ArcRenderConstructorParams = {}) {
        super();
        Object.assign(this, options);
        this.center = center;
    }

    contains(position: Coordinates): boolean {
        let dx = position[0] - this.center[0];
        let dy = position[1] - this.center[1];
        let distance2 = dx * dx + dy * dy;

        return distance2 < (this.radius + 2)*(this.radius + 2);
    }

    get isVector() { return true; }
}
