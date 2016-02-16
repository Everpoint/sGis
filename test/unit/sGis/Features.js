'use strict';

$(document).ready(function() {

    $(document.body).html('<div id="map" style="width: 500px; height: 500px;"></div>');
    
    describe('Feature', function() {

        /*
         * sGis.feature.Polyline
         */
        
        describe('Polyline', function() {
            describe('creation', function() {
                it('should be created with default parameters', function() {
                    var polyline = new sGis.feature.Polyline();
                    
                    expect(polyline).toBeDefined();
                    expect(polyline.coordinates).toEqual([[]]);
                    expect(polyline.color).toBe(sGis.geom.Polyline.prototype._color);
                    expect(polyline.width).toBe(sGis.geom.Polyline.prototype._width);
                });
                
                it('should throw exception in case of incorrect parameters', function() {
                    expect(function() {new sGis.feature.Polyline(1);}).toThrow();
                    expect(function() {new sGis.feature.Polyline([['not a point']]);}).toThrow();
                    expect(function() {new sGis.feature.Polyline([[]], {crs: 'not a crs'});}).toThrow();
                });
                
                it('should set the properties correctly', function() {
                    var polyline = new sGis.feature.Polyline([[]], {color: 'red', width: 1, crs: sGis.CRS.webMercator});
                    expect(polyline.coordinates).toEqual([[]]);
                    expect(polyline.color).toBe('red');
                    expect(polyline.width).toBe(1);
                    expect(polyline.crs).toBe(sGis.CRS.webMercator);
                });
                
                it('should set the coordinates specified with [[]] format', function() {
                    var coordinates = [[37, 55], [38, 56]],
                        polyline = new sGis.feature.Polyline(coordinates);
                    expect(polyline.coordinates).toEqual([coordinates]);
                    expect(polyline.coordinates[0]).not.toBe(coordinates);
                });
                
                it('should set the coordinates specifeid with [[[]]] format', function() {
                    var coordinates = [[[37, 55], [38, 56]], [[39, 57], [40, 58]]],
                        polyline = new sGis.feature.Polyline(coordinates);
                    expect(polyline.coordinates).toEqual(coordinates);
                    expect(polyline.coordinates[0]).not.toBe(coordinates[0]);
                });
                
                it('should set the coordinates specified with [sGis.Point] format', function() {
                    var point1 = new sGis.Point(33, 57),
                        point2 = new sGis.Point(34, 58),
                        coordinates = [point1, point2],
                        polyline = new sGis.feature.Polyline(coordinates);
                        
                    expect(polyline.coordinates).toEqual([[[33, 57], [34, 58]]]);
                });
                
                it('should set the coordinates specified with [[sGis.Point]] format', function() {
                    var point1 = new sGis.Point(33,57),
                        point2 = new sGis.Point(34, 58),
                        point3 = new sGis.Point(35, 59),
                        point4 = new sGis.Point(36, 60),
                        coordinates = [[point1, point2], [point3, point4]],
                        polyline = new sGis.feature.Polyline(coordinates);
                        
                    expect(polyline.coordinates).toEqual([[[33,57], [34, 58]], [[35, 59], [36, 60]]]);
                });
                
                it('should reproject the coordinates if crs is specified', function() {
                    var point1 = new sGis.Point(33, 57),
                        point2 = new sGis.Point(34, 58),
                        projected1 = point1.projectTo(sGis.CRS.webMercator),
                        projected2 = point2.projectTo(sGis.CRS.webMercator),
                        coordinates = [point1, point2],
                        polyline = new sGis.feature.Polyline(coordinates, {crs: sGis.CRS.webMercator});
                        
                    expect(polyline.coordinates).toEqual([[[projected1.x, projected1.y], [projected2.x, projected2.y]]]);
                    
                    var polyline1 = new sGis.feature.Polyline([projected1, projected2]);
                    expect(polyline1.coordinates[0][0][0] - point1.y).toBeLessThan(0.0001);
                    expect(polyline1.coordinates[0][0][1] - point1.x).toBeLessThan(0.0001);
                    expect(polyline1.coordinates[0][1][0] - point2.y).toBeLessThan(0.0001);
                    expect(polyline1.coordinates[0][1][1] - point2.x).toBeLessThan(0.0001);
                });
                
                it('should understand the mixed coordinates', function() {
                    var point = new sGis.Point(33, 57),
                        projected = point.projectTo(sGis.CRS.webMercator),
                        coordinates = [10000, 10000],
                        polyline = new sGis.feature.Polyline([point, coordinates], {crs: sGis.CRS.webMercator});
                        
                    expect(polyline.coordinates).toEqual([[[projected.x, projected.y], coordinates]]);
                });
            });
            
            describe('properties', function() {
                it('.coordinates should return the copy of feature\'s coordinates', function() {
                    var polyline = new sGis.feature.Polyline(),
                        coordinates = [[[37, 55], [38, 56]]];
                        
                    polyline.coordinates = coordinates;
                    expect(polyline.coordinates).toEqual(coordinates);
                    expect(polyline.coordinates).not.toBe(coordinates);
                    
                });
                
                it('.coordinates should set the coordinates and reproject if necessary', function() {
                    var polyline = new sGis.feature.Polyline(),
                        point = new sGis.Point(10000, 10000, sGis.CRS.webMercator),
                        projected = point.projectTo(sGis.CRS.geo);
                        
                    polyline.coordinates = [[37, 55], point];
                    expect(polyline.coordinates).toEqual([[[37, 55], [projected.y, projected.x]]]);
                });
                
                it('.bbox should return the bounding rectangle of the feature and throw exception if tried to set', function() {
                    var polyline = new sGis.feature.Polyline([[1000, 1000], [1000, 2000], [2000, 2000]], {crs: sGis.CRS.webMercator});
                        
                    expect(function() {polygon.bbox = new sGis.Bbox(new sGis.Point(1000, 1000, sGis.CRS.webMercator), new sGis.Point(2000, 2000, sGis.CRS.webMercator));}).toThrow();
                    expect(polyline.bbox.p[0].x).toBe(1000);
                    expect(polyline.bbox.p[0].y).toBe(1000);
                    expect(polyline.bbox.p[1].x).toBe(2000);
                    expect(polyline.bbox.p[1].y).toBe(2000);
                });
                
                it('.bbox should boind all contours of the feature', function() {
                    var polyline = new sGis.feature.Polyline([[[1000, 1000], [2000, 2000]], [[3000, 3000], [4000, 4000]]]);
                    
                    expect(polyline.bbox.p[0].x).toBe(1000);
                    expect(polyline.bbox.p[0].y).toBe(1000);
                    expect(polyline.bbox.p[1].x).toBe(4000);
                    expect(polyline.bbox.p[1].y).toBe(4000);
                });
                
                it('.crs should reproject the coordinates if changed', function() {
                    var point1 = new sGis.Point(37, 55),
                        point2 = new sGis.Point(38, 56),
                        point3 = new sGis.Point(39, 57),
                        point4 = new sGis.Point(40, 58),
                        projected1 = point1.projectTo(sGis.CRS.webMercator),
                        projected2 = point2.projectTo(sGis.CRS.webMercator),
                        projected3 = point3.projectTo(sGis.CRS.webMercator),
                        projected4 = point4.projectTo(sGis.CRS.webMercator),
                        polyline = new sGis.feature.Polyline([[point1, point2], [point3, point4]]);
                        
                    polyline.crs = sGis.CRS.webMercator;
                    expect(polyline.coordinates).toEqual([[[projected1.x, projected1.y], [projected2.x, projected2.y]], [[projected3.x, projected3.y], [projected4.x, projected4.y]]]);
                });
            });
            
            describe('methods', function() {
                var polyline;
                
                beforeEach(function() {
                    polyline = new sGis.feature.Polyline([[[10000, 10000], [20000, 20000]], [[30000, 30000], [40000, 40000]]], {crs: sGis.CRS.webMercator, color: 'red', width: 3});
                });
                
                it('.addPoint() should add a point to the specified ring', function() {
                    expect(function() {polyline.addPoint();}).toThrow();
                    expect(function() {polyline.addPoint('not a point');}).toThrow();
                    expect(function() {polyline.addPoint(1, 1);}).toThrow();
                    expect(function() {polyline.addPoint([100, 100], 2);}).toThrow();
                    
                    polyline.addPoint([25000, 25000], 0);
                    expect(polyline.coordinates[0].length).toBe(3);
                    expect(polyline.coordinates[0][2]).toEqual([25000, 25000]);
                    
                    var point = new sGis.Point(45000, 45000, sGis.CRS.webMercator);
                    polyline.addPoint(point, 1);
                    expect(polyline.coordinates[0].length).toBe(3);
                    expect(polyline.coordinates[1].length).toBe(3);
                    expect(polyline.coordinates[1][2]).toEqual([45000, 45000]);
                });
                
                it('.addPoint() should reproject the point if necessary', function() {
                    var point = new sGis.Point(37, 55),
                        projected = point.projectTo(sGis.CRS.webMercator);
                        
                    polyline.addPoint(point, 1);
                    expect(polyline.coordinates[1]).toEqual([[30000, 30000], [40000, 40000], [projected.x, projected.y]]);
                });
                
                it('.removePoint() should remove the specified point from the feature', function() {
                    expect(function() {polyline.removePoint();}).toThrow();
                    expect(function() {polyline.removePoint(1);}).toThrow();
                    expect(function() {polyline.removePoint(3,0);}).toThrow();
                    expect(function() {polyline.removePoint(1,3);}).toThrow();
                    expect(function() {polyline.removePoint('not a number', 0);}).toThrow();
                    
                    polyline.removePoint(1, 0);
                    expect(polyline.coordinates[0].length).toBe(2);
                    expect(polyline.coordinates[1]).toEqual([[40000, 40000]]);
                });
                
                it('.removePoint() should remove the ring if the last point of the ring is deleted', function() {
                    polyline.removePoint(1, 1);
                    polyline.removePoint(1, 0);
                    expect(polyline.coordinates).toEqual([[[10000, 10000], [20000, 20000]]]);
                });
                
                it('.render() should render the feature into geometry with correct parameters', function() {
                    var resolution = 10,
                        crs = sGis.CRS.webMercator,
                        coordinates = polyline.coordinates,
                        renderedCoordinates = [],
                        rendered = polyline.render(resolution, crs);
                    
                    for (var ring = 0, l = coordinates.length; ring < l; ring++) {
                        renderedCoordinates[ring] = [];
                        for (var i = 0, m = coordinates[ring].length; i < m; i++) {
                            renderedCoordinates[ring][i] = [coordinates[ring][i][0] / resolution, - coordinates[ring][i][1] / resolution];
                        }
                    }
                    
                    expect(renderedCoordinates).toEqual(rendered[0].coordinates);
                    expect(rendered[0].color).toBe(polyline.color);
                    expect(rendered[0].width).toBe(polyline.width);
                });
                
                it('.scale() should throw in case of incorrect scale', function() {
                    expect(function() {polyline.scale();}).toThrow();
                    expect(function() {polyline.scale('a');}).toThrow();
                    expect(function() {polyline.scale([]);}).toThrow();
                    expect(function() {polyline.scale({});}).toThrow();
                    expect(function() {polyline.scale([1]);}).toThrow();
                    expect(function() {polyline.scale(1, null);}).toThrow();
                    expect(function() {polyline.scale(1, 'a');}).toThrow();
                    expect(function() {polyline.scale(1, {});}).toThrow();
                    expect(function() {polyline.scale(1, [1]);}).toThrow();
                    expect(function() {polyline.scale(1, ['a', 2]);}).toThrow();
                });
                
                it('.scale() should scale the polyline if a number is specified', function() {
                    polyline.scale(2, [0, 0]);
                    expect(polyline.coordinates).toEqual([[[20000, 20000], [40000, 40000]], [[60000, 60000], [80000, 80000]]]);
                    
                    polyline.scale(0.5, [40000, 40000]);
                    expect(polyline.coordinates).toEqual([[[30000, 30000], [40000, 40000]], [[50000, 50000], [60000, 60000]]]);
                });
                
                it('.scale() should scale the polyline if an array is specified', function() {
                    polyline.scale([1, 2], [0, 0]);
                    expect(polyline.coordinates).toEqual([[[10000, 20000], [20000, 40000]], [[30000, 60000], [40000, 80000]]]);
                    
                    polyline.scale([2, 1], [20000, 40000]);
                    expect(polyline.coordinates).toEqual([[[0, 20000], [20000, 40000]], [[40000, 60000], [60000, 80000]]]);
                });
                
                it('.scale() should get a point for the center', function() {
                    var point = new sGis.Point(10000, 20000, sGis.CRS.webMercator);
                    polyline.scale(2, point);
                    expect(polyline.coordinates).toEqual([[[10000, 0], [30000, 20000]], [[50000, 40000], [70000, 60000]]]);
                });
                
                it('.scale() should use the centroid if the center is not specified', function() {
                    polyline.scale(2);
                    expect(polyline.coordinates).toEqual([[[-5000, -5000], [15000, 15000]], [[35000, 35000], [55000, 55000]]]);
                });
                
                it('.scale() should reproject center point correctly', function() {
                    var point = new sGis.Point(10000, 20000, sGis.CRS.webMercator),
                        projected = point.projectTo(sGis.CRS.geo);
                        
                    polyline.scale(2, projected);
                    expect(polyline.coordinates[0][0][0] - 10000 < 0.001).toBe(true);
                });
                
                it('.rotate() should throw in case of incorrect parameters', function() {
                    expect(function() {polyline.scale();}).toThrow();
                    expect(function() {polyline.scale('a');}).toThrow();
                    expect(function() {polyline.scale([]);}).toThrow();
                    expect(function() {polyline.scale({});}).toThrow();
                    expect(function() {polyline.scale([1]);}).toThrow();
                    expect(function() {polyline.scale(1, null);}).toThrow();
                    expect(function() {polyline.scale(1, 'a');}).toThrow();
                    expect(function() {polyline.scale(1, {});}).toThrow();
                    expect(function() {polyline.scale(1, [1]);}).toThrow();
                    expect(function() {polyline.scale(1, ['a', 2]);}).toThrow();                    
                });
                
                it('.rotate() should rotate the polyline around the point', function() {
                    polyline.rotate(Math.PI, [0, 0]);
                    expect(polyline.coordinates[1][0][1] + 30000 < 0.0001).toBe(true);
                });
            });
        });
        
        /*
         * sGis.feature.Polygon
         */
        
        describe('Polygon', function() {
            describe('creation', function() {
                it('should be created with default parameters', function() {
                    var polygon = new sGis.feature.Polygon();
                    
                    expect(polygon).toBeDefined();
                    expect(polygon.coordinates).toEqual([[]]);
                    expect(polygon.color).toBe(sGis.geom.Polygon.prototype._color);
                    expect(polygon.width).toBe(sGis.geom.Polygon.prototype._width);
                    expect(polygon.fillColor).toBe(sGis.geom.Polygon.prototype._fillColor);
                });
                
                it('should throw exception in case of incorrect parameters', function() {
                    expect(function() {new sGis.feature.Polygon(1);}).toThrow();
                    expect(function() {new sGis.feature.Polygon([['not a point']]);}).toThrow();
                    expect(function() {new sGis.feature.Polygon([[]], {crs: 'not a crs'});}).toThrow();
                });
                
                it('should set the properties correctly', function() {
                    var polygon = new sGis.feature.Polygon([[]], {color: 'red', width: 1, fillColor: 'blue', crs: sGis.CRS.webMercator});
                    expect(polygon.coordinates).toEqual([[]]);
                    expect(polygon.color).toBe('red');
                    expect(polygon.width).toBe(1);
                    expect(polygon.fillColor).toBe('blue');
                    expect(polygon.crs).toBe(sGis.CRS.webMercator);
                });
                
                it('should set the coordinates specified with [[]] format', function() {
                    var coordinates = [[37, 55], [38, 56]],
                        polygon = new sGis.feature.Polygon(coordinates);
                    expect(polygon.coordinates).toEqual([coordinates]);
                    expect(polygon.coordinates[0]).not.toBe(coordinates);
                });
                
                it('should set the coordinates specifeid with [[[]]] format', function() {
                    var coordinates = [[[37, 55], [38, 56]], [[39, 57], [40, 58]]],
                        polygon = new sGis.feature.Polygon(coordinates);
                    expect(polygon.coordinates).toEqual(coordinates);
                    expect(polygon.coordinates[0]).not.toBe(coordinates[0]);
                });
                
                it('should set the coordinates specified with [sGis.Point] format', function() {
                    var point1 = new sGis.Point(33, 57),
                        point2 = new sGis.Point(34, 58),
                        coordinates = [point1, point2],
                        polygon = new sGis.feature.Polygon(coordinates);
                        
                    expect(polygon.coordinates).toEqual([[[33, 57], [34, 58]]]);
                });
                
                it('should set the coordinates specified with [[sGis.Point]] format', function() {
                    var point1 = new sGis.Point(33,57),
                        point2 = new sGis.Point(34, 58),
                        point3 = new sGis.Point(35, 59),
                        point4 = new sGis.Point(36, 60),
                        coordinates = [[point1, point2], [point3, point4]],
                        polygon = new sGis.feature.Polygon(coordinates);
                        
                    expect(polygon.coordinates).toEqual([[[33,57], [34, 58]], [[35, 59], [36, 60]]]);
                });
                
                it('should reproject the coordinates if crs is specified', function() {
                    var point1 = new sGis.Point(33, 57),
                        point2 = new sGis.Point(34, 58),
                        projected1 = point1.projectTo(sGis.CRS.webMercator),
                        projected2 = point2.projectTo(sGis.CRS.webMercator),
                        coordinates = [point1, point2],
                        polygon = new sGis.feature.Polygon(coordinates, {crs: sGis.CRS.webMercator});
                        
                    expect(polygon.coordinates).toEqual([[[projected1.x, projected1.y], [projected2.x, projected2.y]]]);
                    
                    var polygon1 = new sGis.feature.Polygon([projected1, projected2]);
                    expect(polygon1.coordinates[0][0][0] - point1.y).toBeLessThan(0.0001);
                    expect(polygon1.coordinates[0][0][1] - point1.x).toBeLessThan(0.0001);
                    expect(polygon1.coordinates[0][1][0] - point2.y).toBeLessThan(0.0001);
                    expect(polygon1.coordinates[0][1][1] - point2.x).toBeLessThan(0.0001);
                });
                
                it('should understand the mixed coordinates', function() {
                    var point = new sGis.Point(33, 57),
                        projected = point.projectTo(sGis.CRS.webMercator),
                        coordinates = [10000, 10000],
                        polygon = new sGis.feature.Polygon([point, coordinates], {crs: sGis.CRS.webMercator});
                        
                    expect(polygon.coordinates).toEqual([[[projected.x, projected.y], coordinates]]);
                });
            });
            
            describe('properties', function() {
                it('.coordinates should return the copy of feature\'s coordinates', function() {
                    var polygon = new sGis.feature.Polygon(),
                        coordinates = [[[37, 55], [38, 56]]];
                        
                    polygon.coordinates = coordinates;
                    expect(polygon.coordinates).toEqual(coordinates);
                    expect(polygon.coordinates).not.toBe(coordinates);
                    
                });
                
                it('.coordinates should set the coordinates and reproject if necessary', function() {
                    var polygon = new sGis.feature.Polygon(),
                        point = new sGis.Point(10000, 10000, sGis.CRS.webMercator),
                        projected = point.projectTo(sGis.CRS.geo);
                        
                    polygon.coordinates = [[37, 55], point];
                    expect(polygon.coordinates).toEqual([[[37, 55], [projected.y, projected.x]]]);
                });
                
                it('.bbox should return the bounding rectangle of the feature and throw exception if tried to set', function() {
                    var polygon = new sGis.feature.Polygon([[1000, 1000], [1000, 2000], [2000, 2000]], {crs: sGis.CRS.webMercator});
                        
                    expect(function() {polygon.bbox = new sGis.Bbox(new sGis.Point(1000, 1000, sGis.CRS.webMercator), new sGis.Point(2000, 2000, sGis.CRS.webMercator));}).toThrow();
                    expect(polygon.bbox.p[0].x).toBe(1000);
                    expect(polygon.bbox.p[0].y).toBe(1000);
                    expect(polygon.bbox.p[1].x).toBe(2000);
                    expect(polygon.bbox.p[1].y).toBe(2000);
                });
                
                it('.bbox should boind all contours of the feature', function() {
                    var polygon = new sGis.feature.Polygon([[[1000, 1000], [2000, 2000]], [[3000, 3000], [4000, 4000]]]);
                    
                    expect(polygon.bbox.p[0].x).toBe(1000);
                    expect(polygon.bbox.p[0].y).toBe(1000);
                    expect(polygon.bbox.p[1].x).toBe(4000);
                    expect(polygon.bbox.p[1].y).toBe(4000);
                });
                
                it('.crs should reproject the coordinates if changed', function() {
                    var point1 = new sGis.Point(37, 55),
                        point2 = new sGis.Point(38, 56),
                        point3 = new sGis.Point(39, 57),
                        point4 = new sGis.Point(40, 58),
                        projected1 = point1.projectTo(sGis.CRS.webMercator),
                        projected2 = point2.projectTo(sGis.CRS.webMercator),
                        projected3 = point3.projectTo(sGis.CRS.webMercator),
                        projected4 = point4.projectTo(sGis.CRS.webMercator),
                        polygon = new sGis.feature.Polygon([[point1, point2], [point3, point4]]);
                        
                    polygon.crs = sGis.CRS.webMercator;
                    expect(polygon.coordinates).toEqual([[[projected1.x, projected1.y], [projected2.x, projected2.y]], [[projected3.x, projected3.y], [projected4.x, projected4.y]]]);
                });
            });
            
            describe('methods', function() {
                var polygon;
                
                beforeEach(function() {
                    polygon = new sGis.feature.Polygon([[[10000, 10000], [20000, 20000]], [[30000, 30000], [40000, 40000]]], {crs: sGis.CRS.webMercator, color: 'red', width: 3});
                });
                
                it('.addPoint() should add a point to the specified ring', function() {
                    expect(function() {polygon.addPoint();}).toThrow();
                    expect(function() {polygon.addPoint('not a point');}).toThrow();
                    expect(function() {polygon.addPoint(1, 1);}).toThrow();
                    expect(function() {polygon.addPoint([100, 100], 2);}).toThrow();
                    
                    polygon.addPoint([25000, 25000], 0);
                    expect(polygon.coordinates[0].length).toBe(3);
                    expect(polygon.coordinates[0][2]).toEqual([25000, 25000]);
                    
                    var point = new sGis.Point(45000, 45000, sGis.CRS.webMercator);
                    polygon.addPoint(point, 1);
                    expect(polygon.coordinates[0].length).toBe(3);
                    expect(polygon.coordinates[1].length).toBe(3);
                    expect(polygon.coordinates[1][2]).toEqual([45000, 45000]);
                });
                
                it('.addPoint() should reproject the point if necessary', function() {
                    var point = new sGis.Point(37, 55),
                        projected = point.projectTo(sGis.CRS.webMercator);
                        
                    polygon.addPoint(point, 1);
                    expect(polygon.coordinates[1]).toEqual([[30000, 30000], [40000, 40000], [projected.x, projected.y]]);
                });
                
                it('.removePoint() should remove the specified point from the feature', function() {
                    expect(function() {polygon.removePoint();}).toThrow();
                    expect(function() {polygon.removePoint(1);}).toThrow();
                    expect(function() {polygon.removePoint(3,0);}).toThrow();
                    expect(function() {polygon.removePoint(1,3);}).toThrow();
                    expect(function() {polygon.removePoint('not a number', 0);}).toThrow();
                    
                    polygon.removePoint(1, 0);
                    expect(polygon.coordinates[0].length).toBe(2);
                    expect(polygon.coordinates[1]).toEqual([[40000, 40000]]);
                });
                
                it('.removePoint() should remove the ring if the last point of the ring is deleted', function() {
                    polygon.removePoint(1, 1);
                    polygon.removePoint(1, 0);
                    expect(polygon.coordinates).toEqual([[[10000, 10000], [20000, 20000]]]);
                });
                
                it('.render() should render the feature into geometry with correct parameters', function() {
                    var resolution = 10,
                        crs = sGis.CRS.webMercator,
                        coordinates = polygon.coordinates,
                        renderedCoordinates = [],
                        rendered = polygon.render(resolution, crs);
                    
                    for (var ring = 0, l = coordinates.length; ring < l; ring++) {
                        renderedCoordinates[ring] = [];
                        for (var i = 0, m = coordinates[ring].length; i < m; i++) {
                            renderedCoordinates[ring][i] = [coordinates[ring][i][0] / resolution, - coordinates[ring][i][1] / resolution];
                        }
                    }
                    
                    expect(renderedCoordinates).toEqual(rendered[0].coordinates);
                    expect(rendered[0].color).toBe(polygon.color);
                    expect(rendered[0].width).toBe(polygon.width);
                    expect(rendered[0].fillColor).toBe(polygon.fillColor);
                    
                    polygon.addPoint([20000, 20000]);
                });

                describe('.contains()', function() {
                    var polygon = new sGis.feature.Polygon([[-100, -100], [-100, 100], [100, 100], [100, -100]], {crs: sGis.CRS.webMercator});

                    it('should get sGis.Point as parameter and return true if point is inside polygon and false if not', function() {
                        var point = new sGis.Point(0, 0, sGis.CRS.webMercator);
                        expect(polygon.contains(point)).toBe(true);

                        var point1 = new sGis.Point(101, 0, sGis.CRS.webMercator);
                        expect(polygon.contains(point1)).toBe(false);
                    });

                    it('should get sGis.feature.Point as parameter and return true if point is inside polygon and false if not', function() {
                        var point = new sGis.feature.Point([0, 0], { crs: sGis.CRS.webMercator });
                        expect(polygon.contains(point)).toBe(true);

                        var point1 = new sGis.feature.Point([101, 0], { crs: sGis.CRS.webMercator });
                        expect(polygon.contains(point1)).toBe(false);
                    });

                    it('should get coordinates as parameter and return true if point is inside polygon and false if not', function() {
                        expect(polygon.contains([0, 0])).toBe(true);
                        expect(polygon.contains([101, 0])).toBe(false);
                    });

                    it('should reproject points before checking', function() {
                        var point = new sGis.Point(0, 0, sGis.CRS.webMercator);
                        expect(polygon.contains(point.projectTo(sGis.CRS.geo))).toBe(true);

                        var point1 = new sGis.Point(101, 0, sGis.CRS.webMercator);
                        expect(polygon.contains(point1.projectTo(sGis.CRS.geo))).toBe(false);

                        var point2 = new sGis.feature.Point([0, 0], { crs: sGis.CRS.webMercator });
                        expect(polygon.contains(point2.projectTo(sGis.CRS.geo))).toBe(true);

                        var point3 = new sGis.feature.Point([101, 0], { crs: sGis.CRS.webMercator });
                        expect(polygon.contains(point3.projectTo(sGis.CRS.geo))).toBe(false);
                    });
                });
            });
        });

        describe('Image', function() {
            describe('creation', function() {
                var bbox;
                beforeEach(function() {
                    bbox = new sGis.Bbox([0, 0], [10, 10]);
                });

                it('should throw an exception in case of incorrect parameters', function() {
                    expect(function() { var image = new sGis.feature.Image(); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image(1); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image('a'); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image([]); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image({}); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image([[0, 0]]); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image([[0, 0], [10, 10]], {crs: 'not a crs'}); }).toThrow();
                    expect(function() { var image = new sGis.feature.Image([[0, 0], [10, 10]], {src: 1}); }).toThrow();
                });

                it('should set the specified bbox', function() {
                    var image = new sGis.feature.Image(bbox);

                    expect(image.bbox).toEqual(bbox);
                    expect(image.bbox).not.toBe(bbox);
                });

                it('should correctly set the bbox specified as array', function() {
                    var image = new sGis.feature.Image([[0, 0], [10, 10]]);
                    expect(image.bbox).toEqual(new sGis.Bbox([0, 0], [10, 10]));

                    var image1 = new sGis.feature.Image([[0, 0], [10, 10]], { crs: sGis.CRS.plain });
                    expect(image1.bbox).toEqual(new sGis.Bbox([0, 0], [10, 10], sGis.CRS.plain));
                });

                it('should use the specified crs', function() {
                    var image = new sGis.feature.Image(bbox, { crs: sGis.CRS.webMercator });
                    expect(image.bbox).toEqual(bbox.projectTo(sGis.CRS.webMercator));
                });

                it('should set the source', function() {
                    var image = new sGis.feature.Image(bbox);
                    expect(image.src).toBeFalsy();

                    var image1 = new sGis.feature.Image(bbox, { src: 'url' });
                    expect(image1.src).toBe('url');
                });
            });

            describe('properties', function() {
                var bbox, image;
                beforeEach(function() {
                    bbox = new sGis.Bbox([0, 0], [10, 10]);
                    image = new sGis.feature.Image(bbox);
                });

                it('.crs should set and return the crs of the feature', function() {
                    expect(image.crs).toBe(sGis.CRS.geo);

                    image.crs = sGis.CRS.webMercator;
                    expect(image.crs).toBe(sGis.CRS.webMercator);

                    var image1 = new sGis.feature.Image(bbox, { crs: sGis.CRS.ellipticalMercator });
                    expect(image1.crs).toBe(sGis.CRS.ellipticalMercator);
                    expect(image.crs).toBe(sGis.CRS.webMercator);
                });

                it('.crs should throw an exception if current bbox cannot be projected to new crs', function() {
                    expect(function() { image.crs = sGis.CRS.plain; }).toThrow();

                    var image1 = new sGis.feature.Image([[0, 0], [-10, -20]], { crs: sGis.CRS.plain });
                    expect(function() { image1.crs = sGis.CRS.webMercator; }).toThrow();
                });

                it('.crs should throw an exception in case of incorrect parameter', function() {
                    expect(function() { image.crs = undefined; }).toThrow();
                    expect(function() { image.crs = null; }).toThrow();
                    expect(function() { image.crs = 1; }).toThrow();
                    expect(function() { image.crs = 'a'; }).toThrow();
                    expect(function() { image.crs = []; }).toThrow();
                    expect(function() { image.crs = {}; }).toThrow();
                });

                it('.bbox should set and return the bbox of the feature', function() {
                    expect(image.bbox).toEqual(bbox);
                    expect(image.bbox).not.toBe(bbox);

                    var bbox1 = new sGis.Bbox([20, 30], [40, 50]);
                    image.bbox = bbox1;
                    expect(image.bbox).toEqual(bbox1);
                    expect(image.bbox).not.toBe(bbox1);

                    var image1 = new sGis.feature.Image(bbox1);
                    image1.bbox = bbox;
                    expect(image1.bbox).toEqual(bbox);
                    expect(image.bbox).toEqual(bbox1);
                });

                it('.bbox should set the bbox specified as array', function() {
                    image.bbox = [[20, 20], [30, 30]];
                    expect(image.bbox).toEqual(new sGis.Bbox([20, 20], [30, 30], bbox.crs));

                    image.crs = sGis.CRS.webMercator;
                    image.bbox = [[50, 60], [60, 70]];
                    expect(image.bbox).toEqual(new sGis.Bbox([50, 60], [60, 70], sGis.CRS.webMercator));
                });

                it('.bbox should return the bbox in the crs of the feature', function() {
                    image.crs = sGis.CRS.webMercator;
                    expect(image.bbox).toEqual(bbox.projectTo(sGis.CRS.webMercator));

                    var image1 = new sGis.feature.Image(bbox, { crs: sGis.CRS.ellipticalMercator });
                    expect(image1.bbox).toEqual(bbox.projectTo(sGis.CRS.ellipticalMercator));
                });

                it('.bbox should throw an exception if the bbox cannot be projected to the feature crs', function() {
                    var bbox1 = new sGis.Bbox([10, 10], [20, 20], sGis.CRS.plain);
                    expect(function() {image.bbox = bbox1;}).toThrow();

                    var image1 = new sGis.feature.Image(bbox1);
                    expect(function() {image1.bbox = bbox;}).toThrow();
                });

                it('.bbox should thow an exception in case of incorrect parameters', function() {
                    expect(function() { image.bbox = undefined; }).toThrow();
                    expect(function() { image.bbox = null; }).toThrow();
                    expect(function() { image.bbox = 1; }).toThrow();
                    expect(function() { image.bbox = 'a'; }).toThrow();
                    expect(function() { image.bbox = []; }).toThrow();
                    expect(function() { image.bbox = {}; }).toThrow();
                });

                it('.src should set and return the src of the image', function() {
                    expect(image.src).toBeFalsy();

                    image.src = 'url';
                    expect(image.src).toBe('url');

                    image.src = null;
                    expect(image.src).toBe(null);

                    var image1 = new sGis.feature.Image(bbox, { src: 'hello' });
                    expect(image1.src).toBe('hello');
                    expect(image.src).toBe(null);
                });

                it('.src should throw an exception in case of incorrect argument', function() {
                    expect(function() { image.src = undefined; }).toThrow();
                    expect(function() { image.src = 1; }).toThrow();
                    expect(function() { image.src = []; }).toThrow();
                    expect(function() { image.src = {}; }).toThrow();
                });
            });
        });
    });
});