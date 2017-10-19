describe('sGis.utils.Color',() =>{
    let color;
 describe('setHsv', () =>{
     it('should correctly parse hsv color into rgb', () => {
         expect(new sGis.utils.Color().setHsv(120, 60, 30)).toEqual([31, 77, 31]);
         expect(new sGis.utils.Color().setHsv(360, 0, 100)).toEqual([255, 255, 255]);
         expect(new sGis.utils.Color().setHsv(15, 25, 45)).toEqual([115, 93, 86]);
     });
     it('should correctly set hue, saturation and value', () =>{
         expect(new sGis.utils.Color('#fdbcae').h).toEqual(11);
         expect(new sGis.utils.Color('#fdbcae').s).toEqual(31);
         expect(new sGis.utils.Color('#fdbcae').v).toEqual(99);
     });

     it('should correctly display type of hsl color', () => {
         expect(new sGis.utils.Color('hsv(123, 12, 34)').format).toEqual('hsv');
     });
 });
});