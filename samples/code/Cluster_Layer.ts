import {ClusterLayer} from "../../source/layers/ClusterLayer";
import {init} from "../../source/init";
import {TileLayer} from "../../source/layers/TileLayer";
import {PointFeature} from "../../source/features/PointFeature";
import {wgs84} from "../../source/Crs";

import data from '../resources/fairs.json';

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
