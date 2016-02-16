'use strict';

(function() {

    var MAX_BUFFERS = 5,
        MAX_BUFFER_SIZE = 100;

    window.utils = {
        objectBuffers: [],
        getObjectBuffer: function(bufferType) {
            if (utils.objectBuffers.length === 0) {
                var returnBuffer = new utils.ObjectBuffer(bufferType);
            } else {
                for (var i in utils.objectBuffers) {
                    if (utils.objectBuffers[i].type === bufferType) {
                        var returnBuffer = utils.objectBuffers[i];
                        utils.objectBuffers = utils.objectBuffers.slice(0, i).concat(utils.objectBuffers.slice(i+1));
                        return returnBuffer;
                    }
                }
                var returnBuffer = utils.objectBuffers.shift();
            }
            returnBuffer._free = false;
            return returnBuffer;
        },

        freeObjectBuffer: function(buffer) {
            utils.objectBuffers.push(buffer);
            buffer._free = true;
            if (utils.objectBuffer.length > MAX_BUFFERS) {
                utils.objectBuffer.shift();
            }
        }
    };

    utils.ObjectBuffer = function(bufferType) {
        Object.defineProperty(this, 'type', {configurable: false,
            enumerable: true,
            writable: false,
            value: bufferType});
        this._objects = [];
    };

    utils.ObjectBuffer.prototype.getElement = function() {
        if (this._objects.length > 0) {
            return this._objects.pop();
        } else {
            return getNewElement(this.type);
        }
    };

    utils.ObjectBuffer.prototype.putElement = function(elem) {
        if (this.type === getElemType(elem)) {
            this._objects.push(elem);
            if (!this._free && this._objects.length > MAX_BUFFER_SIZE) {
                this._objects.slice(this._objects.length - MAX_BUFFER_SIZE);
            }
        } else {
            error('The buffer of type ' + this.type + ' cannot contain elemenents of type ' + getElemType(elem));
        }
    };

    function getElemType(elem) {
        if (!(elem instanceof Object)) {
            error('Object buffer can contain only objects, but ' + typeof elem + ' is recieved');
        } else if (elem.tagName) {
            return elem.tagName.toLowerCase();
        }
    }

    function getNewElement(type) {
        return document.createElement(type);
    }

    utils.normolize = function(number) {
        return Math.abs(number - Math.round(number)) < 0.001 ? Math.round(number) : number;
    };

    Event.add(document, 'DOMContentLoaded', setCssRules);

    function setCssRules() {
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

    utils.requestAnimationFrame = function(callback, element) {
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        if (requestAnimationFrame) {
            requestAnimationFrame(callback, element);
        } else {
            setTimeout(function() {
                callback();
            }, 1000/30);
        }
    };

    utils.initializeOptions = function(object, options) {
        for (var key in options) {
            if (object['_'+key] !== undefined && options[key] !== undefined) {
                object['_'+key] = options[key];
            }
        }
    };


    var idCounter = 1;
    utils.getNewId = function() {
        return idCounter++;
    };

    utils.mixin = function(target, source) {
        for (var key in source) {
            if (!target[key]) target[key] = source[key];
        }
    };

    utils.mix = function(target, source) {   //todo: unite with merge
        var obj = utils.copyObject(target);
        utils.mixin(obj, source);
        return obj;
    };

    utils.softEquals = function(a, b) {
        return (Math.abs(a - b) < 0.000001 * a);
    };

    utils.error = function error(message) {
        if (sGis.onerror) {
            sGis.onerror(message);
        } else {
            throw new Error(message);
        }
    };

    utils.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    utils.isNumber = function(n) {
        return typeof n === 'number' && isFinite(n);
    };

    utils.isInteger = function(n) {
        return utils.isNumber(n) && Math.round(n) === n;
    };

    utils.isString = function(s) {
        return typeof s === 'string';
    };

    utils.isFunction = function(f) {
        return f instanceof Function;
    };

    utils.isNode = function(o) {
        return !!o.nodeType;
    };

    utils.isImage = function(o) {
        return sGis.browser.indexOf('Opera') !== 0 && o instanceof Image || o instanceof HTMLImageElement
    };

    utils.validateString = function(s) {
        if (!utils.isString(s)) utils.error('String is expected but got ' + s + ' instead');
    };

    utils.validateValue = function(v, allowed) {
        if (allowed.indexOf(v) === -1) utils.error('Invalid value of the argument: ' + v);
    };

    utils.validateNumber = function(n) {
        if (!utils.isNumber(n)) utils.error('Number is expected but got ' + n + ' instead');
    };

    utils.validatePositiveNumber = function(n) {
        if (!utils.isNumber(n) || n <= 0) utils.error('Positive number is expected but got ' + n + ' instead');
    };

    utils.validateBool = function(b) {
        if (b !== true && b !== false) utils.error('Boolean is expected but got ' + b + ' instead');
    };

    utils.max = function(arr) {
        return Math.max.apply(null, arr);
    };

    utils.min = function(arr) {
        return Math.min.apply(null, arr);
    };


    utils.extendCoordinates = function(coord, center) {
        var extended = [];
        for (var i = 0, l = coord.length; i < l; i++) {
            extended[i] = [coord[i][0] - center[0], coord[i][1] - center[1], 1];
        }
        return extended;
    };

    utils.collapseCoordinates = function(extended, center) {
        var coord = [];
        for (var i = 0, l = extended.length; i < l; i++) {
            coord[i] = [extended[i][0] + center[0], extended[i][1] + center[1]];
        }
        return coord;
    };


    utils.simplify = function(points, tolerance) {
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
    };

    utils.getGuid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
    };

    utils.init = function(object, options, setUndefined) {
        for (var i in options) {
            if (setUndefined || object[i] !== undefined && options[i] !== undefined) {
                try {
                    object[i] = options[i];
                } catch (e) {
                    if (!(e instanceof TypeError)) utils.error(e);
                }
            }
        }
    };

    utils.parseXmlJsonNode = function(node) {
        var string = '';
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            string += node.childNodes[i].nodeValue;
        }
        return utils.parseJSON(string);
    };

    utils.parseJSON = function(string) {
        try {
            var json = JSON.parse(string);
        } catch (e) {
            var changed = string.replace(/\\"/g, '\\"').replace(/NaN/g, '"NaN"').replace(/:-Infinity/g, ':"-Infinity"').replace(/:Infinity/g, ':"Infinity"');
            json = JSON.parse(changed);
        }
        return json;
    };

    utils.html = function(element, html) {
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

    utils.merge = function(arr1, arr2) {
        var result = [].concat(arr1);
        for (var i = 0; i < arr2.length; i++) {
            if (result.indexOf(arr2[i]) === -1) result.push(arr2[i]);
        }
        return result;
    };

    utils.arrayIntersect = function(arr1, arr2) {
        for (var i = 0; i < arr1.length; i++) {
            if (arr2.indexOf(arr1[i]) !== -1) {
                return true;
            }
        }
        return false;
    };

    utils.ajax = function(properties) {
        var requestType = properties.type ? properties.type : 'GET';
        if (properties.cache === false) properties.url += '&ts=' + new Date().getTime();
        if (sGis.browser === 'MSIE 9') {
            var xdr = new XDomainRequest();
            xdr.onload = function() {
                if (properties.success) properties.success(xdr.responseText);
            };
            xdr.onerror = function() {if (properties.error) properties.error(xdr.responseText);};
            xdr.onprogress = function() {};
            xdr.timeout = 30000;
            xdr.open(requestType, properties.url);
            xdr.send(properties.data ? properties.data : null);
        } else {
            var XMLHttpRequest = window.XMLHttpRequest || window.ActiveXObject && function() {return new ActiveXObject('Msxml2.XMLHTTP');},
                xhr = new XMLHttpRequest();

            xhr.open(requestType, properties.url);

            if (properties.contentType) xhr.setRequestHeader('Content-Type', properties.contentType);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (properties.success) properties.success(xhr.responseText, xhr.statusText);
                    } else {
                        if (properties.error) properties.error(xhr.responseText, xhr.statusText);
                    }
                }
            };
            xhr.timeout = 30000;
            xhr.send(properties.data ? properties.data : null);

            return xhr;
        }
    };

    utils.copyArray = function(arr) {
        var copy = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            if (utils.isArray(arr[i])) {
                copy[i] = utils.copyArray(arr[i]);
            } else {
                copy[i] = arr[i];
            }
        }
        return copy;
    };

    //TODO: this will not copy the inner arrays properly
    utils.copyObject = function(obj) {
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
    };

    /*
     * Copyright (c) 2010 Nick Galbreath
     * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
     *
     * Permission is hereby granted, free of charge, to any person
     * obtaining a copy of this software and associated documentation
     * files (the "Software"), to deal in the Software without
     * restriction, including without limitation the rights to use,
     * copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following
     * conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     * OTHER DEALINGS IN THE SOFTWARE.
     */

    /* base64 encode/decode compatible with window.btoa/atob
     *
     * window.atob/btoa is a Firefox extension to convert binary data (the "b")
     * to base64 (ascii, the "a").
     *
     * It is also found in Safari and Chrome.  It is not available in IE.
     */
    /*
     * The original spec's for atob/btoa are a bit lacking
     * https://developer.mozilla.org/en/DOM/window.atob
     * https://developer.mozilla.org/en/DOM/window.btoa
     *
     * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
     * If any character is not [0,255], then an DOMException(5) is thrown.
     *
     * window.atob and base64.decode take a base64-encoded string
     * If the input length is not a multiple of 4, or contains invalid characters
     *   then an DOMException(5) is thrown.
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

    /*
     * MATH
     */


    utils.multiplyMatrix = function(a, b) {
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

    utils.message = function(mes) {
        if (window.console) {
            console.log(mes);
        }
    };

    utils.getUnique = function(arr) {
        var result = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            if (result.indexOf(arr[i]) === -1) result.push(arr[i]);
        }
        return result;
    };

})();