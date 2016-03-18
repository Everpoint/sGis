sGis.module('feature.Abstract', [
    'Feature'
], function(Feature) {
    'use strict';

    var Abstract = function(options) {
        this.__initialize(options);
    };

    Abstract.prototype = new Feature({
        render: function() {
            return [];
        }
    });

    return Abstract;

});
