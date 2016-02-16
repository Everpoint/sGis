/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function() {
    $(document.body).html('');
    utils.css = {
        transition: document.body.style.transition !== undefined ? {func: 'transition', rule: 'transition'} : 
                    document.body.style.webkitTransition !== undefined ? {func: 'webkitTransition', rule: '-webkit-transition'} : 
                    document.body.style.msTransition !== undefined ? {fund: 'msTransition', rule: '-ms-transition'} :
                    null,
        transform:  document.body.style.transform !== undefined ? {func: 'transform', rule: 'transform'} : 
                    document.body.style.webkitTransform !== undefined ? {func: 'webkitTransform', rule: '-webkit-transform'} : 
                    document.body.style.msTransform !== undefined ? {func: 'msTransform', rule: '-ms-ransform'} : null
    };
});

$(document).ready(function() {
    
    describe('Layer Tree', function() {
        describe('creation', function() {
            $(document.body).html('<div id="tree"></div>');
            var wrapper = $('#tree');
            
            var rootMapItem = new sGis.mapItem.Folder(),
                child1 = new sGis.mapItem.Folder({name: 'child1'}),
                child2 = new sGis.mapItem.Folder({name: 'child2'}),
                child3 = new sGis.mapItem.Folder({name: 'child3'}),
                child4 = new sGis.mapItem.Folder({name: 'child4'}),
                child5 = new sGis.mapItem.Folder({name: 'child5'});
            
            beforeEach(function() {
                rootMapItem.removeChildren();
                rootMapItem.addChildren([child1, child2, child3]);
            });
            
            
            var tree = new sGis.ui.LayerTree(rootMapItem, wrapper);
                
            it('should be created with default settings', function() {
                expect(function() {new sGis.ui.LayerTree();}).toThrow();
                expect(function() {new sGis.ui.LayerTree('notMapItem', wrapper);}).toThrow();
                expect(function() {new sGis.ui.LayerTree(rootMapItem, 'not a wrapper');}).toThrow();

                expect(tree).toBeDefined();
                
                var rows = tree.getRows();
                expect(rows.length).toBe(3);
                expect(rows[0].mapItem).toBe(child1);
                expect(rows[2].mapItem).toBe(child3);
            });
            
            it('should add and delete rows synchronous to root map item', function() {
                rootMapItem.addChild(child4);
                
                var rows = tree.getRows();
                expect(rows.length).toBe(4);
                expect(rows[3].mapItem).toBe(child4);
                
                rootMapItem.removeChild(child2);
                expect(rows.length).toBe(4);
                
                rows = tree.getRows();
                expect(rows[0].mapItem).toBe(child1);
                expect(rows[1].mapItem).toBe(child3);
                expect(rows[2].mapItem).toBe(child4);
                
                rootMapItem.addChildren([child2, child5]);
                rows = tree.getRows();
                expect(rows.length).toBe(5);
                expect(rows[3].mapItem).toBe(child2);
                expect(rows[4].mapItem).toBe(child5);
            });
            
            it('should change order according to root map item order', function() {
                rootMapItem.moveChildToIndex(child3, 0);
                
                var rows = tree.getRows();
                expect(rows.length).toBe(3);
                expect(rows[0].mapItem).toBe(child3);
                expect(rows[1].mapItem).toBe(child1);
                expect(rows[2].mapItem).toBe(child2);
                
                rootMapItem.moveChildToIndex(child1, 3);
                
                rows = tree.getRows();
                expect(rows.length).toBe(3);
                expect(rows[0].mapItem.name).toBe('child3');
                expect(rows[1].mapItem.name).toBe('child2');
                expect(rows[2].mapItem.name).toBe('child1');
            });
        });
    });

//    describe('Application', function() {
//        describe('creation', function() {
//            it('should be created with default settings', function() {
//                var loaded, application;
//                runs(function() {
//                    application = new sGis.Application();
//                    
//                    loaded = !!application._mapItems;
//                    
//                    application.addListener('loaded', function() {
//                        loaded = true;
//                    });
//                });
//                
//                waitsFor(function() {
//                    return loaded;
//                }, 'should be loaded in reasonable time', 5000);
//                
//                runs(function() {
//                    expect(application).toBeDefined();
//                });
//            });
//        });
//    });

});