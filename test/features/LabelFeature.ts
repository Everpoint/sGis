import {LabelFeature} from "../../source/features/Label";
import {Point} from "../../source/Point";
import {webMercator} from "../../source/Crs";

describe('LabelFeature', () => {
    const point = new Point([10, 10]);
    const projected = point.projectTo(webMercator);

    let label: LabelFeature;
    beforeEach(() => {
        label = new LabelFeature(point.position, {crs: point.crs, content: 'label 1'});
    });

    it('.projectTo() should return correct feature', () => {
        let projectedLabel = label.projectTo(webMercator);
        expect(projectedLabel instanceof LabelFeature).toBe(true);
        expect(projectedLabel.position).toEqual(projected.position);
        expect(projectedLabel.content).toBe(label.content);
    });
});