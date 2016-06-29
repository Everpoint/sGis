sGis.module('controls.Area', [
    'Control',
    'controls.Polygon',
    'Map',
    'feature.Label',
    'geotools'
], function (Control, PolygonControl, Map, Label, geotools) {
    'use strict';

    var Area = function(map, options) {
        if (!(map instanceof sGis.Map)) sGis.utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        this._polygonControl = new sGis.controls.Polygon(map, { activeLayer: options && options.activeLayer, style: { strokeWidth: 2, strokeColor: 'red', fillColor: 'rgba(100, 100, 100, 0.5)' } });
        sGis.utils.init(this, options);

        this._polygonControl.addListener('drawingBegin', function() {
            if (this.activeLayer.features.length > 1) this.activeLayer.features = [this.activeLayer.features[this.activeLayer.features.length - 1]];

            var feature = this._activeLayer.features[this._activeLayer.features.length - 1],
                label = new sGis.feature.Label(feature.centroid, { crs: feature.crs, symbol: new sGis.symbol.label.Label({ css: 'sGis-symbol-label-center-middle sGis-distanceLabel' }) });

            this.activeLayer.add(label);

            map.addListener('mousemove.areaMeasureControl', function() {
                label.coordinates = feature.centroid;
                label.content = formatNumber(sGis.geotools.area(feature));
            });
        });

        this._polygonControl.addListener('drawingFinish', function() {
            map.removeListener('mousemove.areaMeasureControl');
        });
    };

    Area.prototype = new sGis.Control({
        _setActiveStatus: function(bool) {
            this._polygonControl.isActive = bool;
            this._active = bool;
        }
    });

    sGis.utils.proto.setProperties(Area.prototype, {
        activeLayer: {
            get: function() {
                return this._polygonControl.activeLayer;
            },
            set: function(layer) {
                this._polygonControl.activeLayer = layer;
            }
        },

        isActive: {
            get: function() {
                return this._active;
            },
            set: function(bool) {
                this._setActiveStatus(bool);
            }
        }
    });

    function formatNumber(n) {
        var s;
        if (n < 10000) {
            s = '' + n.toFixed(2) + 'м²';
        } else if (n < 10000000) {
            s = '' + (n / 10000).toFixed(2) + 'га';
        } else {
            s = '' + (n / 1000000).toFixed(2) + 'км²';
            if (s.length > 10) {
                for (var i = s.length - 9; i > 0; i -= 3) {
                    s = s.substr(0, i) + ' ' + s.substr(i);
                }
            }
        }
        return s.replace('.', ',');
    }

    return Area;

});
