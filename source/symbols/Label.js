sGis.module('symbol.label', [
    'utils',
    'math',
    'render.HtmlElement'
], function(utils, math, HtmlElement) {
    'use strict';

    var defaults = {
        /**
         * Css class to be added to the label node
         * @type String
         * @memberof sGis.symbol.label.Label
         * @instance
         * @default "sGis-symbol-label-center-top"
         */
        css: 'sGis-symbol-label-center-top'
    };

    /**
     * @implements sGis.ISymbol
     * @alias sGis.symbol.label.Label
     */
    class Label {
        /**
         * @constructor
         * @param {Object} options - key-value list of the properties to be assigned to the instance
         */
        constructor(options) {
            utils.init(this, options);
        }

        /**
         * @implementation
         */
        renderFunction(feature, resolution, crs) {
            if (!feature._cache || !math.softEquals(resolution, feature._cache[0].resolution)) {
                var html = '<div' +  (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
                var point = feature.point.projectTo(crs);
                var position = [point.x / resolution, -point.y / resolution];
    
                feature._cache = [new HtmlElement(html, position)];
            }
    
            return feature._cache;
        }
    }
    
    utils.extend(Label.prototype, defaults);

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
