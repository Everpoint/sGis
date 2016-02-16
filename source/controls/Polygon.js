'use strict';

(function() {

sGis.controls.Polygon = function(map, options) {
    this._initialize(map, options);
};

sGis.controls.Polygon.prototype = new sGis.controls.Poly({
    _featureClass: sGis.feature.Polygon
});

})();



