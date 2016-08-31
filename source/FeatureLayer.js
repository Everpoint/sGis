sGis.module('FeatureLayer', [
    'utils',
    'Layer',
    'Feature',
    'Bbox'
], function(utils, Layer, Feature, Bbox) {
    'use strict';

    var defaults = {
        delayedUpdate: true
    };

    /**
     * @alias sGis.FeatureLayer
     */
    class FeatureLayer extends Layer {
        constructor(options) {
            super();

            this._features = [];
            sGis.utils.init(this, options);
        }

        getFeatures(bbox) {
            if (!bbox || !(bbox instanceof sGis.Bbox)) sGis.utils.error('Expected bbox, but got ' + bbox + 'instead');

            if (!this.isDisplayed) return [];
            if (this.resolutionLimits[0] >= 0 && resolution < this.resolutionLimits[0] || this.resolutionLimits[1] > 0 && resolution > this.resolutionLimits[1]) return [];

            var obj = [];
            for (var i in this._features) {
                if (!this._features[i].crs.equals(bbox.p[0].crs) && !(this._features[i].crs.to && bbox.p[0].crs.to)) continue;
                var featureBbox = this._features[i].bbox;
                if (!featureBbox || bbox.intersects(featureBbox)) obj.push(this._features[i]);
            }
            return obj;
        }

        add(features) {
            if (features instanceof sGis.Feature) {
                this._features.push(features);
                this.fire('featureAdd', {feature: features});
            } else if (sGis.utils.isArray(features)) {
                for (var i in features) {
                    this.add(features[i]);
                }
            } else {
                sGis.utils.error('sGis.Feature instance or their array is expected but got ' + features + 'instead');
            }
        }

        remove(feature) {
            if (!(feature instanceof sGis.Feature)) sGis.utils.error('sGis.Feature instance is expected but got ' + feature + 'instead');
            var index = this._features.indexOf(feature);
            if (index === -1) sGis.utils.error('The feature does not belong to the layer');
            this._features.splice(index, 1);
            this.fire('featureRemove', {feature: feature});
        }

        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }

        moveToTop(feature) {
            var index = this._features.indexOf(feature);
            if (index !== -1) {
                this._features.splice(index, 1);
                this._features.push(feature);
            }
        }

        get features() { return this._features.slice(); }
        set features(features) {
            var currFeatures = this.features;
            for (var i = 0; i < currFeatures.length; i++) {
                this.remove(currFeatures[i]);
            }

            this.add(features);
        }
    }

    sGis.utils.extend(FeatureLayer.prototype, defaults);

    return FeatureLayer;
});
