sGis.module('symbol.label.Label', [
    'Symbol',
    'render.HtmlElement'
], function(Symbol, HtmlElement) {
    
    'use strict';

    /**
     * Symbol of simple html text label.
     * @alias sGis.symbol.label.Label
     * @extends sGis.Symbol
     */
    class Label extends Symbol {
        /**
         * @constructor
         * @param {Object} properties - key-value list of the properties to be assigned to the instance.
         */
        constructor(properties) {
            super(properties);
        }

        renderFunction(/** sGis.feature.Label */ feature, resolution, crs) {
            var html = '<div' +  (this.css ? ' class="' + this.css + '"' : '') + '>' + feature.content + '</div>';
            var point = feature.point.projectTo(crs);
            var position = [point.x / resolution, -point.y / resolution];

            return [new HtmlElement(html, position)];
        }
    }
    
    /**
     * Css class to be added to the label node.
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

    return Label
    
});
