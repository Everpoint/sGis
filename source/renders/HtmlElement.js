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
            callback(null, node);
        }
        
        get position() { return this._position; }
        
        contains(position) {
            var width = this._lastNode.clientWidth || this._lastNode.offsetWidth || 0;
            var height = this._lastNode.clientHeight || this._lastNode.offsetHeight || 0;
            
            return this._position[0] < position.x && this._position[1] < position.y && this._position[0] + width > position.x && this._position[1] + height > position.y;
        }
    }

    return HtmlElement;

});