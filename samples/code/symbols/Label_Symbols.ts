/// Template: "full_screen_map.html"
/// Title: "Label symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {PointFeature} from "../../../source/features/PointFeature";
import {init} from "../../../source/init";
import {Coordinates} from "../../../source/baseTypes";
import {TileLayer} from "../../../source/layers/TileLayer";
import {CrossPointSymbol} from "../../../source/symbols/point/CrossPointSymbol";
import {StaticLabelSymbol} from "../../../source/symbols/label/StaticLabelSymbol";
import {HorizontalAlignment, VerticalAlignment} from "../../../source/renders/VectorLabel";
import {LabelFeature} from "../../../source/features/Label";
import {DynamicLabelSymbol} from "../../../source/symbols/label/DynamicLabelSymbol";
import {setCssClasses, setStyleNode} from "../../../source/utils/utils";

let {map} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')]
});

let symbols = [
    new StaticLabelSymbol(),
    new StaticLabelSymbol({
        fontSize: 20,
        fontFamily: 'Times New Roman, sans-serif',
        fontStyle: 'bold',
        verticalAlignment: VerticalAlignment.Bottom,
        horizontalAlignment: HorizontalAlignment.Center,
        offset: [0, 5],
        fillColor: 'rgba(0,0,255,0.5)',
        strokeColor: 'blue',
        strokeWidth: 0.5
    }),
    new DynamicLabelSymbol(),
    new DynamicLabelSymbol({cssClassName: 'sGis-dynamicLabel customLabel', offset: [0, -3]})
];

setStyleNode(`
    .customLabel {
        font-size: 20px;
        color: red;
        cursor: pointer;
        transform: translate(-50%, -100%);
    }
    
    .customLabel:hover {
        color: green;
    }
`);

let step = 100 * map.resolution;
let position: Coordinates = [map.position[0] - step * 2, map.position[1]];
let features = [];

let crossSymbol = new CrossPointSymbol({strokeColor: 'red'});

symbols.forEach((symbol, index) => {
    features.push(new PointFeature(position, {symbol: crossSymbol, crs: map.crs}));
    features.push(new LabelFeature(position, {symbol, crs: map.crs, content: `Label ${index}`}));
    position = [position[0] + step, position[1]];
});

let layer = new FeatureLayer({features});
map.addLayer(layer);
