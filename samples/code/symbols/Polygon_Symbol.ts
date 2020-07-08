/// Template: "full_screen_map.html"
/// Title: "Polygon symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {Polygon} from "../../../source/features/Polygon";
import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {wgs84} from "../../../source/Crs";
import {polygonData} from "../../resources/polygonData";

import {BrushFill} from "../../../source/symbols/polygon/BrushFill";
import {ImageFill} from "../../../source/symbols/polygon/ImageFill";
import {PolygonSymbol} from "../../../source/symbols/polygon/Simple";

const {map} = init({
    wrapper: document.body,
    resolution: 811,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

const layer = new FeatureLayer({
    features: [
        new Polygon(polygonData.vladimir,
            {
                crs: wgs84,
                symbol: new ImageFill({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    shadow: {
                        offsetX: 2,
                        offsetY: 6,
                        blur: 10,
                        color: "#ff6933",
                    },
                    src: "https://avatanplus.com/files/resources/mid/5c39deca055e0168420e4526.png"
                }),
            }),
        new Polygon(polygonData.moscow,
            {
                crs: wgs84,
                symbol: new PolygonSymbol({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    fillColor: "rgba(0, 95, 173, 0.2)",
                    shadow: {
                        offsetX: 8,
                        offsetY: 10,
                        blur: 2,
                        color: "rgba(0, 0, 0, 0.4)",
                    }
                }),
            }),
        new Polygon(polygonData.kaluga,
            {
                crs: wgs84,
                symbol: new BrushFill({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    shadow: {
                        offsetX: -14,
                        offsetY: -8,
                        color: "rgba(0, 0, 0, 1)",
                    },
                }),
            }),
        new Polygon(polygonData.yaroslavl,
            {
                crs: wgs84,
                symbol: new PolygonSymbol({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    fillColor: "rgba(0, 135, 90, 0.44)",
                    shadow: {
                        offsetX: 6,
                        offsetY: 6,
                        blur: 0,
                        color: "rgba(0, 0, 255, 0.4)",
                    }
                }),
            }),
    ]
});

map.addLayer(layer);
