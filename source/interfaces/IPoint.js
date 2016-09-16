/**
 * @interface sGis.IPoint
 */

/**
 * Position of the point given in object's own coordinate system in [x, y] format.
 * @member {Position} position
 * @instance
 * @memberof sGis.IPoint
 */

/**
 * Object's coordinate system.
 * @member {sGis.Crs} crs
 * @instance
 * @memberof sGis.IPoint
 */

/**
 * Returns a copy of the object, projected to the specified coordinate system.
 * @method projectTo
 * @instance
 * @memberof sGis.IPoint
 * @returns {sGis.IPoint}
 */

/**
 * Position of the point with specified coordinate system.
 * @member {sGis.Point} point
 * @instance
 * @memberof sGis.IPoint
 */

/**
 * X coordinate
 * @member {Number} x
 * @instance
 * @memberof sGis.IPoint
 */

/**
 * Y coordinate
 * @member {Number} y
 * @instance
 * @memberof sGis.IPoint
 */


/**
 @typedef Position
 @type {Array}
 @prop {Number} 0 - first (X) coordinate
 @prop {Number} 1 - second (Y) coordinate
 */