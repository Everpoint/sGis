describe('sGis.Bbox', () => {

    let bbox;
    beforeEach(() => {
        bbox = new sGis.Bbox([0, 0], [10, 10]);
    })

    describe('constructor', () => {
        it('should have geo crs by default', () => {
            expect(new sGis.Bbox([0, 0], [10, 10]).crs).toBe(sGis.CRS.geo);
        });
    });

    describe('.intersects()', () => {
        it('should return true if bboxes have intersecting areas', () => {
            expect(new sGis.Bbox([-5, -5], [5, 5]).intersects(bbox)).toBe(true);
        });

        it('should return true if target bbox is inside source one', () => {
            expect(new sGis.Bbox([2, 2], [8, 8]).intersects(bbox)).toBe(true);
        });

        it('should return true if source bbox is inside target one', () => {
            expect(new sGis.Bbox([-2, -2], [12, 12]).intersects(bbox)).toBe(true);
        });
    });

});