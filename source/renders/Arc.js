sGis.module('render.Arc', [
    'utils'
], function(utils) {
    
    'use strict';

    var defaults = {
        center: null,
        radius: 5,
        strokeColor: 'black',
        strokeWidth: 1,
        fillColor: 'transparent',
        ignoreEvents: false
    };
    
    class Arc {
        constructor(center, options) {
            utils.init(this, options);
            this.center = center;
        }

        contains(position) {
            var dx = position.x - this.center[0];
            var dy = position.y - this.center[1];
            var distance2 = dx * dx + dy * dy;
            return Math.sqrt(distance2) < this.radius + 2;
        }
        
        static get isVector() { return true; }
    }
    
    utils.extend(Arc.prototype, defaults);
    
    return Arc;
    
});
