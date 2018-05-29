import {ClusterLayer} from "../../source/layers/ClusterLayer";
import {init} from "../../source/init";
import {TileLayer} from "../../source/layers/TileLayer";
import {PointFeature} from "../../source/features/PointFeature";
import {wgs84} from "../../source/Crs";

// import data from '../resources/fairs.json';

const data = [
    [83.77203, 53.351048],
    [83.68264, 53.346348],
    [83.675354, 53.366997],
    [83.74456, 53.37964],
    [83.69457, 53.25384],
    [83.76995, 53.355083],
];

let {map} = init({
    position: [58, 92],
    resolution: 9595,
    wrapper: document.body,
    layers: [
        new TileLayer(
            'http://tile1.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=40',
        ),
    ],
});

const features = data.map(
    coordinates =>
        new PointFeature([coordinates[0], coordinates[1]], {
            crs: wgs84,
        }),
);

const layer = new ClusterLayer();
layer.add(features);

map.addLayer(layer);
