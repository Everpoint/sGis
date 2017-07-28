describe('sGis.Crs', () => {

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
