/// Template: "full_screen_map.html"
/// Title: "Polygon symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {Polyline} from "../../../source/features/Polyline";
import {Polygon} from "../../../source/features/Polygon";
import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {wgs84} from "../../../source/Crs";
import {polygonData} from "../../resources/polygonData";

import {BrushFill} from "../../../source/symbols/polygon/BrushFill";
import {ImageFill} from "../../../source/symbols/polygon/ImageFill";
import {PolygonSymbol} from "../../../source/symbols/polygon/Simple";
import {PolylineSymbol} from "../../../source/symbols/PolylineSymbol";

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
                        blur: 10,
                    },
                }),
            }),
        new Polygon(polygonData.yaroslavl,
            {
                crs: wgs84,
                symbol: new PolygonSymbol({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    fillColor: "rgba(0, 231, 2, 0.1)",
                    shadow: {
                        offsetX: 2,
                        offsetY: 6,
                        blur: 0,
                        color: "rgba(0, 0, 255, 0.4)",
                        isOuter: true,
                    }
                }),
            }),
        new Polyline(polygonData.polyline,
            {
                crs: wgs84,
                symbol: new PolylineSymbol({
                    strokeColor: "#fff",
                    strokeWidth: 2,
                    shadow: {
                        offsetX: 2,
                        offsetY: 4,
                        blur: 4,
                        color: "rgba(24, 78, 169, 0.6)",
                    },
                }),
            }),
        new Polygon(polygonData.moscow, {
            crs: wgs84,
            symbol: new PolygonSymbol({
                strokeWidth: 8,
                strokeColor: 'rgba(255, 255, 255, 0.74)',
                lineCap: 'round',
                lineJoin: 'round',
                isOutsideStroke: true,
            }),
        }),
        new Polygon(polygonData.moscow, {
            crs: wgs84,
            symbol: new PolygonSymbol({
                strokeWidth: 2,
                strokeColor: 'rgb(0, 107, 206)',
                fillColor: 'rgba(0, 107, 206, 0.3)',
                isInsideStroke: true,
                lineCap: 'round',
                lineJoin: 'round',
            }),
        }),
    ]
});

map.addLayer(layer);
