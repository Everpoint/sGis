/// Template: "full_screen_map.html"
/// Title: "Cluster symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {Feature} from "../../../source/features/Feature";
import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {ClusterSymbol} from "../../../source/symbols/ClusterSymbol";
import {FeatureGroup} from "../../../source/features/FeatureGroup";
import {setStyleNode} from "../../../source/utils/utils";
import {PointFeature} from "../../../source/features/PointFeature";
import {wgs84} from "../../../source/Crs";

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

const img = document.createElement('img');
img.classList.add('sGis-dynamicClusterIMG');
img.src = 'https://skay.ua/img/logomini.png';

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
    new ClusterSymbol({
        count: 444,
        borderWidth: 0,
        wrapperClassNames: 'custom-cluster',
        labelClassNames: 'custom-label',
        fill: 'rgba(0, 0, 0, 0.8)',
    }),
];

setStyleNode(`
    .sGis-dynamicClusterLabel {
        position: absolute;
    }
    .sGis-dynamicClusterIMG {
        width: 100%;
        height: auto;
        position: absolute;
    }
    .custom-cluster {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
    }
    .custom-label {
        color: #fff;
        font-weight: bold;
        text-shadow: 2px 2px 3px rgba(255,255,255,0.1);
    }
`);

let features: Feature[] = [];

const points = [
    [
        [38.684968, 56.195796],
        [36.484312, 56.206483],
        [37.115252, 56.883747],
        [35.857988, 54.967378],
    ],
    [
        [38.684968, 56.197796],
        [36.484312, 55.106483],
        [37.115252, 56.884747],
        [35.857988, 54.967378],
    ],
    [
        [38.684968, 56.195796],
        [38.484312, 54.206483],
        [37.115252, 56.883747],
        [36.857988, 56.467378],
    ],
    [
        [38.684968, 56.194796],
        [38.484312, 54.205483],
        [37.115252, 56.883747],
        [36.857988, 54.467378],
    ],
].map(group =>
    group.map(point => new PointFeature([point[0], point[1]], { crs: wgs84 })),
);

symbols.forEach((symbol, index) => {
    features.push(new FeatureGroup(points[index], {symbol: symbols[index], crs: map.crs}));
});

let layer = new FeatureLayer({features});
map.addLayer(layer);
