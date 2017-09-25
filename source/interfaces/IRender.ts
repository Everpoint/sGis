export type CoordinatesObj = {
    x: number,
    y: number
};

export interface IRender {
    contains(position: CoordinatesObj): boolean;
    isVector: boolean
}

/**
 * @interface sGis.IRender
 */

/**
 * Returns true if 'position' is inside the rendered arc.
 * @method
 * @name sGis.IRender#contains
 * @param {Object} position - position in the rendered (px) coordinates in {x: X, y: Y} format.
 * @returns {boolean}
 */

/**
 * Specifies whether the render is vector or dom
 * @member {Boolean} sGis.IRender#isVector
 * @readonly
 */

/**
 * @namespace sGis.render
 */