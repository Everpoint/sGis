describe('LayerGroup', function() {
    describe('constructor', function () {
        it('should correctly create simple LayerGroup instance', function () {
            const emptyGroup = new sGis.LayerGroup();

            const dynamicLayer = new sGis.DynamicLayer();
            const tileLayer = new sGis.TileLayer();

            const nonEmptyGroup = new sGis.LayerGroup([dynamicLayer, tileLayer]);

            expect(emptyGroup).toEqual(jasmine.any(sGis.LayerGroup));
            expect(nonEmptyGroup).toEqual(jasmine.any(sGis.LayerGroup));

            expect(emptyGroup.layers).toBeEmptyArray();
            expect(nonEmptyGroup.layers).toBeNonEmptyArray();
        });

        it('should correctly create nested LayerGroup instance', function () {
            const nestedGroup = new sGis.LayerGroup([
                new sGis.LayerGroup([ new sGis.DynamicLayer(), new sGis.DynamicLayer() ]),
                new sGis.DynamicLayer()
            ]);

            expect(nestedGroup).toEqual(jasmine.any(sGis.LayerGroup));
        })
    });
});
