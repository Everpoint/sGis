import {MaptipSymbol} from "../symbols/MaptipSymbol";
import {Feature} from "./Feature";
import {IPoint, Point} from "../Point";
import {Coordinates} from "../baseTypes";
import {Bbox} from "../Bbox";

/**
 * Information box on the map
 * @alias sGis.feature.Maptip
 * @extends sGis.Feature
 */
export class Maptip extends Feature implements IPoint {
    _symbol = new MaptipSymbol();
    private _position: Coordinates;
    private _content: string;

    /**
     * @constructor
     * @param {Position} position - reference point of the information box
     * @param {Object} properties - key-value set of properties to be assigned to the instance
     */
    constructor(position, properties) {
        super(properties);
        this._position = position;
    }

    /**
     * HTML content of the infobox.
     * @type {String}
     */
    get content() { return this._content; }
    set content(/** String */ content) {
        this._content = content;
        this.redraw();
    }

    /**
     * Reference point of the information box. The box arrow will point to this position.
     * @type {Position}
     */
    get position() { return this._position; }
    set position(/** Position */ position) {
        this._position = position;
        this.redraw();
    }

    /**
     * Returns new maptip with position projected to the specified coordinate system.
     * @param {sGis.Crs} crs - target coordinate system
     * @returns {sGis.feature.Maptip}
     */
    projectTo(crs) {
        let projected = this.point.projectTo(crs);
        return new Maptip(projected.position, { crs: crs, content: this.content });
    }

    /**
     * Reference point of the information box.
     * @type {sGis.Point}
     * @readonly
     */
    get point() {
        return new Point(this.position, this.crs);
    }

    /**
     * X coordinate of the reference point.
     * @type {Number}
     * @readonly
     */
    get x() {
        return this.position[0];
    }

    /**
     * Y coordinate of the reference point.
     * @type {Number}
     * @readonly
     */
    get y() {
        return this.position[1];
    }

    /**
     * Bounding box of the feature.
     * @type {sGis.Bbox}
     * @readonly
     */
    get bbox() { return new Bbox(this._position, this._position, this.crs); }
}
