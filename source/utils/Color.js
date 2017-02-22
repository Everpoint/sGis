sGis.module('utils.Color', [
    'utils'
], (utils) => {

    'use strict';

    /**
     * Utility class for working with different representations of colors in browsers
     * @alias sGis.utils.Color
     */
    class Color {
        /**
         * @param {String} string - any valid css color string
         */
        constructor(string) {
            this._original = string;

            if (!utils.isString(string)) string = string.toString();

            this._color = string && string.trim() || 'transparent';
            this._setChannels();
        }

        _setChannels() {
            var format = this.format;
            if (format && formats[format]) {
                this._channels = formats[format](this._color);
            } else {
                this._channels = {};
            }
        }

        /**
         * Returns the color as a string in the requested format
         * @param {String} [format="rgba"] - target format. Available values: "hex" - #AARRGGBB, "rgb" - "rgb(r, g, b)", "rgba" - "rgba(r, g, b, a)"
         * @returns {string}
         */
        toString(format) {
            if (format === 'hex') {
                return '#' + decToHex(this.a) + decToHex(this.r) + decToHex(this.g) + decToHex(this.b);
            } else if (format === 'rgb') {
                return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
            } else {
                return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + (this.a / 255).toFixed(2).replace(/\.*0+$/, '') + ')';
            }
        }

        /**
         * Returns the string given to the constructor of the instance
         * @type {String}
         */
        get original() { return this._original; }

        /**
         * Returns true if the instance represents a valid color, i.e. that after parsing of the string given to the constructor,
         * the format is recognized and values of all channels are resolved to valid numbers.
         * @returns {Boolean}
         */
        get isValid() { return !!(utils.isNumber(this._channels.a) && utils.isNumber(this._channels.r) && utils.isNumber(this._channels.g) && utils.isNumber(this._channels.b)); }

        /**
         * Returns the format of the input color sting. Possible values: hex3, hex6, hex4, hex8, rgb, rgba, name.
         * (name is the named css color values like "white")
         * @returns {String}
         */
        get format() {
            if (this._color.substr(0, 1) === '#' && this._color.search(/[^#0-9a-fA-F]/) === -1) {
                if (this._color.length === 4) {
                    return 'hex3';
                } else if (this._color.length === 7) {
                    return 'hex6';
                } else if (this._color.length === 5) {
                    return 'hex4';
                } else if (this._color.length === 9) {
                    return 'hex8';
                }
            } else if (this._color.substr(0, 4) === 'rgb(') {
                return 'rgb';
            } else if (this._color.substr(0, 5) === 'rgba(') {
                return 'rgba';
            } else if (this._color in Color.names) {
                return 'name';
            }
        }

        /**
         * Returns red channel value as integer from 0 to 255.
         * @type {Number}
         */
        get r() { return this._channels.r; }
        set r(/** Number */ v) { this._channels.r = v; }

        /**
         * Returns green channel value as integer from 0 to 255.
         * @type {Number}
         */
        get g() { return this._channels.g; }
        set g(/** Number */ v) { this._channels.g = v; }

        /**
         * Returns blue channel value as integer from 0 to 255.
         * @type {Number}
         */
        get b() { return this._channels.b; }
        set b(/** Number */ v) { this._channels.b = v; }

        /**
         * Returns opacity channel value as integer from 0 to 255.
         * @type {Number}
         */
        get a() { return this._channels.a; }
        set a(/** Number */ v) { this._channels.a = v; }

        /**
         * Returns values of the channels as integers from 0 to 255. Format is { r: r, g: g, b: b, a: a }.
         * @type {Object}
         */
        get channels() { return Object.assign({}, this._channels); }
    }

    function decToHex(dec) {
        var hex = Math.floor(dec).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    var formats = {
        hex3: function(/** String */ string) {
            return {
                r: parseInt(string.substr(1,1) + string.substr(1,1), 16),
                g: parseInt(string.substr(2,1) + string.substr(2,1), 16),
                b: parseInt(string.substr(3,1) + string.substr(3,1), 16),
                a: 255
            }
        },
        hex6: function(/** String */ string) {
            return {
                r: parseInt(string.substr(1,2), 16),
                g: parseInt(string.substr(3,2), 16),
                b: parseInt(string.substr(5,2), 16),
                a: 255
            }
        },
        hex4: function(/** String */ string) {
            return {
                r: parseInt(string.substr(2,1) + string.substr(2,1), 16),
                g: parseInt(string.substr(3,1) + string.substr(3,1), 16),
                b: parseInt(string.substr(4,1) + string.substr(4,1), 16),
                a: parseInt(string.substr(1,1) + string.substr(1,1), 16)
            }
        },
        hex8: function(/** String */ string) {
            return {
                r: parseInt(string.substr(3,2), 16),
                g: parseInt(string.substr(5,2), 16),
                b: parseInt(string.substr(7,2), 16),
                a:  parseInt(string.substr(1,2), 16)
            }
        },
        rgb: function(/** String */ string) {
            var percents = string.match(/%/g);
            if (!percents || percents.length === 3) {
                var channels = string.substring(string.search(/\(/) + 1, string.length - 1).split(',');
                for (var i = 0; i < 3; i++) {
                    if (channels[i]) {
                        channels[i] = channels[i].trim();
                        var percent = channels[i].match(/[\.\d\-]+%/);
                        if (percent) {
                            var points = channels[i].match(/\./g);
                            channels[i] = channels[i].search(/[^\d\.\-%]/) === -1 && (!points || points.length < 2) ? parseFloat(percent[0]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 100) {
                                channels[i] = 100;
                            }
                            channels[i] = Math.floor(channels[i] * 255  / 100);
                        } else {
                            channels[i] = channels[i] && (channels[i].match(/[^ \-0-9]/) === null) && channels[i].match(/[0-9]+/g).length === 1 ? parseInt(channels[i]) : NaN;
                            if (channels[i] < 0) {
                                channels[i] = 0;
                            } else if (channels[i] > 255) {
                                channels[i] = 255;
                            }
                        }
                    }
                }
            } else {
                channels = [];
            }
            return {
                r: channels[0],
                g: channels[1],
                b: channels[2],
                a: 255
            };
        },

        rgba: function(/** String */ string) {
            var channels = formats.rgb(string);
            channels.a = undefined;

            var match = string.match(/[\-0-9\.]+/g);
            if (match && match[3]) {
                var points = match[3].match(/\./g);
                if (!points || points.length === 1) {
                    channels.a = parseFloat(match[3]);
                    if (channels.a < 0) {
                        channels.a = 0;
                    } else if (channels.a > 1) {
                        channels.a = 1;
                    }
                    channels.a = Math.round(channels.a * 255);
                }
            }
            return channels;
        },
        name: function(/** String */ string) {
            var color = new Color('#' + Color.names[string]);
            return color.channels;
        }
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    //noinspection SpellCheckingInspection
    Color.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        rebeccapurple: "663399",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32",
        transparent: '0000'
    };

    return Color;

});