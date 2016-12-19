sGis.module('utils', [
    'event'
], function(ev) {
    'use strict';

    /**
     * @namespace
     * @alias sGis.utils
     */
    var utils = {
        /**
         * Throws an exception with given message. If you need to handle all errors in one place, redefined this method to your needed handler.
         * @param message
         */
        error: function(message) {
            throw new Error(message);
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
            return target;
        },

        /**
         * Returns true if a and b differ less then one millionth of a, otherwise false
         * @param {Number} a
         * @param {Number} b
         * @returns {boolean}
         */
        softEquals: function(a, b) {
            return (Math.abs(a - b) < 0.000001 * Math.max(a, 1));
        },

        /**
         * Returns true is obj is Array, otherwise false
         * @param {Any} obj
         * @returns {boolean}
         */
        isArray: function(obj) {
            return Array.isArray(obj);
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
            return utils.browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement
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
         * Returns a random GUID
         * @returns {string}
         */
        getGuid: function() {
            //noinspection SpellCheckingInspection
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
        },

        browser: (function() {
            let ua= navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem= ua.match(/\bOPR\/(\d+)/);
                if (tem != null) return 'Opera ' + tem[1];
            }
            M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })()
    };

    utils.isIE = utils.browser.search('IE') !== -1;
    utils.isTouch = 'ontouchstart' in document.documentElement;

    if (document.body) {
        setCssRules();
    } else {
        ev.add(document, 'DOMContentLoaded', setCssRules);
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
                        document.body.style.msTransform !== undefined ? {func: 'msTransform', rule: '-ms-transform'} : null,
            transformOrigin: document.body.style.transformOrigin !== undefined ? {func: 'transformOrigin', rule: 'transform-origin'} :
                document.body.style.webkitTransformOrigin !== undefined ? {func: 'webkitTransformOrigin', rule: '-webkit-transform-origin'} :
                    document.body.style.OTransformOrigin !== undefined ? {func: 'OTransformOrigin', rule: '-o-transform-origin'} :
                        document.body.style.msTransformOrigin !== undefined ? {func: 'msTransformOrigin', rule: '-ms-transform-origin'} : null
        };
    }

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
