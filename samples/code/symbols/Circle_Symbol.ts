/// Template: "full_screen_map.html"
/// Title: "Circle symbols"

import {FeatureLayer} from "../../../source/layers/FeatureLayer";
import {Feature} from "../../../source/features/Feature";
import {init} from "../../../source/init";
import {TileLayer} from "../../../source/layers/TileLayer";
import {PointFeature} from "../../../source/features/PointFeature";
import {PointSymbol, PointSymbolConstructorParams} from "../../../source/symbols/point/Point";
import {webMercator, Crs} from "../../../source/Crs";
import {Arc} from "../../../source/renders/Arc";
import {Coordinates} from "../../../source/baseTypes";
import {distance} from "../../../source/geotools";
import {DomPainter} from "../../../source/painters/DomPainter/DomPainter";

let {map, painter} = init({
    wrapper: document.body,
    layers: [new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png')],
    resolution: 152.87405657031263,
});

type ConvertionContext = {
    painter: DomPainter;
    crs: Crs;
};

export const metersToPixels = (
    meters: number,
    { painter, crs }: ConvertionContext
): number => {
    const { width } = painter;
    const zeroPoint = painter.getPointFromPxPosition(0, 0).projectTo(crs);
    const maxWidthPoint = painter.getPointFromPxPosition(width, 0).projectTo(crs);
    const widthDistance: number = distance(zeroPoint, maxWidthPoint);
    const pxK = width / (widthDistance || 1);

    return Math.round(meters * pxK);
};

class CircleSymbol extends PointSymbol {
    startAngle?: number;
    endAngle?: number;
    clockwise?: boolean = true;
    isSector?: boolean = false;
    lineCap?: "butt" | "round" | "square" = "round";

    constructor(options: PointSymbolConstructorParams & {
        clockwise?: boolean,
        startAngle?: number;
        endAngle?: number;
        isSector?: boolean,
        lineCap?: "butt" | "round" | "square",
    } = {}) {
        super();
        Object.assign(this, options);
    }

    renderFunction(
        feature,
        resolution,
        crs
    ) {
        if (!(feature instanceof PointFeature)) return [];
        const { position } = feature.projectTo(crs);
        const { fillColor, strokeColor, size, startAngle, endAngle, clockwise, isSector, lineCap } = this;

        const pxPosition: Coordinates = [
            Math.round(position[0] / resolution + (this.offset[0] || 0)),
            Math.round(-position[1] / resolution + (this.offset[1] || 0)),
        ];

        const sizePx = metersToPixels(size, {
            painter: painter,
            crs,
        });

        return [
            new Arc(pxPosition, {
                fillColor,
                strokeColor,
                strokeWidth: Math.round(sizePx / 25),
                radius: Math.round(sizePx / 2),
                startAngle: startAngle || 0,
                endAngle: endAngle || Math.PI * 2,
                clockwise,
                isSector,
                lineCap,
            }),
        ];
    }
}

const features: Feature[] = [
    {
        center: [4164954.84281547, 7537937.227221599],
        size: 8444,
        strokeColor: "rgba(186,3,252,0.74)",
        clockwise: false,
        startAngle: 0.25,
        endAngle: 3.14159 / 2,
        isSector: true,
    },
    {
        center: [4211122.807899704, 7531822.264958786],
        size: 1444,
        fillColor: "rgba(255, 60, 69, 0.12)",
        strokeColor: "rgb(255, 60, 69)"
    },
    {
        center: [4202256.112618627, 7529146.968968806],
        size: 100,
        fillColor: "rgba(255, 60, 69, 0.12)",
        strokeColor: "rgb(255, 60, 69)"
    },
    {
        center: [4181770.9890382043, 7507973.912133818],
        size: 24444,
        fillColor: "rgba(6, 139, 136, 0.3)",
        strokeColor: "rgb(31, 179, 170)"
    },
    {
        center: [4218766.51072822, 7496966.980060754],
        size: 14444,
        strokeColor: "rgb(255,188,0)",
        endAngle: 3.14159 / 2,
        clockwise: true,
        lineCap: "butt" as "butt",
    },
    {
        center:  [4203631.979127759, 7509273.341614665],
        size: 5444,
        strokeColor: "#000",
        startAngle: 0.75,
        isSector: true,
        fillColor: "#FFC10A",
        endAngle: Math.PI * 2 - 0.75,
    }
].map(({center, fillColor, ...options}) =>
    new PointFeature(center as Coordinates, {
        persistOnMap: true,
        crs: webMercator,
        symbol: new CircleSymbol({fillColor: fillColor || "transparent", ...options})
    })
);

let layer = new FeatureLayer({features});
map.addLayer(layer);
