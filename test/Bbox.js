describe('sGis.Bbox', () => {

    it('should have geo crs by default', () => {
        expect(new sGis.Bbox([], []).crs).toBe(sGis.CRS.geo);
    });

});