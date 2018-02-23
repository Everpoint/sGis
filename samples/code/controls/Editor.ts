/// Template: "full_screen_map.html"
/// Title: "Polygon creation control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/Point";
import {StaticImageSymbol} from "../../../source/symbols/point/StaticImageSymbol";
import {DynamicImageSymbol} from "../../../source/symbols/point/DynamicImageSymbol";
import {Polyline} from "../../../source/features/Polyline";
import {Polygon} from "../../../source/features/Polygon";
import {Editor} from "../../../source/controls/Editor";

let featureLayer = new FeatureLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
});

let step = map.resolution * 50;
featureLayer.add([
    new PointFeature([map.position[0], map.position[1]], {crs: map.crs, symbol: new StaticImageSymbol()}),
    new PointFeature([map.position[0]+step, map.position[1]], {crs: map.crs, symbol: new DynamicImageSymbol()}),
    new Polyline([[
        [map.position[0]+step*2, map.position[1]], [map.position[0]+step*3, map.position[1]+step]
    ]], {crs: map.crs}),
    new Polygon([[
        [map.position[0]-step, map.position[1]], [map.position[0]-step, map.position[1]+step], [map.position[0]-step*2, map.position[1]]
    ]], {crs: map.crs})
]);

let control = new Editor(map, {activeLayer: featureLayer});
control.activate();
