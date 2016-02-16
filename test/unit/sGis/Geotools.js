$(function() {

    describe('Geotools', function() {
        describe('.contains()', function() {
            var simplePolygon = [[-10, -10], [0, 10], [10, -10]];
            var polygon = [[[-10, -10], [0, 10], [10, -10]], [[20, -10], [20, 10], [30, 10], [30, -10]]];
            var point = [0, 0];

            it('should throw exception in case of missing parameters', function() {
                expect(function() { sGis.geotools.contains(); }).toThrow();
                expect(function() { sGis.geotools.contains([[[1, 1], [2, 2]]]); }).toThrow();
                expect(function() { sGis.geotools.contains(undefined, [1, 1]); }).toThrow();
            });

            it('should throw exception in case of incorrect polygon format', function() {
                expect(function() { sGis.geotools.contains(1, point); }).toThrow();
                expect(function() { sGis.geotools.contains('1, 1', point); }).toThrow();
                expect(function() { sGis.geotools.contains({x: 1, y: 1}, point); }).toThrow();
                expect(function() { sGis.geotools.contains(null, point); }).toThrow();
                expect(function() { sGis.geotools.contains([1, 1], point); }).toThrow();
                expect(function() { sGis.geotools.contains([], point); }).toThrow();
            });

            it('should throw exception in case of incorrect point format', function() {
                expect(function() { sGis.geotools.contains(polygon, 1); }).toThrow();
                expect(function() { sGis.geotools.contains(polygon, '1, 1'); }).toThrow();
                expect(function() { sGis.geotools.contains(polygon, {x: 1, y: 1}); }).toThrow();
                expect(function() { sGis.geotools.contains(polygon, null); }).toThrow();
            });

            it('should return true if the point is inside of polygon', function() {
                expect(sGis.geotools.contains(polygon, point)).toBe(true);
                expect(sGis.geotools.contains(polygon, [0, 9])).toBe(true);
                expect(sGis.geotools.contains(polygon, [-9, -9])).toBe(true);
                expect(sGis.geotools.contains(polygon, [9, -9])).toBe(true);
            });

            it('should return true if the point is inside of any ring of polygon', function() {
                expect(sGis.geotools.contains(polygon, [25, 0])).toBe(true);
                expect(sGis.geotools.contains(polygon, [21, -9])).toBe(true);
                expect(sGis.geotools.contains(polygon, [21, 9])).toBe(true);
                expect(sGis.geotools.contains(polygon, [29, 9])).toBe(true);
                expect(sGis.geotools.contains(polygon, [29, -9])).toBe(true);
            });

            it('should return [ring, index] if the point is on one of the sides', function() {
                expect(sGis.geotools.contains(polygon, [0, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(polygon, [-9, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(polygon, [9, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(polygon, [-5, 0])).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, [5, 0])).toEqual([0,1]);
            });

            it('should return [ring, index] if the point is on a side of any ring of polygon', function() {
                expect(sGis.geotools.contains(polygon, [20, 0])).toEqual([1,0]);
                expect(sGis.geotools.contains(polygon, [25, 10])).toEqual([1,1]);
                expect(sGis.geotools.contains(polygon, [30, 9])).toEqual([1,2]);
                expect(sGis.geotools.contains(polygon, [21, -10])).toEqual([1,3]);
            });

            it('should return [ring, index] if the point is one of the points of the polygon', function() {
                expect(sGis.geotools.contains(polygon, polygon[0][0])).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, polygon[0][1])).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, polygon[0][2])).toEqual([0,1]);
            });

            it('should return tr[ring, index]ue if the point is one of the points of any ring of the polygon', function() {
                expect(sGis.geotools.contains(polygon, polygon[1][0])).toEqual([1,0]);
                expect(sGis.geotools.contains(polygon, polygon[1][1])).toEqual([1,0]);
                expect(sGis.geotools.contains(polygon, polygon[1][2])).toEqual([1,1]);
                expect(sGis.geotools.contains(polygon, polygon[1][3])).toEqual([1,2]);
            });

            it('should return false if the point is outside the polygon', function() {
                expect(sGis.geotools.contains(polygon, [-100, -100])).toBe(false);
                expect(sGis.geotools.contains(polygon, [-10, 0])).toBe(false);
                expect(sGis.geotools.contains(polygon, [-5, 8])).toBe(false);
                expect(sGis.geotools.contains(polygon, [0, 11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [5, 8])).toBe(false);
                expect(sGis.geotools.contains(polygon, [11, -10])).toBe(false);
                expect(sGis.geotools.contains(polygon, [10, -11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [0, -11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [-10, -11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [20, -11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [20, 11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [31, 11])).toBe(false);
                expect(sGis.geotools.contains(polygon, [31, -11])).toBe(false);
            });

            it('should correctly understand 3 points in line', function() {
                var poly = [[[0, 0], [0, 10], [0, 20], [10, 10]]];
                expect(sGis.geotools.contains(poly, [0, -5])).toBe(false);
                expect(sGis.geotools.contains(poly, [0, 5])).toEqual([0,0]);
                expect(sGis.geotools.contains(poly, [0, 15])).toEqual([0,1]);
                expect(sGis.geotools.contains(poly, [0, 25])).toBe(false);

                poly = [[[0, 0], [10, 0], [20, 0], [10, 10]]];
                expect(sGis.geotools.contains(poly, [-5, 0])).toBe(false);
                expect(sGis.geotools.contains(poly, [5, 0])).toEqual([0,0]);
                expect(sGis.geotools.contains(poly, [15, 0])).toEqual([0,1]);
                expect(sGis.geotools.contains(poly, [25, 0])).toBe(false);
            });

            it('should correctly work with 1-ring polygons', function() {
                expect(sGis.geotools.contains(simplePolygon, point)).toBe(true);
                expect(sGis.geotools.contains(simplePolygon, [0, 9])).toBe(true);
                expect(sGis.geotools.contains(simplePolygon, [-9, -9])).toBe(true);
                expect(sGis.geotools.contains(simplePolygon, [9, -9])).toBe(true);
                expect(sGis.geotools.contains(simplePolygon, [0, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(simplePolygon, [-9, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(simplePolygon, [9, -10])).toEqual([0,2]);
                expect(sGis.geotools.contains(simplePolygon, [-5, 0])).toEqual([0,0]);
                expect(sGis.geotools.contains(simplePolygon, [5, 0])).toEqual([0,1]);
                expect(sGis.geotools.contains(simplePolygon, simplePolygon[0])).toEqual([0,0]);
                expect(sGis.geotools.contains(simplePolygon, simplePolygon[1])).toEqual([0,0]);
                expect(sGis.geotools.contains(simplePolygon, simplePolygon[2])).toEqual([0,1]);
                expect(sGis.geotools.contains(simplePolygon, [-100, -100])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [-10, 0])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [-5, 8])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [0, 11])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [5, 8])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [11, -10])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [10, -11])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [0, -11])).toBe(false);
                expect(sGis.geotools.contains(simplePolygon, [-10, -11])).toBe(false);
            });

            it('should return true if the point is closer to polygon then tolerance', function() {
                expect(sGis.geotools.contains(polygon, point, 1)).toBe(true);
                expect(sGis.geotools.contains(polygon, [-9, -10], 1)).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, [-10, -10], 1)).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, [-6, 0], 1)).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, [0, 11], 1)).toEqual([0,0]);
                expect(sGis.geotools.contains(polygon, [0, -11], 1)).toEqual([0,2]);
                expect(sGis.geotools.contains(polygon, [0, -11.001], 1)).toBe(false);
            });
        });

        describe('.getPointFromAngleAndDistance()', function() {
            it('should return a point with specified parameters', function() {
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], 0, 1)).toEqual([1,0]);
                expect(sGis.geotools.getPointFromAngleAndDistance([5,7], 0, 1)).toEqual([6,7]);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], 0, 7)).toEqual([7,0]);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], 0, -5)).toEqual([-5,0]);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], Math.PI, 1)[0]).toBeCloseTo(-1);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], Math.PI, 1)[1]).toBeCloseTo(0);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], Math.PI / 2, 1)[0]).toBeCloseTo(0);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], Math.PI / 2, 1)[1]).toBeCloseTo(1);
                expect(sGis.geotools.getPointFromAngleAndDistance([0,0], 0, 0)).toEqual([0,0]);
                expect(sGis.geotools.getPointFromAngleAndDistance([3,8], Math.PI * 2, 0)).toEqual([3,8]);
            });
        });

        describe('.getLineAngle()', function() {
            it('should return the line angle', function() {
                expect(sGis.geotools.getLineAngle([[0,0],[1,0]])).toBe(0);
                expect(sGis.geotools.getLineAngle([[0,0],[0,1]])).toBeCloseTo(Math.PI / 2);
                expect(sGis.geotools.getLineAngle([[1,0],[0,1]])).toBeCloseTo(Math.PI * 3 / 4);
                expect(sGis.geotools.getLineAngle([[0,1],[1,0]])).toBeCloseTo(-Math.PI / 4);
            });
        });

        describe('.isPolygonValid()', function() {
            it('should return true if the polygon is valid', function() {
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,10], [10,0]]])).toBe(true);
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,0]]])).toBe(true);
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,10], [10,0]], [[1,1], [1,9], [9,9], [9,1]]])).toBe(true);
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,10], [10,0]], [[100,100], [100,900], [900,900], [900,100]]])).toBe(true);
            });

            it('should return false if the number of edges in one of the polygon rings is less then 3', function() {
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10]]])).toBe(false);
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,10], [10,0]], [[1,1], [1,9]]])).toBe(false);
            });

            it('should return false if one of the rings has self-intersections', function() {
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,0], [10,10]]])).toBe(false);
                expect(sGis.geotools.isPolygonValid([[[[0,0], [0,10], [10,10], [10,0]], [[1,1], [1,9], [9,1], [9,9]]]])).toBe(false);
            });

            it('should return false if the rings intersect each other', function() {
                expect(sGis.geotools.isPolygonValid([[[0,0], [0,10], [10,10], [10,0]], [[1,1], [11,9], [9,1], [9,9]]])).toBe(false);
            });
        });
    });
});
