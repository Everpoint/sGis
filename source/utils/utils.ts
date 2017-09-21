import {listenDomEvent} from './domEvent';

/**
 * Throws an exception with given message. If you need to handle all errors in one place, redefined this method to your needed handler.
 * @param message
 */
export const error = function(message) {
    throw new Error(message);
};

export const warn = function(exeption) {
    // eslint-disable-next-line no-console
    if (typeof console === 'object') console.warn(exeption);
};

/**
 * Sets the values of the properties in 'options' to the 'object'.
 * Calls utils.error() in case of exception. It only sets the properties that already exist in the object if not setUndefined parameter is given
 * @param {Object} object
 * @param {Object} options
 * @param {Boolean} [setUndefined]
 */
export const init = function(object, options, setUndefined) {
    if (!options) return;

    var keys = Object.keys(options);
    keys.forEach(function(key) {
        if ((setUndefined || object[key] !== undefined) && options[key] !== undefined) {
            try {
                object[key] = options[key];
            } catch (e) {
                if (!(e instanceof TypeError)) error(e);
            }
        }
    });
};

/**
 * Calls window.requestAnimationFrame or its friends if available or uses timeout to simulate their behavior
 * @param {Function} callback - callback function
 * @param {HTMLElement} [element] - the target of rendering
 */
export const requestAnimationFrame = function(callback, element) {
    var requestAnimationFrame = window.requestAnimationFrame || (<any>window).mozRequestAnimationFrame || window.webkitRequestAnimationFrame || (<any>window).msRequestAnimationFrame;

    if (requestAnimationFrame) {
        requestAnimationFrame(callback, element);
    } else {
        setTimeout(function() {
            callback();
        }, 1000/30);
    }
};

/**
 * Debounce function calls
 * @param {Function} func - callback function
 * @param {number} ms - interval
 * @return {Function}
 */
export const debounce = function(func, ms) {

    var state = null;

    var COOLDOWN = 1;

    return function () {
        if (state) return;

        func.apply(this, arguments);

        state = COOLDOWN;

        setTimeout(function () {
            state = null
        }, ms);
    }
};

/**
 * Throttle function calls
 * @param {Function} func - callback function
 * @param {number} ms - interval
 * @return {Function}
 */
export const throttle = function(func, ms) {

    var isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper () {

        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(function () {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
};

/**
 * Copies the own properties of source to target, ignoring the properties already existing in target. Only one-level copy.
 * @param {Object} target
 * @param {Object} source
 * @param {Boolean} [ignoreUndefined=false] - if set to true, properties in the source that have the value of undefined will be ignored
 */
export const extend = function(target, source, ignoreUndefined = false) {
    let keys = Object.keys(source);
    keys.forEach(function(key) {
        if (ignoreUndefined && source[key] === undefined) return;
        target[key] = source[key];
    });
    return target;
};

export const mixin = function(target, source) {
    Object.getOwnPropertyNames(source).forEach(key => {
        if (key === 'constructor') return;
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
};

/**
 * Returns true if a and b differ less then one millionth of a, otherwise false
 * @param {Number} a
 * @param {Number} b
 * @returns {boolean}
 */
export const softEquals = function(a, b) {
    return (Math.abs(a - b) < 0.000001 * Math.max(a, 1));
};

/**
 * Returns true is obj is Array, otherwise false
 * @param {Any} obj
 * @returns {boolean}
 */
export const isArray = function(obj) {
    return Array.isArray(obj);
};

/**
 * Returns true if n is a finite number, otherwise false
 * @param {Any} n
 * @returns {boolean}
 */
export const isNumber = function(n) {
    return typeof n === 'number' && isFinite(n);
};

/**
 * Returns true if n is an integer number, otherwise false
 * @param {Any} n
 * @returns {boolean}
 */
export const isInteger = function(n) {
    return isNumber(n) && Math.round(n) === n;
};

/**
 * Returns true if s is a string, otherwise false
 * @param {Any} s
 * @returns {boolean}
 */
export const isString = function(s) {
    return typeof s === 'string';
};

/**
 * Returns true if f is a function, otherwise false
 * @param {Any} f
 * @returns {boolean}
 */
export const isFunction = function(f) {
    return typeof f === 'function';
};

/**
 * Returns true if o is a HTML node
 * @param {Any} o
 * @returns {boolean}
 */
export const isNode = function(o) {
    return !!o.nodeType;
};

/**
 * Returns true if o is a HTML img element
 * @param {Any} o
 * @returns {boolean}
 */
export const isImage = function(o) {
    return browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement
};

/**
 * Throws an exception if s is not a string
 * @param {Any} s
 */
export const validateString = function(s) {
    if (!isString(s)) error('String is expected but got ' + s + ' instead');
};

/**
 * Throws an exception if v is not one of the allowed values
 * @param {Any} v
 * @param {Array} allowed
 */
export const validateValue = function(v, allowed) {
    if (allowed.indexOf(v) === -1) error('Invalid value of the argument: ' + v);
};

/**
 * Throws an exception if n is not a number
 * @param {Any} n
 */
export const validateNumber = function(n) {
    if (!isNumber(n)) error('Number is expected but got ' + n + ' instead');
};

/**
 * Throws an exception if n is not a positive number
 * @param n
 */
export const validatePositiveNumber = function(n) {
    if (!isNumber(n) || n <= 0) error('Positive number is expected but got ' + n + ' instead');
};

/**
 * Throws an exception if b is not a boolean value
 * @param b
 */
export const validateBool = function(b) {
    if (b !== true && b !== false) error('Boolean is expected but got ' + b + ' instead');
};

/**
 * Returns a random GUID
 * @returns {string}
 */
export const getGuid = function() {
    //noinspection SpellCheckingInspection
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
};

/**
 * Sets the innerHTML property to element. It will escape the issue with table inserting as innerHTML.
 * @param {HTMLElement} element
 * @param {String} html
 */
export const html = function(element, html) {
    try {
        element.innerHTML = html;
    } catch(e) {
        var tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        for (var i = tempElement.childNodes.length - 1; i >=0; i--) {
            element.insertBefore(tempElement.childNodes[i], tempElement.childNodes[i+1]);
        }
    }
};

/**
 * Returns true if at least one element of arr1 also exists in arr2
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {boolean}
 * TODO: check if it should work backwards also
 */
export const arrayIntersect = function(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * Makes a deep copy af the array
 * @param {Array} arr
 * @returns {Array}
 */
export const copyArray = function(arr) {
    var copy = [];
    for (var i = 0, l = arr.length; i < l; i++) {
        if (isArray(arr[i])) {
            copy[i] = copyArray(arr[i]);
        } else {
            copy[i] = arr[i];
        }
    }
    return copy;
};

/**
 * Makes a deep copy of an object
 * @param {Object} obj
 * @returns {*}
 * TODO: this will not copy the inner arrays properly
 */
export const copyObject = function(obj) {
    if (!(obj instanceof Function) && obj instanceof Object) {
        var copy = isArray(obj) ? [] : {};
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            copy[keys[i]] = copyObject(obj[keys[i]]);
        }
        return copy;
    } else {
        return obj;
    }
};

export const setCssClasses = function(desc) {
    var classes = Object.keys(desc).map(key => {return getCssText(key, desc[key]);});
    setStyleNode(classes.join('\n'));
};

const getCssText = function(className, styles) {
    return '.' + className + '{' + styles + '}';
};

const setStyleNode = function(text) {
    var node = document.createElement('style');
    node.type = 'text/css';
    if ((<any>node).styleSheet) {
        (<any>node).styleSheet.cssText = text;
    } else {
        node.appendChild(document.createTextNode(text));
    }

    document.head.appendChild(node);
};

export const browser = (function() {
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
})();

export const createNode = function(nodeName, cssClass, properties = {}, children = []) {
    let node = document.createElement(nodeName);
    node.className = cssClass;
    extend(node, properties);
    children.forEach(child => node.appendChild(child));
    return node;
};

export const isIE = browser.search('IE') !== -1;
export const isTouch = 'ontouchstart' in document.documentElement;

if (document.body) {
    setCssRules();
} else {
    listenDomEvent(document, 'DOMContentLoaded', setCssRules);
}

function setCssRules() {
    css.transition = document.body.style.transition !== undefined ? {func: 'transition', rule: 'transition'} :
        document.body.style.webkitTransition !== undefined ? {
                func: 'webkitTransition',
                rule: '-webkit-transition'
            } :
            (<any>document.body.style).msTransition !== undefined ? {func: 'msTransition', rule: '-ms-transition'} :
                (<any>document.body.style).OTransition !== undefined ? {
                        func: 'OTransition',
                        rule: '-o-transition'
                    } :
                    null;
    css.transform = document.body.style.transform !== undefined ? {func: 'transform', rule: 'transform'} :
        document.body.style.webkitTransform !== undefined ? {func: 'webkitTransform', rule: '-webkit-transform'} :
            (<any>document.body.style).OTransform !== undefined ? {func: 'OTransform', rule: '-o-transform'} :
                (<any>document.body.style).msTransform !== undefined ? {
                    func: 'msTransform',
                    rule: '-ms-transform'
                } : null;
    css.transformOrigin = document.body.style.transformOrigin !== undefined ? {
            func: 'transformOrigin',
            rule: 'transform-origin'
        } :
        document.body.style.webkitTransformOrigin !== undefined ? {
                func: 'webkitTransformOrigin',
                rule: '-webkit-transform-origin'
            } :
            (<any>document.body.style).OTransformOrigin !== undefined ? {
                    func: 'OTransformOrigin',
                    rule: '-o-transform-origin'
                } :
                (<any>document.body.style).msTransformOrigin !== undefined ? {
                    func: 'msTransformOrigin',
                    rule: '-ms-transform-origin'
                } : null;
}

/**
 * Contains prefixed css properties for transition, transform and transformOrigin
 * @type {{transition: {func: string, rule: string}, transform: {func: string, rule: string}, transformOrigin: {func: string, rule: string}}}
 */
export const css : any = {};
