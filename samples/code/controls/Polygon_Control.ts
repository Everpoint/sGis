/// Template: "full_screen_map.html"
/// Title: "Polygon creation control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {DrawingFinishEvent} from "../../../source/controls/Control";
import {geo} from "../../../source/Crs";
import {Poly} from "../../../source/features/Poly";
import {PolygonControl} from "../../../source/controls/PolygonControl";
import {PolygonSymbol} from "../../../source/symbols/polygon/Simple";

let featureLayer = new FeatureLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
});

let control = new PolygonControl(map, {activeLayer: featureLayer, symbol: getSymbol()});
control.on('drawingFinish', (event: DrawingFinishEvent) => {
    console.log((<Poly>event.feature.projectTo(geo)).rings);
    control.symbol = getSymbol();
});

control.activate();

function getSymbol() {
    return new PolygonSymbol({strokeColor: getRandomColor(), strokeWidth: 3, fillColor: getRandomColor()});
}

function getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random()*255*255*255).toString(16)).slice(-6);
}