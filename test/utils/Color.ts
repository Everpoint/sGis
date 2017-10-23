import "jest"
import {Color} from "../../source/utils/Color"

describe('sGis.utils.Color',() =>{
    describe('setHsv', () =>{
        it('should correctly parse hsv color into rgb', () => {
            expect(new Color('').setHsv(120, 60, 30).channels).toEqual({r: 31, g: 77, b: 31, a: 0});
            expect(new Color('').setHsv(360, 0, 100).channels).toEqual({r: 255, g: 255, b: 255, a: 0});
            expect(new Color('').setHsv(15, 25, 45).channels).toEqual({r: 115, g: 93, b: 86, a: 0});
        });
        it('should correctly set hue, saturation and value', () =>{
            expect(new Color('#fdbcae').h).toEqual(11);
            expect(new Color('#fdbcae').s).toEqual(31);
            expect(new Color('#fdbcae').v).toEqual(99);
        });

        it('should correctly display type of hsl color', () => {
            expect(new Color('hsv(123, 12, 34)').format).toEqual('hsv');
        });
    });
});