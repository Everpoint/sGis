/// Template: "full_screen_map.html"
/// Title: "Map Balloon Control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/Point";
import {Coordinates} from "../../../source/baseTypes";
import {BalloonControl} from "../../../source/controls/BalloonControl";
import {Point} from "../../../source/Point";

let points = [
    {position: [55.7514, 37.6409], text: 'Moscow', link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/MSK_Collage_2015.png/343px-MSK_Collage_2015.png'},
    {position: [59.9226, 30.3324], text: 'Saint Petersburg', link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/St._Petersburg_Montage_2016.png/343px-St._Petersburg_Montage_2016.png'}
];

let {map, painter} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    centerPoint: new Point([57.84, 40.56]),
    resolution: 2445.984905125002
});

let control = new BalloonControl(map, {painter});

let featureLayer = new FeatureLayer();
points.forEach(point => {
    let feature = new PointFeature(<Coordinates>point.position);
    control.attach(feature, `<h1>${point.text}</h1><img src="${point.link}" />`);
    featureLayer.add(feature);
});

map.addLayer(featureLayer);
