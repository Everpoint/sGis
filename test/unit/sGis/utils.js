'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    /*
     * Utils module tests
     */
    
    describe('utils', function() {
        describe('isArray', function() {
            it('should correctly destinguish array from not array', function() {
                expect(utils.isArray([])).toBeTruthy();
                expect(utils.isArray([1, 2])).toBeTruthy();
                expect(utils.isArray(['a', 'b'])).toBeTruthy();
                expect(utils.isArray([{hello: 'hello'}])).toBeTruthy();
                expect(utils.isArray([[[]]])).toBeTruthy();
                expect(utils.isArray([[], []])).toBeTruthy();
                expect(utils.isArray(1)).toBeFalsy();
                expect(utils.isArray('abc')).toBeFalsy();
                expect(utils.isArray({})).toBeFalsy();
                expect(utils.isArray(null)).toBeFalsy();
                expect(utils.isArray(undefined)).toBeFalsy();
                expect(utils.isArray(NaN)).toBeFalsy();
            });
        });
        
        describe('isString', function() {
            it('should correctly distinguish string from not string', function() {
                expect(utils.isString('hello')).toBeTruthy();
                expect(utils.isString('')).toBeTruthy();
                expect(utils.isString('123')).toBeTruthy();
                expect(utils.isString(123)).toBeFalsy();
                expect(utils.isString([])).toBeFalsy();
                expect(utils.isString(['absc'])).toBeFalsy();
                expect(utils.isString({})).toBeFalsy();
                expect(utils.isString(null)).toBeFalsy();
                expect(utils.isString()).toBeFalsy();
            });
        });

        describe('.copyObject()', function() {
            it('should copy all keys of the object and their values', function() {
                var obj = {a: undefined, b: null, c: 1, d: 'a', e: [1, 2], f: {a: 1, b: {c: 1, d: 2}}};
                var copy = utils.copyObject(obj);
                expect(obj).toEqual(copy);
                expect(copy).not.toBe(obj);
            });

            it('should copy Functions as Functions', function() {
                var obj = {a: function() {}};
                var copy = utils.copyObject(obj);
                expect(copy.a).toBe(obj.a);
            });
        });
    });
});