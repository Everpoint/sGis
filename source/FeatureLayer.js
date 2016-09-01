sGis.module('FeatureLayer', [
    'utils',
    'Layer'
], function(utils, Layer) {
    'use strict';

    /**
     * A layer that contains arbitrary set of vector objects 
     * @alias sGis.FeatureLayer
     */
    class FeatureLayer extends Layer {
        /**
         * @constructor
         * @param {Object} [properties] - key-value set of properties to be assigned to the instance
         */
        constructor(properties = {}) {
            if (properties.features) {
                var features = properties.features;
                delete properties.features;
            }
            super(properties);

            /**
             * @type {sGis.Feature[]}
             * @private
             */
            this._features = features || [];
        }

        getFeatures(bbox, resolution) {
            if (!this.checkVisibility(resolution)) return [];

            var obj = [];
            this._features.forEach(feature => {
                if (feature.crs.canProjectTo(bbox.crs) && feature.bbox.intersects(bbox)) obj.push(feature);
            });

            return obj;
        }

        /**
         * Adds a feature or an array of features to the layer
         * @param {sGis.Feature|sGis.Feature[]} features - features to add
         * @fires sGis.FeatureLayer#featureAdd - for each feature to be added
         */
        add(features) {
            if (Array.isArray(features)) {
                features.forEach(feature => {
                    this.add(feature);
                });
            } else {
                this._features.push(features);
                this.fire('featureAdd', {feature: features});
            }
        }

        /**
         * Removes a feature from the layer
         * @param {sGis.Feature} feature - feature to be removed
         * @throws if the feature is not in the layer
         * @fires sGis.FeatureLayer#featureRemove
         */
        remove(feature) {
            var index = this._features.indexOf(feature);
            if (index === -1) utils.error('The feature does not belong to the layer');
            this._features.splice(index, 1);
            this.fire('featureRemove', {feature: feature});
        }

        /**
         * Returns true if the given feature is in the layer
         * @param {sGis.Feature} feature
         * @returns {boolean}
         */
        has(feature) {
            return this._features.indexOf(feature) !== -1;
        }

        /**
         * Moves the given feature to the top of the layer (end of the list). If the feature is not in the layer, the command is ignored
         * @param {sGis.Feature} feature
         */
        moveToTop(feature) {
            var index = this._features.indexOf(feature);
            if (index !== -1) {
                this._features.splice(index, 1);
                this._features.push(feature);
            }
        }

        /**
         * List of features in the layer. If assigned, it removes all features and add new ones, firing all the respective events.
         * @type {sGis.Feature[]}
         * @default []
         * @fires sGis.FeatureLayer#featureAdd
         * @fires sGis.FeatureLayer#featureRemove
         */
        get features() { return this._features.slice(); }
        set features(/** sGis.Feature[] */ features) {
            var currFeatures = this.features;
            for (var i = 0; i < currFeatures.length; i++) {
                this.remove(currFeatures[i]);
            }

            this.add(features);
        }
    }

    /**
     * @default true
     */
    FeatureLayer.prototype.delayedUpdate = true;

    return FeatureLayer;

    /**
     * A feature has been added to the layer
     * @event sGis.FeatureLayer#featureAdd
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.Feature} feature - feature that is added to the layer
     */

    /**
     * A feature has been removed from the layer
     * @event sGis.FeatureLayer#featureRemove
     * @type {Object}
     * @mixes sGisEvent
     * @prop {sGis.Feature} feature - feature that is removed from the layer
     */

});
