'use strict';

(function() {

    /**
     * @namespace
     */
    sGis.utils = {

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
         * Sets the values of the properties in 'options' to the 'object'. Calls sGis.utils.error() in case of exception
         * @param {Object} object
         * @param {Object} options
         */
        init: function(object, options) {
            for (var i in options) {
                if (options[i] !== undefined) {
                    try {
                        object[i] = options[i];
                    } catch (e) {
                        if (!(e instanceof TypeError)) sGis.utils.error(e);
                    }
                }
            }
        },

        /**
         * Return offset (in pixels) of the cursor relative to the target node
         * @param {HTMLElement} target
         * @param event - mouse event object
         * @returns {{x: number, y: number}}
         */
        getMouseOffset: function(target, event) {
            var docPos = getPosition(target);
            return {x: event.pageX - docPos.x, y: event.pageY - docPos.y};
        },

        /**
         * Returns position of element relative to the left top window corner
         * @param {HTMLElement} element
         * @returns {{x: number, y: number}} - position of element relative to the left top window corner
         */
        getPosition: function(element) {
            var clientRect = element.getBoundingClientRect(),
                x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
                y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            return {x: clientRect.left + x, y: clientRect.top + y};
        },

        imageToDataUrl: function(image) {
            var width = image.getAttribute('width');
            var height = image.getAttribute('height');

            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0,0);

            return canvas.toDataURL();
        }
    };

})();