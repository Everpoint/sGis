sGis.module('render.HtmlElement', [

], () => {
    
    'use strict';

    /**
     * @alias sGis.renders.HtmlElement
     */
    class HtmlElement {
        constructor(htmlText, position, onAfterDisplayed) {
            this._htmlText = htmlText;
            this._position = position;
            this.onAfterDisplayed = onAfterDisplayed;
        }

        static get isVector() { return false; }

        getNode(callback) {
            var node = document.createElement('div');
            node.innerHTML = this._htmlText;
            return node;
        }
        
        get position() { return this._position; }
    }

    return HtmlElement;

});