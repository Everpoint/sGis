/**
 * Converts degrees to radians
 * @param {number} d - degrees
 * @returns {number}
 */
import {Coordinates} from "../baseTypes";

export const degToRad = function (d) {
    return d / 180 * Math.PI;
};

/**
 * Converts radians to degrees
 * @param {number} r - radians
 * @returns {number}
 */
export const radToDeg = function (r) {
    return r / Math.PI * 180;
};

export const tolerance = 0.000001;
/**
 * Returns true if a and b differ less then one millionth of a, otherwise false
 * @param {Number} a
 * @param {Number} b
 * @returns {boolean}
 */
export const softEquals = function softEquals(a, b) {
    return Math.abs(a - b) < tolerance * a;
};

/**
 * Prepares the set of coordinates for matrix operations
 * @param {Position[]} coord
 * @param {Position} center - the center of the operation
 */
export const extendCoordinates = function(coord, center) {
    coord.forEach(point => {
        point[0] = point[0] - center[0];
        point[1] = point[1] - center[1];
        point[2] = 1;
    });
};

/**
 * Takes extended coordinates and make them plain again
 * @param {Position[]} coord
 * @param {Position} center - the center of the operation
 */
export const collapseCoordinates = function(coord, center) {
    coord.forEach(point => {
        point[0] = point[0] + center[0];
        point[1] = point[1] + center[1];
        point.splice(2, 1);
    });
};

/**
 * Returns a new array with simplified coordinates
 * @param {Position[][]} rings - array of coordinate contours
 * @param tolerance - the tolerance of simplification. Points that are overflow other points or lines with given tolerance will be excluded from the result
 * @returns {Position[][]}
 */
export const simplifyCoordinates = function(rings, tolerance) {
    var result = [];

    for (var ring = 0, l = rings.length; ring < l; ring++) {
        var simplified = [rings[ring][0]];
        for (var i = 1, len = rings[ring].length - 1; i < len; i++) {
            if (rings[ring][i].length === 0 || simplified[simplified.length - 1].length === 0 || Math.abs(rings[ring][i][0] - simplified[simplified.length - 1][0]) > tolerance || Math.abs(rings[ring][i][1] - simplified[simplified.length - 1][1]) > tolerance) {
                simplified.push(rings[ring][i]);
            }
        }
        if (simplified[simplified.length - 1] !== rings[ring][rings[ring].length - 1]) simplified.push(rings[ring][rings[ring].length - 1]);
        result[ring] = simplified;
    }

    return result;
};

/**
 * Multiplies matrix a by matrix b
 * @param a
 * @param b
 * @returns {Array}
 */
export const multiplyMatrix = function(a, b) {
    var c = [];
    for (var i = 0, m = a.length; i < m; i++) {
        c[i] = [];
        for (var j = 0, q = b[0].length; j < q; j++) {
            c[i][j] = 0;
            for (var r = 0, n = b.length; r < n; r++) {
                c[i][j] += a[i][r] * b[r][j];
            }
        }
    }

    return c;
};

export const squareDistance = function(a: Coordinates, b: Coordinates) {
    return (a[0] - b[0])*(a[0] - b[0]) + (a[1] - b[1])*(a[1] - b[1]);
};