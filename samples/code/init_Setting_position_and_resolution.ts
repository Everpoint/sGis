/// Template: "4_maps.html"
/// Title: "Setting position and resolution with init function"

import {init} from "sgis/dist/init";
import {TileLayer} from "sgis/dist/layers/TileLayer";
import {Point} from "sgis/dist/Point";
import {webMercator} from "sgis/dist/Crs";

let gis1 = init({
    wrapper: 'map1',
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

let gis2 = init({
    wrapper: 'map2',
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    position: new Point([59.9194063, 30.3458224]).projectTo(webMercator).position
});

let gis3 = init({
    wrapper: 'map3',
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    centerPoint: new Point([59.9194063, 30.3458224]),
    resolution: 611.4962262812505 / 4
});

let gis4 = init({
    wrapper: 'map4',
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    position: [4422391, 5405574],
    resolution: 611.4962262812505
});