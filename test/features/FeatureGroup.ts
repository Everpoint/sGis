import {FeatureGroup} from "../../source/features/FeatureGroup";
import {PointFeature} from "../../source/features/PointFeature";
import {wgs84} from "../../source/Crs";

describe('FeatureGroup', () => {
    const points = [
        [83.772032, 53.351047],
        [83.682641, 53.346349],
        [83.675356, 53.366997],
        [83.744562, 53.379638],
    ].map(point => new PointFeature([point[0], point[1]], {crs: wgs84}));

    const group = new FeatureGroup(points, {crs: wgs84});
    const projected = group.projectTo(wgs84);

    it('.projectTo() should return correct feature', () => {
        const projectedFeatureGroup = group.projectTo(wgs84);
        expect(projectedFeatureGroup instanceof FeatureGroup).toBe(true);
        expect(projectedFeatureGroup.position).toEqual(projected.position);
    });
});