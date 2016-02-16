(function() {

    sGis.controls.Distance = function(map, options) {
        if (!(map instanceof sGis.Map)) utils.error('sGis.Map instance is expected but got ' + map + ' instead');
        this._map = map;

        this._polylineControl = new sGis.controls.Polyline(map, { activeLayer: options && options.activeLayer, style: {strokeWidth: 2, strokeColor: 'red'} });
        utils.init(this, options);

        this._polylineControl.addListener('drawingBegin', function() {
            if (this.activeLayer.features.length > 1) this.activeLayer.features = [this.activeLayer.features[this.activeLayer.features.length - 1]];

            var feature = this.activeLayer.features[this.activeLayer.features.length - 1],
                coord = feature.coordinates[0],
                label = new sGis.feature.Label(coord[1], { content: '', style: { offset: { x: 2, y: -22 }, css: 'sGis-distanceLabel', width: 100 }, crs: map.crs });

            this.activeLayer.add(label);

            map.addListener('mousemove.distanceMeasureControl', function() {
                label.coordinates = feature.coordinates[0][feature.coordinates[0].length - 1];
                label.content = formatNumber(sGis.geotools.length(feature));
            });
        });

        this._polylineControl.addListener('drawingFinish', function() {
            map.removeListener('mousemove.distanceMeasureControl');
        });
    };

    sGis.controls.Distance.prototype = new sGis.Control({
        _setActiveStatus: function(bool) {
            this._polylineControl.isActive = bool;
            this._active = bool;
        }
    });

    sGis.utils.proto.setProperties(sGis.controls.Distance.prototype, {
        activeLayer: {
            get: function() {
                return this._polylineControl.activeLayer;
            },
            set: function(layer) {
                this._polylineControl.activeLayer = layer;
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
    })

    function formatNumber(n) {
        var s;
        if (n > 10000) {
            s = '' + (n / 1000).toFixed(2) + 'км';
        } else {
            s = '' + n.toFixed(2) + 'м';
        }
        return s.replace('.', ',');
    }

    function addStyleSheet() {
        var styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerHTML = '.sGis-distanceLabel {font-family: "PT Sans",Tahoma; font-size: 15px; background-color: rgba(200, 200, 255, 0.8);border: 1px solid black;border-radius: 5px; color: black;}';
        document.head.appendChild(styleSheet);
    }

    addStyleSheet();

})();