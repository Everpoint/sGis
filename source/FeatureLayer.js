'use strict';

(function() {

    sGis.FeatureLayer = function(options) {
        utils.initializeOptions(this, options);
        this.__initialize();

        this._features = [];
        if (options && options.features) this.add(options.features);
    };

    sGis.FeatureLayer.prototype = new sGis.Layer({
        _delayedUpdate: true,

        getFeatures: function(bbox) {
            if (!bbox || !(bbox instanceof sGis.Bbox)) utils.error('Expected bbox, but got ' + bbox + 'instead');

            if (!this._display) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var obj = [];
            for (var i in this._features) {
                if (!this._features[i].crs.equals(bbox.p[0].crs) && !(this._features[i].crs.to && bbox.p[0].crs.to)) continue;
                var featureBbox = this._features[i].bbox;
                if (!featureBbox || bbox.intersects(featureBbox)) obj.push(this._features[i]);
            }
            return obj;
        },

        add: function(features) {
            if (features instanceof sGis.Feature) {
                this._features.push(features);
                this.fire('featureAdd', {feature: features});
            } else if (utils.isArray(features)) {
                for (var i in features) {
                    this.add(features[i]);
                }
            } else {
                utils.error('sGis.Feature instance or their array is expected but got ' + features + 'instead');
            }
        },

        remove: function(feature) {
            if (!(feature instanceof sGis.Feature)) utils.error('sGis.Feature instance is expected but got ' + feature + 'instead');
            var index = this._features.indexOf(feature);
            if (index === -1) utils.error('The feature does not belong to the layer');
            this._features.splice(index, 1);
            this.fire('featureRemove', {feature: feature});
        },

        has: function(feature) {
            return this._features.indexOf(feature) !== -1;
        },

        moveToTop: function(feature) {
            var index = this._features.indexOf(feature);
            if (index !== -1) {
                this._features.splice(index, 1);
                this._features.push(feature);
            }
        }
    });

    Object.defineProperties(sGis.FeatureLayer.prototype, {
        features: {
            get: function() {
                return [].concat(this._features);
            },

            set: function(features) {
                var currFeatures = this.features;
                for (var i = 0; i < currFeatures.length; i++) {
                    this.remove(currFeatures[i]);
                }

                this.add(features);
            }
        }
    });

})();