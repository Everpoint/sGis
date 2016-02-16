'use strict';

(function() {

    sGis.controls.Polyline = function(map, options) {
        this._initialize(map, options);
    };

    sGis.controls.Polyline.prototype = new sGis.controls.Poly({
        _featureClass: sGis.feature.Polyline
    });

})();



