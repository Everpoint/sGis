import "jest";
import {TileScheme} from "../source/TileScheme";
import {tolerance} from "../source/utils/math";

describe('TileScheme', () => {

    describe('.levels', () => {
        it('should sort levels by resolution', () => {
            let levels = [
                {resolution: 20, zIndex: 0, indexCount: 4},
                {resolution: 10, zIndex: 1, indexCount: 2},
                {resolution: 40, zIndex: 2, indexCount: 8}
            ];
            let scheme = new TileScheme({origin: [0, 0], levels: levels});

            expect(scheme.levels[0].resolution).toBe(10);
            expect(scheme.levels[1].resolution).toBe(20);
            expect(scheme.levels[2].resolution).toBe(40);
        });

    });

    describe('.getLevel()', () => {
        let scheme;
        beforeEach(() => {
            let levels = [
                {resolution: 20, zIndex: 0, indexCount: 4},
                {resolution: 10, zIndex: 1, indexCount: 2},
                {resolution: 40, zIndex: 2, indexCount: 8}
            ];

            scheme = new TileScheme({levels, origin: [0, 0]});
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
            expect(scheme.getLevel(10 + tolerance)).toBe(0);
            expect(scheme.getLevel(10 + tolerance / 2)).toBe(0);
        });
    });

    describe('resolution limits', () => {
        let scheme;
        beforeEach(() => {
            let levels = [
                {resolution: 20, zIndex: 0, indexCount: 4},
                {resolution: 10, zIndex: 1, indexCount: 2},
                {resolution: 40, zIndex: 2, indexCount: 8}
            ];

            scheme = new TileScheme({levels, origin: [0, 0]});
        });

        it('.maxResolution should return maximum resolution', () => {
            expect(scheme.maxResolution).toBe(40);
        });

        it('.minResolution should return minimum resolution', () => {
            expect(scheme.minResolution).toBe(10);
        });
    });

});