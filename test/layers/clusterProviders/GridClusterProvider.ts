import {GridClusterProvider} from "../../../source/layers/clusterProviders/GridClusterProvider";
import {PointFeature} from "../../../source/features/PointFeature";
import {wgs84, webMercator} from "../../../source/Crs";
import {Bbox} from "../../../source/Bbox";

describe('GridClusterProvider', () => {
    const resolution = 9595;
    const clusterSize = 44;

    const bbox =  new Bbox(
        [4479595.652981168, 3294552.535015907],
        [16003190.652981168, 12640082.535015907],
        webMercator,
    );

    const clusterProvider = new GridClusterProvider(clusterSize);

    const objects = [
        [73.355357, 54.878128],
        [59.822013, 53.521495],
        [60.520713, 54.827998],
        [61.579522, 55.061807],
        [60.74531, 56.082793],
        [150.839039, 59.549667],
        [150.809511, 59.570643],
        [150.797609, 59.56511],
        [39.79428, 43.548443],
    ]

    const points = objects.map(point =>
        clusterProvider.add(
            new PointFeature([point[0], point[1]], { crs: wgs84 }),
        ),
    );

    const clusters = clusterProvider.getClusters(bbox, resolution);

    it('.getClusters() should return 3 featureGroup', () => {
        expect(clusters.length).toBe(4);
    });

    it('.getClusters() should return contains 9 object', () => {
        expect(points.length).toBe(9);
    });

    it('getClusters with changing resolution', () => {
        expect(clusterProvider.getClusters(bbox, resolution).length).toBe(4);
        expect(clusterProvider.getClusters(bbox, 4444).length).toBe(5);
    });
});
