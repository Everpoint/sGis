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
            this._lastNode = node;
            return node;
        }
        
        get position() { return this._position; }
        
        contains(position) {
            var widht = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
            var height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;
            
            return this._position.x < position.x && this._position.y > position.y && this._position.x + width > position.x && this._position.y - height > position.y;
        }
    }

    return HtmlElement;

});