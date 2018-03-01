import "jest";
import {PointSymbol} from "../../source/symbols/point/Point";
import * as symbolSerializer from "../../source/serializers/symbolSerializer";
import {SquareSymbol} from "../../source/symbols/point/Square";
import {StaticImageSymbol} from "../../source/symbols/point/StaticImageSymbol";
import {MaskedImage} from "../../source/symbols/point/MaskedImage";
import {PolylineSymbol} from "../../source/symbols/PolylineSymbol";
import {PolygonSymbol} from "../../source/symbols/polygon/Simple";
import {BrushFill} from "../../source/symbols/polygon/BrushFill";
import {ImageFill} from "../../source/symbols/polygon/ImageFill";

describe('symbolSerializer', () => {

    describe('serialization and deserialization of symbols', () => {

        it('point.Point', () => {
            let symbol1 = new PointSymbol();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.size).toBeDefined();
            expect(desc1.fillColor).toBeDefined();
            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.offset).toBeDefined();

            let deserialized1 = <PointSymbol>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof PointSymbol).toBe(true);
            expect(deserialized1.size).toEqual(symbol1.size);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.offset).toEqual(symbol1.offset);

            let symbol2 = new PointSymbol({size: 155, fillColor: 'red', strokeColor: 'blue', strokeWidth: 15, offset: [10, -20]});
            let desc2 = symbolSerializer.serialize(symbol2);
            let deserialized2 = <PointSymbol>symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof PointSymbol).toBe(true);
            expect(deserialized2.size).toEqual(symbol2.size);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.offset).toEqual(symbol2.offset);
        });

        it('point.Square', () => {
            let symbol1 = new SquareSymbol();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.size).toBeDefined();
            expect(desc1.fillColor).toBeDefined();
            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.offset).toBeDefined();

            let deserialized1 = <SquareSymbol>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof SquareSymbol).toBe(true);
            expect(deserialized1.size).toEqual(symbol1.size);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.offset).toEqual(symbol1.offset);

            let symbol2 = new SquareSymbol({size: 155, fillColor: 'red', strokeColor: 'blue', strokeWidth: 15, offset: [10, -20]});
            let desc2 = symbolSerializer.serialize(symbol2);
            let deserialized2 = <SquareSymbol>symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof SquareSymbol).toBe(true);
            expect(deserialized2.size).toEqual(symbol2.size);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.offset).toEqual(symbol2.offset);
        });

        it('point.Image', () => {
            let symbol1 = new StaticImageSymbol();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.width).toBeDefined();
            expect(desc1.height).toBeDefined();
            expect(desc1.anchorPoint).toBeDefined();
            expect(desc1.source).toBeDefined();

            let deserialized1 = <StaticImageSymbol>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof StaticImageSymbol).toBe(true);
            expect(deserialized1.width).toEqual(symbol1.width);
            expect(deserialized1.height).toEqual(symbol1.height);
            expect(deserialized1.anchorPoint).toEqual(symbol1.anchorPoint);
            expect(deserialized1.source).toEqual(symbol1.source);

            let symbol2 = new StaticImageSymbol({width: 15, height: 15, source: 'url', anchorPoint: [10, -20]});
            let desc2 = symbolSerializer.serialize(symbol2);
            let deserialized2 = <StaticImageSymbol>symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof StaticImageSymbol).toBe(true);
            expect(deserialized2.width).toEqual(symbol2.width);
            expect(deserialized2.height).toEqual(symbol2.height);
            expect(deserialized2.anchorPoint).toEqual(symbol2.anchorPoint);
            expect(deserialized2.source).toEqual(symbol2.source);
        });

        it('point.MaskedImage', () => {
            let symbol1 = new MaskedImage();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.width).toBeDefined();
            expect(desc1.height).toBeDefined();
            expect(desc1.anchorPoint).toBeDefined();
            expect(desc1.imageSource).toBeDefined();
            expect(desc1.maskSource).toBeDefined();
            expect(desc1.maskColor).toBeDefined();

            let deserialized1 = <MaskedImage>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof MaskedImage).toBe(true);
            expect(deserialized1.width).toEqual(symbol1.width);
            expect(deserialized1.height).toEqual(symbol1.height);
            expect(deserialized1.anchorPoint).toEqual(symbol1.anchorPoint);
            expect(deserialized1.imageSource).toEqual(symbol1.imageSource);
            expect(deserialized1.maskSource).toEqual(symbol1.maskSource);
            expect(deserialized1.maskColor).toEqual(symbol1.maskColor);

            let symbol2 = new MaskedImage({width: 15, height: 15, imageSource: 'url', maskSource: 'maskUrl', maskColor: 'black', anchorPoint: [10, -20]});
            let desc2 = symbolSerializer.serialize(symbol2);
            let deserialized2 = <MaskedImage>symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof MaskedImage).toBe(true);
            expect(deserialized2.width).toEqual(symbol2.width);
            expect(deserialized2.height).toEqual(symbol2.height);
            expect(deserialized2.anchorPoint).toEqual(symbol2.anchorPoint);
            expect(deserialized2.imageSource).toEqual(symbol2.imageSource);
            expect(deserialized2.maskSource).toEqual(symbol2.maskSource);
            expect(deserialized2.maskColor).toEqual(symbol2.maskColor);
        });

        it('polyline.Simple', () => {
            let symbol1 = new PolylineSymbol();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();

            let deserialized1 = <PolylineSymbol>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof PolylineSymbol).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);

            let symbol2 = new PolylineSymbol({strokeWidth: 99, strokeColor: 'green'});
            let desc2 = symbolSerializer.serialize(symbol2);

            let deserialized2 = <PolylineSymbol>symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
        });

        it('polygon.Simple', () => {
            let symbol1 = new PolygonSymbol();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.fillColor).toBeDefined();

            let deserialized1 = <PolygonSymbol>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof PolygonSymbol).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);

            let symbol2 = new PolygonSymbol({strokeWidth: 99, strokeColor: 'green', fillColor: 'purple'});
            let desc2 = symbolSerializer.serialize(symbol2);

            let deserialized2 = <PolygonSymbol>symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
        });

        it('polygon.BrushFill', () => {
            let symbol1 = new BrushFill();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.fillBrush).toBeDefined();
            expect(desc1.fillBackground).toBeDefined();
            expect(desc1.fillForeground).toBeDefined();

            let deserialized1 = <BrushFill>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof BrushFill).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.fillBrush).toEqual(symbol1.fillBrush);
            expect(deserialized1.fillBackground).toEqual(symbol1.fillBackground);
            expect(deserialized1.fillForeground).toEqual(symbol1.fillForeground);

            let symbol2 = new BrushFill({strokeWidth: 99, strokeColor: 'green', fillBrush: [[255]], fillForeground: 'blue', fillBackground: 'green'});
            let desc2 = symbolSerializer.serialize(symbol2);

            let deserialized2 = <BrushFill>symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.fillBrush).toEqual(symbol2.fillBrush);
            expect(deserialized2.fillBackground).toEqual(symbol2.fillBackground);
            expect(deserialized2.fillForeground).toEqual(symbol2.fillForeground);
        });

        it('polygon.ImageFill', () => {
            let symbol1 = new ImageFill();
            let desc1 = symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.src).toBeDefined();

            let deserialized1 = <ImageFill>symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof ImageFill).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.src).toEqual(symbol1.src);

            let symbol2 = new ImageFill({strokeWidth: 99, strokeColor: 'green', src: 'url'});
            let desc2 = symbolSerializer.serialize(symbol2);

            let deserialized2 = <ImageFill>symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.src).toEqual(symbol2.src);
        });

    });

});

