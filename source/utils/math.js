sGis.module('math', [], function() {
    'use strict';

    /**
     * @namespace
     * @memberof sGis
     */
    var math = {
        /**
         * Converts degrees to radians
         * @param {number} d - degrees
         * @returns {number}
         */
        degToRad: function (d) {
            return d / 180 * Math.PI;
        },

        /**
         * Converts radians to degrees
         * @param {number} r - radians
         * @returns {number}
         */
        radToDeg: function (r) {
            return r / Math.PI * 180;
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function softEquals(a, b) {
            return Math.abs(a - b) < math.tolerance * a;
        },

        tolerance: 0.000001
    };

    return math;

});