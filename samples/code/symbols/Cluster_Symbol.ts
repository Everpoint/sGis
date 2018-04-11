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

let symbols = [
    new ClusterSymbol(),
    new ClusterSymbol({
        fontColor: '#fff',
        fillColor: 'rgba(252, 217, 89, 1)',
        borderColor: '#fff',
        cssClassName: 'sGis-dynamicCluster customCluster',
        offset: [0, -3],
    }),
    new ClusterSymbol({
        borderWidth: 4,
        fontColor: 'rgb(100, 199, 108)',
        borderColor: 'rgb(100, 199, 108)',
        font: 'bold 12px Roboto, sans-serif',
    }),
    new ClusterSymbol({
        fontColor: '#fff',
        size: 30,
        cssClassName: 'sGis-dynamicCluster secondCustomCluster',
        outlineWidth: 0,
        borderWidth: 0,
        font: 'bold 14px sans-serif',
        fillColor: 'rgba(249, 88, 87, 1)',
    }),
];

setStyleNode(`
    .customCluster {
        cursor: pointer;
    }
    .customCluster:before {
        content:'';
        position: absolute;
        height: 100%;
	    width: 100%;
        transform: scale(0);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transition: all 0.4s ease;
    }
    .customCluster:hover:before {
        transform: scale(1);
    }
    .secondCustomCluster {
        color: #fff;
        box-shadow: 0 0 4px 11px rgba(249, 88, 87, 0.4);
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
        [37.857988, 56.967378],
        [33.857988, 55.967378],
        [34.857988, 52.967378],
    ],
    [
        [38.684968, 56.195796],
        [38.484312, 54.206483],
        [37.115252, 56.883747],
    ],
    [
        [38.684968, 56.194796],
        [38.484312, 54.205483],
        [38.115252, 57.883747],
        [36.857988, 54.467378],
        [36.877988, 54.417378],
    ],
].map(group =>
    group.map(point => new PointFeature([point[0], point[1]], { crs: wgs84 })),
);

symbols.forEach((symbol, index) => {
    features.push(new FeatureGroup(points[index], {symbol: symbols[index], crs: map.crs}));
});

let layer = new FeatureLayer({features});
map.addLayer(layer);
