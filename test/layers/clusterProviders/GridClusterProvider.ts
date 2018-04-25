import {GridClusterProvider} from "../../../source/layers/clusterProviders/GridClusterProvider";
import {FeatureGroup} from "../../../source/features/FeatureGroup";
import {Feature} from "../../../source/features/Feature";
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

    const clusterProvider = new GridClusterProvider({
        size: clusterSize,
    });

    const pythagoras = (p1: Feature, p2: Feature): number => {
        return Math.hypot(p2.centroid[0] - p1.centroid[0], p2.centroid[1] - p1.centroid[1]);
    }

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

    it('.getClusters() should return 4 featureGroup', () => {
        expect(clusters.length).toBe(4);
    });

    it('.getClusters() should return contains the same length', () => {
        const sumFeaturesLength = clusters.reduce((prev: number, curr: FeatureGroup) => {
            return prev + curr.features.length;
        }, 0);

        expect(points.length).toBe(sumFeaturesLength);
    });

    it('The distance between clusters does not exceed the specified size', () => {
        let distanceIsExceeded = false;

        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                if (pythagoras(clusters[i], clusters[j]) < clusterSize * resolution)
                    distanceIsExceeded = true;
            }
        }

        expect(distanceIsExceeded).toBe(false);
    });

    it('property check', () => {
        interface SecretPoint extends PointFeature {
            name?: string;
        }
        const secretPoint: SecretPoint = new PointFeature([150.834439, 59.544667], {crs: wgs84});
        const pointName = 'Секретная точка';
        secretPoint.name = pointName;
        clusterProvider.add(secretPoint);

        const clusters = clusterProvider.getClusters(bbox, 9594);

        interface MbSecretPoint extends Feature {
            name?: string;
        }

        const mbSecretPoint: MbSecretPoint = clusters[2].features[3];

        expect(clusters.length).toBe(4);
        expect(clusters[2].features.length).toBe(4);
        expect(mbSecretPoint.name).toBe(pointName);
    });

    it('getClusters with changing resolution', () => {
        expect(clusterProvider.getClusters(bbox, resolution).length).toBe(4);
        expect(clusterProvider.getClusters(bbox, 4444).length).toBe(6);
    });
});
