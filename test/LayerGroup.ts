import "jest";
import {LayerGroup} from "../source/LayerGroup";
import {TileLayer} from "../source/layers/TileLayer";
import {FeatureLayer} from "../source/layers/FeatureLayer";

describe('LayerGroup', function() {
    describe('constructor', function () {
        it('should correctly create simple LayerGroup instance', function () {
            const emptyGroup = new LayerGroup();

            const dynamicLayer = new FeatureLayer();
            const tileLayer = new TileLayer('url');

            const nonEmptyGroup = new LayerGroup([dynamicLayer, tileLayer]);

            // TODO: rewrite expect to jest assertion https://jr.everpoint.ru/browse/PUB-3459
            // expect(emptyGroup).toEqual(jasmine.any(LayerGroup));
            // expect(nonEmptyGroup).toEqual(jasmine.any(LayerGroup));

            expect(emptyGroup.layers.length).toBe(0);
            expect(nonEmptyGroup.layers.length).not.toBe(0);
        });

        it('should correctly create nested LayerGroup instance', function () {
            const nestedGroup = new LayerGroup([
                new LayerGroup([ new FeatureLayer(), new FeatureLayer() ]),
                new FeatureLayer()
            ]);

            // TODO: rewrite expect to jest assertion https://jr.everpoint.ru/browse/PUB-3459
            // expect(nestedGroup).toEqual(jasmine.any(LayerGroup));
        })
    });
});
