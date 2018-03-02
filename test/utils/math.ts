import "jest"
import {simplifyCoordinates} from "../../source/utils/math";
import {Contour} from "../../source/baseTypes";

describe('math', () => {
    describe('.simplifyCoordinates()', () => {
        it('should keep the last point of the polygon', () => {
            let poly: Contour[] = [[[0, 0], [10, 0], [10, 10], [0, 10]]];
            let simplified = simplifyCoordinates(poly, 1);
            expect(simplified).toEqual(poly);
        })
    })
});