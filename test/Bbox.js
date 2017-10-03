"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
var Bbox_1 = require("../source/Bbox");
var Crs_1 = require("../source/Crs");
describe('sGis.Bbox', function () {
    var bbox;
    beforeEach(function () {
        bbox = new Bbox_1.Bbox([0, 0], [10, 10]);
    });
    describe('constructor', function () {
        test('should have geo crs by default', function () {
            expect(new Bbox_1.Bbox([0, 0], [10, 10]).crs).toBe(Crs_1.geo);
        });
    });
    describe('.intersects()', function () {
        test('should return true if bboxes have intersecting areas', function () {
            expect(new Bbox_1.Bbox([-5, -5], [5, 5]).intersects(bbox)).toBe(true);
        });
        test('should return true if target bbox is inside source one', function () {
            expect(new Bbox_1.Bbox([2, 2], [8, 8]).intersects(bbox)).toBe(true);
        });
        test('should return true if source bbox is inside target one', function () {
            expect(new Bbox_1.Bbox([-2, -2], [12, 12]).intersects(bbox)).toBe(true);
        });
    });
});
