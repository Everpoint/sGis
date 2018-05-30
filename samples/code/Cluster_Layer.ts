/// Template: "full_screen_map.html"
/// Title: "Cluster layer"

import {ClusterLayer} from "../../source/layers/ClusterLayer";
import {init} from "../../source/init";
import {TileLayer} from "../../source/layers/TileLayer";
import {PointFeature} from "../../source/features/PointFeature";
import {wgs84} from "../../source/Crs";
import {Point} from "../../source/Point";

import { data } from '../resources/data';

let {map} = init({
    centerPoint: new Point([58, 92]),
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
