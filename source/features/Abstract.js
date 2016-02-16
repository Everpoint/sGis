'use strict';
(function() {

    sGis.feature.Abstract = function(options) {
        this.__initialize(options);
    };

    sGis.feature.Abstract.prototype = new sGis.Feature({
        render: function() {
            return [];
        }
    });

})();