sGis.module('utils', [
    'Event'
], function(Event) {
    'use strict';

    /**
     * @namespace sGis.utils
     */
    var utils = {
        /**
         * If the handler sGis.onerror is set, calls this handler with 'message' parameter. Otherwise throws an exception with 'message' description
         * @param message
         */
        error: function(message) {
            if (sGis.onerror) {
                sGis.onerror(message);
            } else {
                throw new Error(message);
            }
        },

        /**
         * Sets the values of the properties in 'options' to the 'object'.
         * Calls utils.error() in case of exception. It only sets the properties that already exist in the object if not setUndefined parameter is given
         * @param {Object} object
         * @param {Object} options
         * @param {Boolean} [setUndefined]
         */
        init: function(object, options, setUndefined) {
            if (!options) return;

            var keys = Object.keys(options);
            keys.forEach(function(key) {
                if ((setUndefined || object[key] !== undefined) && options[key] !== undefined) {
                    try {
                        object[key] = options[key];
                    } catch (e) {
                        if (!(e instanceof TypeError)) utils.error(e);
                    }
                }
            });
        },

        /**
         * Calls window.requestAnimationFrame or its friends if available or uses timeout to simulate their behavior
         * @param {Function} callback - callback function
         * @param {HTMLElement} [element] - the target of rendering
         */
        requestAnimationFrame: function(callback, element) {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

            if (requestAnimationFrame) {
                requestAnimationFrame(callback, element);
            } else {
                setTimeout(function() {
                    callback();
                }, 1000/30);
            }
        },

        /**
         * Copies the own properties of source to target, ignoring the properties already existing in target. Only one-level copy.
         * @param {Object} target
         * @param {Object} source
         */
        extend: function(target, source) {
            var keys = Object.keys(source);
            keys.forEach(function(key) {
                target[key] = source[key];
            });
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function(a, b) {
            return (Math.abs(a - b) < 0.000001 * a);
        },

        /**
         * Returns true is obj is Array, otherwise false
         * @param {Any} obj
         * @returns {boolean}
         */
        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        /**
         * Returns true if n is a finite number, otherwise false
         * @param {Any} n
         * @returns {boolean}
         */
        isNumber: function(n) {
            return typeof n === 'number' && isFinite(n);
        },

        /**
         * Returns true if n is an integer number, otherwise false
         * @param {Any} n
         * @returns {boolean}
         */
        isInteger: function(n) {
            return utils.isNumber(n) && Math.round(n) === n;
        },

        /**
         * Returns true if s is a string, otherwise false
         * @param {Any} s
         * @returns {boolean}
         */
        isString: function(s) {
            return typeof s === 'string';
        },

        /**
         * Returns true if f is a function, otherwise false
         * @param {Any} f
         * @returns {boolean}
         */
        isFunction: function(f) {
            return typeof f === 'function';
        },

        /**
         * Returns true if o is a HTML node
         * @param {Any} o
         * @returns {boolean}
         */
        isNode: function(o) {
            return !!o.nodeType;
        },

        /**
         * Returns true if o is a HTML img element
         * @param {Any} o
         * @returns {boolean}
         */
        isImage: function(o) {
            return sGis.browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement
        },

        /**
         * Throws an exception if s is not a string
         * @param {Any} s
         */
        validateString: function(s) {
            if (!utils.isString(s)) utils.error('String is expected but got ' + s + ' instead');
        },

        /**
         * Throws an exception if v is not one of the allowed values
         * @param {Any} v
         * @param {Array} allowed
         */
        validateValue: function(v, allowed) {
            if (allowed.indexOf(v) === -1) utils.error('Invalid value of the argument: ' + v);
        },

        /**
         * Throws an exception if n is not a number
         * @param {Any} n
         */
        validateNumber: function(n) {
            if (!utils.isNumber(n)) utils.error('Number is expected but got ' + n + ' instead');
        },

        /**
         * Throws an exception if n is not a positive number
         * @param n
         */
        validatePositiveNumber: function(n) {
            if (!utils.isNumber(n) || n <= 0) utils.error('Positive number is expected but got ' + n + ' instead');
        },

        /**
         * Throws an exception if b is not a boolean value
         * @param b
         */
        validateBool: function(b) {
            if (b !== true && b !== false) utils.error('Boolean is expected but got ' + b + ' instead');
        },

        /**
         * Return the maximum number in the array
         * @param {Number[]} arr
         * @returns {Number}
         * TODO: move to MATH
         */
        max: function(arr) {
            return Math.max.apply(null, arr);
        },

        /**
         * Return the minimum number in the array
         * @param {Number[]} arr
         * @returns {Number}
         * TODO: move to MATH
         */
        min: function(arr) {
            return Math.min.apply(null, arr);
        },

        /**
         * Prepares the set of coordinates for matrix operations
         * @param {Number[][]} coord
         * @param {Number[]} center - the center of the operation
         * @returns {Number[][]} extended coordinates
         * TODO: move to MATH
         */
        extendCoordinates: function(coord, center) {
            var extended = [];
            for (var i = 0, l = coord.length; i < l; i++) {
                extended[i] = [coord[i][0] - center[0], coord[i][1] - center[1], 1];
            }
            return extended;
        },

        /**
         * Takes extended coordinates and make them plain again
         * @param {Number[][]} extended
         * @param {Number[]} center - the center of the operation
         * @returns {Number[][]} extended coordinates
         * TODO: move to MATH
         */
        collapseCoordinates: function(extended, center) {
            var coord = [];
            for (var i = 0, l = extended.length; i < l; i++) {
                coord[i] = [extended[i][0] + center[0], extended[i][1] + center[1]];
            }
            return coord;
        },

        /**
         * Returns a new array with simplified coordinates
         * @param {Number[][][]} points - array of coordinate contours
         * @param tolerance - the tolerance of simplification. Points that are overflow other points or lines with given tolerance will be excluded from the result
         * @returns {Number[][][]}
         */
        simplify: function(points, tolerance) {
            var result = [];

            for (var ring = 0, l = points.length; ring < l; ring++) {
                var simplified = [points[ring][0]];
                for (var i = 1, len = points[ring].length - 1; i < len; i++) {
                    if (points[ring][i].length === 0 || simplified[simplified.length - 1].length === 0 || Math.abs(points[ring][i][0] - simplified[simplified.length - 1][0]) > tolerance || Math.abs(points[ring][i][1] - simplified[simplified.length - 1][1]) > tolerance) {
                        simplified.push(points[ring][i]);
                    }
                }
                if (simplified[simplified.length - 1] !== points[ring][points[ring].length - 1]) simplified.push(points[ring][points[ring].length - 1]);
                result[ring] = simplified;
            }

            return result;
        },

        /**
         * Returns a random GUID
         * @returns {string}
         */
        getGuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
        },

        /**
         * Sets the innerHTML property to element. It will escape the issue with table inserting as innerHTML.
         * @param {HTMLElement} element
         * @param {String} html
         */
        html: function(element, html) {
            try {
                element.innerHTML = html;
            } catch(e) {
                var tempElement = document.createElement('div');
                tempElement.innerHTML = html;
                for (var i = tempElement.childNodes.length - 1; i >=0; i--) {
                    element.insertBefore(tempElement.childNodes[i], tempElement.childNodes[i+1]);
                }
            }
        },

        /**
         * Returns true if at least one element of arr1 also exists in arr2
         * @param {Array} arr1
         * @param {Array} arr2
         * @returns {boolean}
         * TODO: check if it should work backwards also
         */
        arrayIntersect: function(arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                if (arr2.indexOf(arr1[i]) !== -1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Makes a deep copy af the array
         * @param {Array} arr
         * @returns {Array}
         */
        copyArray: function(arr) {
            var copy = [];
            for (var i = 0, l = arr.length; i < l; i++) {
                if (utils.isArray(arr[i])) {
                    copy[i] = utils.copyArray(arr[i]);
                } else {
                    copy[i] = arr[i];
                }
            }
            return copy;
        },

        /**
         * Makes a deep copy of an object
         * @param {Object} obj
         * @returns {*}
         * TODO: this will not copy the inner arrays properly
         */
        copyObject: function(obj) {
            if (!(obj instanceof Function) && obj instanceof Object) {
                var copy = utils.isArray(obj) ? [] : {};
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    copy[keys[i]] = utils.copyObject(obj[keys[i]]);
                }
                return copy;
            } else {
                return obj;
            }
        },

        /**
         * Multiplies matrix a by matrix b
         * @param a
         * @param b
         * @returns {Array}
         * TODO: move to MATH
         */
        multiplyMatrix: function(a, b) {
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
        },
        
        setCssClasses: function(desc) {
            var classes = Object.keys(desc).map(key => {return utils._getCssText(key, desc[key]);});
            utils._setStyleNode(classes.join('\n'));
        },
        
        _getCssText: function(className, styles) {
            return '.' + className + '{' + styles + '}';
        },
        
        _setStyleNode: function(text) {
            var node = document.createElement('style');
            node.type = 'text/css';
            if (node.styleSheet) {
                node.styleSheet.cssText = text;
            } else {
                node.appendChild(document.createTextNode(text));
            }

            document.head.appendChild(node);
        }
    };

    if (document.body) {
        setCssRules();
    } else {
        sGis.Event.add(document, 'DOMContentLoaded', setCssRules);
    }

    function setCssRules() {
        /**
         * Contains prefixed css properties for transition, transform and transformOrigin
         * @type {{transition: {func: string, rule: string}, transform: {func: string, rule: string}, transformOrigin: {func: string, rule: string}}}
         */
        utils.css = {
            transition: document.body.style.transition !== undefined ? {func: 'transition', rule: 'transition'} :
                document.body.style.webkitTransition !== undefined ? {func: 'webkitTransition', rule: '-webkit-transition'} :
                    document.body.style.msTransition !== undefined ? {func: 'msTransition', rule: '-ms-transition'} :
                        document.body.style.OTransition !== undefined ? {func: 'OTransition', rule: '-o-transition'} :
                            null,
            transform:  document.body.style.transform !== undefined ? {func: 'transform', rule: 'transform'} :
                document.body.style.webkitTransform !== undefined ? {func: 'webkitTransform', rule: '-webkit-transform'} :
                    document.body.style.OTransform !== undefined ? {func: 'OTransform', rule: '-o-transform'} :
                        document.body.style.msTransform !== undefined ? {func: 'msTransform', rule: '-ms-ransform'} : null,
            transformOrigin: document.body.style.transformOrigin !== undefined ? {func: 'transformOrigin', rule: 'transform-origin'} :
                document.body.style.webkitTransformOrigin !== undefined ? {func: 'webkitTransformOrigin', rule: '-webkit-transform-origin'} :
                    document.body.style.OTransformOrigin !== undefined ? {func: 'OTransformOrigin', rule: '-o-transform-origin'} :
                        document.body.style.msTransformOrigin !== undefined ? {func: 'msTransformOrigin', rule: '-ms-ransform-origin'} : null
        };
    }



    /*
     * Copyright (c) 2010 Nick Galbreath
     * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
     */
    var base64 = {};
    base64.PADCHAR = '=';
    base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    base64.makeDOMException = function() {
        // sadly in FF,Safari,Chrome you can't make a DOMException
        var e, tmp;

        try {
            return new DOMException(DOMException.INVALID_CHARACTER_ERR);
        } catch (tmp) {
            // not available, just passback a duck-typed equiv
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
            var ex = new Error("DOM Exception 5");

            // ex.number and ex.description is IE-specific.
            ex.code = ex.number = 5;
            ex.name = ex.description = "INVALID_CHARACTER_ERR";

            // Safari/Chrome output format
            ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
            return ex;
        }
    };

    base64.getbyte64 = function(s,i) {
        // This is oddly fast, except on Chrome/V8.
        //  Minimal or no improvement in performance by using a
        //   object with properties mapping chars to value (eg. 'A': 0)
        var idx = base64.ALPHA.indexOf(s.charAt(i));
        if (idx === -1) {
            throw base64.makeDOMException();
        }
        return idx;
    };

    base64.decode = function(s) {
        // convert to string
        s = '' + s;
        var getbyte64 = base64.getbyte64;
        var pads, i, b10;
        var imax = s.length;
        if (imax === 0) {
            return s;
        }

        if (imax % 4 !== 0) {
            throw base64.makeDOMException();
        }

        pads = 0;
        if (s.charAt(imax - 1) === base64.PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === base64.PADCHAR) {
                pads = 2;
            }
            // either way, we want to ignore this last block
            imax -= 4;
        }

        var x = [];
        for (i = 0; i < imax; i += 4) {
            b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
                (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
        }

        switch (pads) {
            case 1:
                b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
                break;
            case 2:
                b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
        }
        return x.join('');
    };

    base64.getbyte = function(s,i) {
        var x = s.charCodeAt(i);
        if (x > 255) {
            throw base64.makeDOMException();
        }
        return x;
    };

    base64.encode = function(s) {
        if (arguments.length !== 1) {
            throw new SyntaxError("Not enough arguments");
        }
        var padchar = base64.PADCHAR;
        var alpha   = base64.ALPHA;
        var getbyte = base64.getbyte;

        var i, b10;
        var x = [];

        // convert to string
        s = '' + s;

        var imax = s.length - s.length % 3;

        if (s.length === 0) {
            return s;
        }
        for (i = 0; i < imax; i += 3) {
            b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
            x.push(alpha.charAt(b10 >> 18));
            x.push(alpha.charAt((b10 >> 12) & 0x3F));
            x.push(alpha.charAt((b10 >> 6) & 0x3f));
            x.push(alpha.charAt(b10 & 0x3f));
        }
        switch (s.length - imax) {
            case 1:
                b10 = getbyte(s,i) << 16;
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                    padchar + padchar);
                break;
            case 2:
                b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                    alpha.charAt((b10 >> 6) & 0x3f) + padchar);
                break;
        }
        return x.join('');
    };

    if (!window.btoa) window.btoa = base64.encode;
    if (!window.atob) window.atob = base64.decode;


    // TODO: remove these functions after change to ES6 classes

    if (!Object.defineProperty) {
        Object.defineProperty = function(obj, key, desc) {
            if (desc.value) {
                obj[key] = desc.value;
            } else {
                if (desc.get) {
                    obj.__defineGetter__(key, desc.get);
                }
                if (desc.set) {
                    obj.__defineSetter__(key, desc.set);
                }
            }
        };
    }

    if (!Object.defineProperties) {
        Object.defineProperties = function(obj, desc) {
            for (var key in desc) {
                Object.defineProperty(obj, key, desc[key]);
            }
        };
    }

    return utils;
    
});
