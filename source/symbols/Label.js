sGis.module('symbol.label', [
    'utils',
    'math',
    'render.HtmlElement'
], function(utils, math, HtmlElement) {

    'use strict';

    /**
     * @namespace sGis.symbol.label
     */

    /**
     * @implements sGis.ISymbol
     * @alias sGis.symbol.label.Label
     */
    class Label {
        /**
         * @constructor
         * @param {Object} [properties] - key-value list of the properties to be assigned to the instance
         */
        constructor(properties) {
            utils.init(this, properties);
            this._lastRendered = {};
        }
        
        renderFunction(feature, resolution, crs) {
            if (this._lastRendered.feature === feature && math.softEquals(resolution, this._lastRendered.resolution ) && this._lastRendered.crs === crs){
                return this._lastRendered.renders;
            }
            var html = '<div' +  (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
            var point = feature.point.projectTo(crs);
            var position = [point.x / resolution, -point.y / resolution];

            this._lastRendered = {
                feature: feature,
                resolution: resolution,
                crs: crs,
                renders: [new HtmlElement(html, position)]
            };

            return this._lastRendered.renders;
        }
    }

    /**
     * Css class to be added to the label node. sGis library provides 9 predefined classes that can be used for labels:
     * sGis-symbol-label-left-top, sGis-symbol-label-left-middle, sGis-symbol-label-left-bottom,
     * sGis-symbol-label-center-top, sGis-symbol-label-center-middle, sGis-symbol-label-center-bottom,
     * sGis-symbol-label-right-top, sGis-symbol-label-right-middle, sGis-symbol-label-right-bottom
     * @member {String} css
     * @memberof sGis.symbol.label.Label
     * @instance
     * @default "sGis-symbol-label-center-top"
     */
    Label.prototype.css = 'sGis-symbol-label-center-top';
    
    utils.setCssClasses({
        'sGis-symbol-label-left-top': 'transform:translate(-120%,-120%);',
        'sGis-symbol-label-left-middle': 'transform:translate(-120%,-50%);',
        'sGis-symbol-label-left-bottom': 'transform:translate(-120%,20%);',
        'sGis-symbol-label-center-top': 'transform:translate(-50%,-120%);',
        'sGis-symbol-label-center-middle': 'transform:translate(-50%,-50%);',
        'sGis-symbol-label-center-bottom': 'transform:translate(-50%,20%);',
        'sGis-symbol-label-right-top': 'transform:translate(20%,-120%);',
        'sGis-symbol-label-right-middle': 'transform:translate(20%,-50%);',
        'sGis-symbol-label-right-bottom': 'transform:translate(20%,20%);'
    });

    return {
        Label: Label
    };

});