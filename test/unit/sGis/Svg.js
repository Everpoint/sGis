$(function() {

    describe('sGis.utils.svg', function() {
        describe('.base()', function() {
            it('should return an svg element', function() {
                var svg = sGis.utils.svg.base();
                expect(svg instanceof SVGSVGElement).toBe(true);
            });

            it('should set the parameters width, height, x and y', function() {
                var svg = sGis.utils.svg.base({width: 200, height: 300, x: 100, y: 150});
                expect(svg.getAttribute('width')).toBe('200');
                expect(svg.getAttribute('height')).toBe('300');
                expect(svg.getAttribute('x')).toBe('100');
                expect(svg.getAttribute('y')).toBe('150');
            });
        });

        describe('.path()', function() {
            it('should return an svg element', function() {
                var path = sGis.utils.svg.path({});
                expect(path instanceof SVGSVGElement).toBe(true);
            });

            it('should have a path element as its only child', function() {
                var path = sGis.utils.svg.path({});
                expect(path.childNodes[0] instanceof SVGPathElement).toBe(true);
                expect(path.childNodes.length).toBe(1);
            });

            it('should set the given parameters as attributes of path element', function() {
                var path = sGis.utils.svg.path({d: 'M50 50'});
                expect(path.childNodes[0].getAttribute('d')).toBe('M50 50');
            });

            it('should set the width and height of the element according to the bbox of the path + its width', function() {
                var path = sGis.utils.svg.path({d: ''})
            });

            it('should set the stroke-opacity attribute for rgba colors', function() {
                var path = sGis.utils.svg.path({stroke: 'rgba(10, 10, 10, 0.5)'});
                expect(path.childNodes[0].getAttribute('stroke')).toBe('rgb(10,10,10)');
                expect(path.childNodes[0].getAttribute('stroke-opacity')).toBe('0.5');

                var path1 = sGis.utils.svg.path({stroke: 'rgba(10,10,10,1)'});
                expect(path1.childNodes[0].getAttribute('stroke')).toBe('rgb(10,10,10)');
                expect(path1.childNodes[0].getAttribute('stroke-opacity')).toBe(null);
            });

            it('should set the stroke-opacity attribute for rgba colors', function() {
                var path = sGis.utils.svg.path({fill: 'rgba(10, 10, 10, 0.5)'});
                expect(path.childNodes[0].getAttribute('fill')).toBe('rgb(10,10,10)');
                expect(path.childNodes[0].getAttribute('fill-opacity')).toBe('0.5');

                var path1 = sGis.utils.svg.path({fill: 'rgba(10,10,10,1)'});
                expect(path1.childNodes[0].getAttribute('fill')).toBe('rgb(10,10,10)');
                expect(path1.childNodes[0].getAttribute('fill-opacity')).toBe(null);
            });

            it('should correctly interpret transparent color', function() {
                var path = sGis.utils.svg.path({stroke: 'transparent', fill: 'transparent'});
                expect(path.childNodes[0].getAttribute('stroke')).toBe('rgb(0,0,0)');
                expect(path.childNodes[0].getAttribute('fill')).toBe('rgb(0,0,0)');
                expect(path.childNodes[0].getAttribute('stroke-opacity')).toBe('0');
                expect(path.childNodes[0].getAttribute('fill-opacity')).toBe('0');
            });

            it('should set the width, height and viewBox attributes to the svg element', function() {
                var path = sGis.utils.svg.path({stroke: 'red', width: 10, height: 20, viewBox: '10 20 30 40'});
                expect(path.childNodes[0].getAttribute('stroke')).toBe('red');
                expect(path.childNodes[0].getAttribute('width')).toBe(null);
                expect(path.childNodes[0].getAttribute('height')).toBe(null);
                expect(path.childNodes[0].getAttribute('viewBox')).toBe(null);

                expect(path.getAttribute('stroke')).toBe(null);
                expect(path.getAttribute('width')).toBe('10');
                expect(path.getAttribute('height')).toBe('20');
                expect(path.getAttribute('viewBox')).toBe('10 20 30 40');
            });
        });

        describe('.circle()', function() {
            it('should return an svg element', function() {
                var circle = sGis.utils.svg.circle();
                expect(circle instanceof SVGSVGElement).toBe(true);
            });

            it('should have a circle element as its only child', function() {
                var circle = sGis.utils.svg.circle();
                expect(circle.childNodes[0] instanceof SVGCircleElement).toBe(true);
                expect(circle.childNodes.length).toBe(1);
            });

            it('should set the given parameters as attributes of path element', function() {
                var circle = sGis.utils.svg.circle({r: 30});
                expect(circle.childNodes[0].getAttribute('r')).toBe('30');
            });

            it('should set the stroke-opacity attribute for rgba colors', function() {
                var circle = sGis.utils.svg.circle({stroke: 'rgba(10, 10, 10, 0.5)'});
                expect(circle.childNodes[0].getAttribute('stroke')).toBe('rgb(10,10,10)');
                expect(circle.childNodes[0].getAttribute('stroke-opacity')).toBe('0.5');

                var circle1 = sGis.utils.svg.circle({stroke: 'rgba(10,10,10,1)'});
                expect(circle1.childNodes[0].getAttribute('stroke')).toBe('rgb(10,10,10)');
                expect(circle1.childNodes[0].getAttribute('stroke-opacity')).toBe(null);
            });

            it('should set the stroke-opacity attribute for rgba colors', function() {
                var circle = sGis.utils.svg.circle({fill: 'rgba(10, 10, 10, 0.5)'});
                expect(circle.childNodes[0].getAttribute('fill')).toBe('rgb(10,10,10)');
                expect(circle.childNodes[0].getAttribute('fill-opacity')).toBe('0.5');

                var circle1 = sGis.utils.svg.circle({fill: 'rgba(10,10,10,1)'});
                expect(circle1.childNodes[0].getAttribute('fill')).toBe('rgb(10,10,10)');
                expect(circle1.childNodes[0].getAttribute('fill-opacity')).toBe(null);
            });

            it('should correctly interpret transparent color', function() {
                var circle = sGis.utils.svg.circle({stroke: 'transparent', fill: 'transparent'});
                expect(circle.childNodes[0].getAttribute('stroke')).toBe('rgb(0,0,0)');
                expect(circle.childNodes[0].getAttribute('fill')).toBe('rgb(0,0,0)');
                expect(circle.childNodes[0].getAttribute('stroke-opacity')).toBe('0');
                expect(circle.childNodes[0].getAttribute('fill-opacity')).toBe('0');
            });

            it('should set the width, height and viewBox attributes to the svg element', function() {
                var circle = sGis.utils.svg.circle({stroke: 'red', width: 10, height: 20, viewBox: '10 20 30 40'});
                expect(circle.childNodes[0].getAttribute('stroke')).toBe('red');
                expect(circle.childNodes[0].getAttribute('width')).toBe(null);
                expect(circle.childNodes[0].getAttribute('height')).toBe(null);
                expect(circle.childNodes[0].getAttribute('viewBox')).toBe(null);

                expect(circle.getAttribute('stroke')).toBe(null);
                expect(circle.getAttribute('width')).toBe('10');
                expect(circle.getAttribute('height')).toBe('20');
                expect(circle.getAttribute('viewBox')).toBe('10 20 30 40');
            });
        });
    });

});