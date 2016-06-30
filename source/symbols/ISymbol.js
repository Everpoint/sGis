/**
 * @interface sGis.ISymbol
 */

/**
 * @constructor
 * @memberof sGis.ISymbol
 * @param {Object} options - key-value list of the properties to be assigned to the instance
 */

/**
 * This function will be called every time the feature has to be drawn. It returns an array of renders that will actually be displayed on the map.
 * @method renderFunction
 * @memberof sGis.ISymbol
 * @instance
 * @param {sGis.Feature} feature - feature to be drawn
 * @param {Number} resolution - the resolution of the render
 * @param {sGis.Crs} crs - the target crs of the render
 * @returns {sGis.IRender[]}
 */

/**
 * @namespace sGis.symbol
 */