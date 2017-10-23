import "jest";
import {Bbox} from "../source/Bbox";
import {geo} from "../source/Crs";

describe('sGis.Bbox', function() {

    let bbox;
    beforeEach(function() {
        bbox = new Bbox([0, 0], [10, 10]);
    });

    describe('constructor', function() {
        test('should have geo crs by default', () => {
            expect(new Bbox([0, 0], [10, 10]).crs).toBe(geo);
        });
    });

    describe('.intersects()', () => {
        test('should return true if bboxes have intersecting areas', function() {
            expect(new Bbox([-5, -5], [5, 5]).intersects(bbox)).toBe(true);
        });

        test('should return true if target bbox is inside source one', function() {
            expect(new Bbox([2, 2], [8, 8]).intersects(bbox)).toBe(true);
        });

        test('should return true if source bbox is inside target one', function() {
            expect(new Bbox([-2, -2], [12, 12]).intersects(bbox)).toBe(true);
        });
    });

});