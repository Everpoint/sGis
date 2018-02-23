/// Template: "full_screen_map.html"
/// Title: "Point creation control"

import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/Point";
import {Coordinates} from "../../../source/baseTypes";
import {BalloonControl} from "../../../source/controls/BalloonControl";
import {Point} from "../../../source/Point";
import {PointControl} from "../../../source/controls/PointControl";
import {MaskedImage} from "../../../source/symbols/point/MaskedImage";
import {DrawingFinishEvent} from "../../../source/controls/Control";
import {geo} from "../../../source/Crs";

let featureLayer = new FeatureLayer();

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'), featureLayer],
});

let control = new PointControl(map, {activeLayer: featureLayer, symbol: getSymbol()});
control.on('drawingFinish', (event: DrawingFinishEvent) => {
    console.log(event.feature.projectTo(geo).centroid);
    control.symbol = getSymbol();
});

control.activate();

function getSymbol() {
    return new MaskedImage({maskColor: getRandomColor()});
}

function getRandomColor() {
    return '#' + ('000000' + Math.floor(Math.random()*255*255*255).toString(16)).slice(-6);
}