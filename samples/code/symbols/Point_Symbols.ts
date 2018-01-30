/// Template: "full_screen_map.html"
/// Title: "Point symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/Point";
import {init} from "../../../source/init";
import {PointSymbol} from "../../../source/symbols/point/Point";
import {SquareSymbol} from "../../../source/symbols/point/Square";
import {StaticImageSymbol} from "../../../source/symbols/point/StaticImageSymbol";
import {MaskedImage} from "../../../source/symbols/point/MaskedImage";
import {Coordinates} from "../../../source/baseTypes";
import {TileLayer} from "../../../source/layers/TileLayer";
import {CrossPointSymbol} from "../../../source/symbols/point/CrossPointSymbol";
import {DynamicImageSymbol} from "../../../source/symbols/point/DynamicImageSymbol";

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

let crossSymbol = new CrossPointSymbol();

let symbols = [
    new PointSymbol(), //default symbol
    new PointSymbol({size: 30, strokeColor: 'green', strokeWidth: 2, fillColor: 'rgba(0,255,0,0.5)'}),
    new SquareSymbol(),
    new SquareSymbol({size: 30, strokeColor: 'green', strokeWidth: 2, fillColor: 'rgba(0,255,0,0.5)'}),
    new StaticImageSymbol(),
    new StaticImageSymbol({angle: Math.PI / 4, width: 32, height: 64, anchorPoint: [16, 64], source: '../../resources/Car_red.png'}),
    new MaskedImage({onUpdate: updateLayer}),
    new MaskedImage({
        onUpdate: updateLayer,
        width: 64,
        height: 64,
        anchorPoint: [32, 32],
        imageSource: '../../resources/Car.png',
        maskSource: '../../resources/Car_mask.png',
        maskColor: 'blue',
        angle: Math.PI / 2
    }),
    new DynamicImageSymbol()
];

let step = 100 * map.resolution;
let position: Coordinates = [map.position[0] - step * 3, map.position[1]];
let features = [];
symbols.forEach((symbol, index) => {
    features.push(new PointFeature(position, {symbol: crossSymbol, crs: map.crs}));
    let point = new PointFeature(position, {symbol, crs: map.crs});
    features.push(point);
    position = [position[0] + step, position[1]];
    point.on('click', () => {
        console.log(index);
    });

});

let layer = new FeatureLayer({features});
map.addLayer(layer);

function updateLayer() { layer.redraw(); }