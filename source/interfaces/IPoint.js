/**
 * @interface sGis.IPoint
 */

/**
 * Position of the point given in object's own coordinate system in [x, y] format.
 * @member {Position} sGis.IPoint#position
 */

/**
 * Object's coordinate system.
 * @member {sGis.Crs} sGis.IPoint#crs
 */

/**
 * Returns a copy of the object, projected to the specified coordinate system.
 * @method
 * @name sGis.IPoint#projectTo
 * @returns {sGis.IPoint}
 */

/**
 * Position of the point with specified coordinate system.
 * @member {sGis.Point} sGis.IPoint#point
 */

/**
 * X coordinate
 * @member {Number} sGis.IPoint#x
 */

/**
 * Y coordinate
 * @member {Number} sGis.IPoint#y
 */


/**
 * @typedef Position
 * @type {Array}
 * @prop {Number} 0 - first (X) coordinate
 * @prop {Number} 1 - second (Y) coordinate
 */