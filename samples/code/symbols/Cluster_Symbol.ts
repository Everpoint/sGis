/// Template: "full_screen_map.html"
/// Title: "Cluster symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/PointFeature";
import {init} from "../../../source/init";
import {Coordinates} from "../../../source/baseTypes";
import {TileLayer} from "../../../source/layers/TileLayer";
import {ClusterSymbol} from "../../../source/symbols/ClusterSymbol";
import {FeatureGroup} from "../../../source/features/FeatureGroup";
import {setStyleNode} from "../../../source/utils/utils";

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

const img = document.createElement('img');
img.src = 'https://skay.ua/img/logomini.png';
img.style.width = '100%';
img.style.height = 'auto';

let symbols = [
    new ClusterSymbol({
        count: 4,
    }),
    new ClusterSymbol({
        count: 44,
        values: [444, 55, 233, 140],
        colors: ['#32fd44', '#24b0fd', '#fdeb34', '#fd450e'],
    }),
    new ClusterSymbol({
        count: 14,
        node: img,
    }),
];

setStyleNode(`
    .sGis-dynamicClusterLabel {
        position: absolute;
    }
`);

let step = 100 * map.resolution;
let position: Coordinates = [map.position[0] - step * 2, map.position[1]];
let features = [];

symbols.forEach((symbol, index) => {
    features.push(new FeatureGroup(features, {symbol: symbols[index], crs: map.crs}));
    position = [position[0] + step, position[1]];
});

let layer = new FeatureLayer({features});
map.addLayer(layer);
