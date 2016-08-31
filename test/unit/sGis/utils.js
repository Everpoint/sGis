describe('utils', function() {
    describe('isArray', function () {
        it('should correctly distinguish array from not array', function () {
            expect(sGis.utils.isArray([])).toBeTruthy();
            expect(sGis.utils.isArray([1, 2])).toBeTruthy();
            expect(sGis.utils.isArray(['a', 'b'])).toBeTruthy();
            expect(sGis.utils.isArray([{hello: 'hello'}])).toBeTruthy();
            expect(sGis.utils.isArray([[[]]])).toBeTruthy();
            expect(sGis.utils.isArray([[], []])).toBeTruthy();
            expect(sGis.utils.isArray(1)).toBeFalsy();
            expect(sGis.utils.isArray('abc')).toBeFalsy();
            expect(sGis.utils.isArray({})).toBeFalsy();
            expect(sGis.utils.isArray(null)).toBeFalsy();
            expect(sGis.utils.isArray(undefined)).toBeFalsy();
            expect(sGis.utils.isArray(NaN)).toBeFalsy();
        });
    });

    describe('isString', function () {
        it('should correctly distinguish string from not string', function () {
            expect(sGis.utils.isString('hello')).toBeTruthy();
            expect(sGis.utils.isString('')).toBeTruthy();
            expect(sGis.utils.isString('123')).toBeTruthy();
            expect(sGis.utils.isString(123)).toBeFalsy();
            expect(sGis.utils.isString([])).toBeFalsy();
            expect(sGis.utils.isString(['absc'])).toBeFalsy();
            expect(sGis.utils.isString({})).toBeFalsy();
            expect(sGis.utils.isString(null)).toBeFalsy();
            expect(sGis.utils.isString()).toBeFalsy();
        });
    });

    describe('.copyObject()', function () {
        it('should copy all keys of the object and their values', function () {
            var obj = {a: undefined, b: null, c: 1, d: 'a', e: [1, 2], f: {a: 1, b: {c: 1, d: 2}}};
            var copy = sGis.utils.copyObject(obj);
            expect(obj).toEqual(copy);
            expect(copy).not.toBe(obj);
        });

        it('should copy Functions as Functions', function () {
            var obj = {
                a: function () {
                }
            };
            var copy = sGis.utils.copyObject(obj);
            expect(copy.a).toBe(obj.a);
        });
    });
});
