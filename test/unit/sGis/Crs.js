$(() => {

    describe('sGis.Crs', () => {

        it('should correctly check sameness', () => {
            var crs1 = new sGis.Crs('crs1');
            var crs2 = new sGis.Crs('crs2');
            expect(crs1.equals(crs2)).toBe(false);
            expect(crs2.equals(crs1)).toBe(false);

            var crs3 = new sGis.Crs('crs1');
            expect(crs1.equals(crs3)).toBe(true);
            expect(crs3.equals(crs1)).toBe(true);

            var crs4 = new sGis.Crs({ESPG: 123});
            var crs5 = new sGis.Crs({ESPG: 567});
            var crs6 = new sGis.Crs({ESPG: 567});

            expect(crs4.equals(crs5)).toBe(false);
            expect(crs5.equals(crs6)).toBe(true);
        });

        it('should find first-row projections', () => {
            var crs1 = new sGis.Crs('crs1');

            var projMap = new Map();
            projMap.set(crs1, ([x,y]) => { return [x,y]});
            var crs2 = new sGis.Crs('crs2', new Map(projMap));

            expect(typeof crs2.projectionTo(crs1)).toBe('function');
            expect(crs2.projectionTo(crs1)([1,2])).toEqual([1,2]);
        });

        it('should find second-row projections', () => {
            var crs1 = new sGis.Crs('crs1');

            var projMap = new Map();
            projMap.set(crs1, ([x,y]) => { return [x,y]});
            var crs2 = new sGis.Crs('crs2', projMap);

            var projMap2 = new Map();
            projMap2.set(crs2, ([x, y]) => { return [y,x]});
            var crs3 = new sGis.Crs('crs3', projMap2);

            expect(typeof crs3.projectionTo(crs1)).toBe('function');
            expect(crs3.projectionTo(crs1)([1,2])).toEqual([2,1]);
        });

    });

});