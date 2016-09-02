describe('symbolSerializer', () => {

    describe('serialization and deserialization of symbols', () => {

        it('point.Point', () => {
            var symbol1 = new sGis.symbol.point.Point();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.size).toBeDefined();
            expect(desc1.fillColor).toBeDefined();
            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.offset).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.point.Point).toBe(true);
            expect(deserialized1.size).toEqual(symbol1.size);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.offset).toEqual(symbol1.offset);

            var symbol2 = new sGis.symbol.point.Point({size: 155, fillColor: 'red', strokeColor: 'blue', strokeWidth: 15, offset: {x: 10, y: -20}});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);
            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof sGis.symbol.point.Point).toBe(true);
            expect(deserialized2.size).toEqual(symbol2.size);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.offset).toEqual(symbol2.offset);
        });

        it('point.Square', () => {
            var symbol1 = new sGis.symbol.point.Square();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.size).toBeDefined();
            expect(desc1.fillColor).toBeDefined();
            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.offset).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.point.Square).toBe(true);
            expect(deserialized1.size).toEqual(symbol1.size);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.offset).toEqual(symbol1.offset);

            var symbol2 = new sGis.symbol.point.Square({size: 155, fillColor: 'red', strokeColor: 'blue', strokeWidth: 15, offset: {x: 10, y: -20}});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);
            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof sGis.symbol.point.Square).toBe(true);
            expect(deserialized2.size).toEqual(symbol2.size);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.offset).toEqual(symbol2.offset);
        });

        it('point.Image', () => {
            var symbol1 = new sGis.symbol.point.Image();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.width).toBeDefined();
            expect(desc1.height).toBeDefined();
            expect(desc1.anchorPoint).toBeDefined();
            expect(desc1.source).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.point.Image).toBe(true);
            expect(deserialized1.width).toEqual(symbol1.width);
            expect(deserialized1.height).toEqual(symbol1.height);
            expect(deserialized1.anchorPoint).toEqual(symbol1.anchorPoint);
            expect(deserialized1.source).toEqual(symbol1.source);

            var symbol2 = new sGis.symbol.point.Image({width: 15, height: 15, source: 'url', anchorPoint: {x: 10, y: -20}});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);
            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof sGis.symbol.point.Image).toBe(true);
            expect(deserialized2.width).toEqual(symbol2.width);
            expect(deserialized2.height).toEqual(symbol2.height);
            expect(deserialized2.anchorPoint).toEqual(symbol2.anchorPoint);
            expect(deserialized2.source).toEqual(symbol2.source);
        });

        it('point.MaskedImage', () => {
            var symbol1 = new sGis.symbol.point.MaskedImage();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.width).toBeDefined();
            expect(desc1.height).toBeDefined();
            expect(desc1.anchorPoint).toBeDefined();
            expect(desc1.imageSource).toBeDefined();
            expect(desc1.maskSource).toBeDefined();
            expect(desc1.maskColor).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.point.MaskedImage).toBe(true);
            expect(deserialized1.width).toEqual(symbol1.width);
            expect(deserialized1.height).toEqual(symbol1.height);
            expect(deserialized1.anchorPoint).toEqual(symbol1.anchorPoint);
            expect(deserialized1.imageSource).toEqual(symbol1.imageSource);
            expect(deserialized1.maskSource).toEqual(symbol1.maskSource);
            expect(deserialized1.maskColor).toEqual(symbol1.maskColor);

            var symbol2 = new sGis.symbol.point.MaskedImage({width: 15, height: 15, imageSource: 'url', maskSource: 'maskUrl', maskColor: 'black', anchorPoint: {x: 10, y: -20}});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);
            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2 instanceof sGis.symbol.point.MaskedImage).toBe(true);
            expect(deserialized2.width).toEqual(symbol2.width);
            expect(deserialized2.height).toEqual(symbol2.height);
            expect(deserialized2.anchorPoint).toEqual(symbol2.anchorPoint);
            expect(deserialized2.imageSource).toEqual(symbol2.imageSource);
            expect(deserialized2.maskSource).toEqual(symbol2.maskSource);
            expect(deserialized2.maskColor).toEqual(symbol2.maskColor);
        });

        it('polyline.Simple', () => {
            var symbol1 = new sGis.symbol.polyline.Simple();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.polyline.Simple).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);

            var symbol2 = new sGis.symbol.polyline.Simple({strokeWidth: 99, strokeColor: 'green'});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);

            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
        });

        it('polygon.Simple', () => {
            var symbol1 = new sGis.symbol.polygon.Simple();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.fillColor).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.polygon.Simple).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.fillColor).toEqual(symbol1.fillColor);

            var symbol2 = new sGis.symbol.polygon.Simple({strokeWidth: 99, strokeColor: 'green', fillColor: 'purple'});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);

            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.fillColor).toEqual(symbol2.fillColor);
        });

        it('polygon.BrushFill', () => {
            var symbol1 = new sGis.symbol.polygon.BrushFill();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.fillBrush).toBeDefined();
            expect(desc1.fillBackground).toBeDefined();
            expect(desc1.fillForeground).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.polygon.BrushFill).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.fillBrush).toEqual(symbol1.fillBrush);
            expect(deserialized1.fillBackground).toEqual(symbol1.fillBackground);
            expect(deserialized1.fillForeground).toEqual(symbol1.fillForeground);

            var symbol2 = new sGis.symbol.polygon.BrushFill({strokeWidth: 99, strokeColor: 'green', fillBrush: [255], fillForeground: 'blue', fillBackground: 'green'});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);

            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.fillBrush).toEqual(symbol2.fillBrush);
            expect(deserialized2.fillBackground).toEqual(symbol2.fillBackground);
            expect(deserialized2.fillForeground).toEqual(symbol2.fillForeground);
        });

        it('polygon.ImageFill', () => {
            var symbol1 = new sGis.symbol.polygon.ImageFill();
            var desc1 = sGis.serializer.symbolSerializer.serialize(symbol1);

            expect(desc1.strokeColor).toBeDefined();
            expect(desc1.strokeWidth).toBeDefined();
            expect(desc1.src).toBeDefined();

            var deserialized1 = sGis.serializer.symbolSerializer.deserialize(desc1);

            expect(deserialized1 instanceof sGis.symbol.polygon.ImageFill).toBe(true);
            expect(deserialized1.strokeColor).toEqual(symbol1.strokeColor);
            expect(deserialized1.strokeWidth).toEqual(symbol1.strokeWidth);
            expect(deserialized1.src).toEqual(symbol1.src);

            var symbol2 = new sGis.symbol.polygon.ImageFill({strokeWidth: 99, strokeColor: 'green', src: 'url'});
            var desc2 = sGis.serializer.symbolSerializer.serialize(symbol2);

            var deserialized2 = sGis.serializer.symbolSerializer.deserialize(desc2);

            expect(deserialized2.strokeColor).toEqual(symbol2.strokeColor);
            expect(deserialized2.strokeWidth).toEqual(symbol2.strokeWidth);
            expect(deserialized2.src).toEqual(symbol2.src);
        });

    });

});

