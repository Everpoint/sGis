'use strict';
$(function() {
    describe('sGis.symbol.point.Point', function() {
        describe('properties', function() {
            var symbol;

            beforeEach(function() {
                symbol = new sGis.symbol.point.Point();
            });

            describe('.type', function() {
                it('should be "point"', function() {
                    expect(symbol.type).toBe('point');
                });

                it('should be read only', function() {
                    expect(function() { symbol.type = 'polygon'; }).toThrow();
                });
            });

            describe('.size', function() {
                it('should have default value', function() {
                    expect(symbol.size).toBeTruthy();
                });

                it('should be set through constructor', function() {
                    var s = new sGis.symbol.point.Point({size: 15});
                    expect(s.size).toBe(15);
                    expect(symbol.size).not.toBe(15);
                });

                it('should be set through setter', function() {
                    var s = new sGis.symbol.point.Point();
                    s.size = 25;

                    expect(s.size).toBe(25);
                    expect(symbol.size).not.toBe(25);
                });
            });

        });
    });
});