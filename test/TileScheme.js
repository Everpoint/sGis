describe('TileScheme', () => {

    describe('.levels', () => {
        it('should sort levels by resolution', () => {
            let scheme = new sGis.TileScheme();
            scheme.levels = [
                { resolution: 20 },
                { resolution: 10 },
                { resolution: 40 }
            ];

            expect(scheme.levels[0].resolution).toBe(10);
            expect(scheme.levels[1].resolution).toBe(20);
            expect(scheme.levels[2].resolution).toBe(40);
        });

    });

    describe('.getLevel()', () => {
        let scheme;
        beforeEach(() => {
            scheme = new sGis.TileScheme({levels: [
                { resolution: 10 },
                { resolution: 20 },
                { resolution: 40 }
            ]});
        });

        it('should throw exception if no levels are set', () => {
            let tileScheme = new sGis.TileScheme();
            expect(() => { tileScheme.getLevel(0); }).toThrow();
            expect(() => { tileScheme.getLevel(10); }).toThrow();
        });

        it('should return the closest level with resolution equal to or larger then given', () => {
            expect(scheme.getLevel(0)).toBe(0);
            expect(scheme.getLevel(1)).toBe(0);
            expect(scheme.getLevel(9.999)).toBe(0);
            expect(scheme.getLevel(10)).toBe(0);
            expect(scheme.getLevel(11)).toBe(1);
            expect(scheme.getLevel(19.99)).toBe(1);
            expect(scheme.getLevel(20)).toBe(1);
            expect(scheme.getLevel(35)).toBe(2);
            expect(scheme.getLevel(40)).toBe(2);
        });

        it('should return the last level index if the resolution is larger then the largest one', () => {
            expect(scheme.getLevel(45)).toBe(2);
            expect(scheme.getLevel(100)).toBe(2);
            expect(scheme.getLevel(999999999)).toBe(2);
        });

        it('should consider resolutions equal if difference is less then math.tolerance', () => {
            expect(scheme.getLevel(10 + sGis.math.tolerance)).toBe(0);
            expect(scheme.getLevel(10 + sGis.math.tolerance/2)).toBe(0);
        });
    });

});