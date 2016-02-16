'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');

    /*
     * Utils module tests
     */
    
    describe('utils.html', function() {
        it('should insert the html properly', function() {
            var table = document.createElement('table');
            utils.html(table, '<tbody><tr><td>1</td><td>2</td></tr></tbody>');
            
            expect(table.childNodes.length).toBe(1);
        });
    });
    
});