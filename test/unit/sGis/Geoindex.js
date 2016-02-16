$(function() {

    describe('Geoindex', function() {
        describe('Node', function() {
            it('should be created with empty list', function() {
                var node = new sGis.geoIndex.Node([]);
                expect(node).toBeDefined();
            });
        });
    });

});