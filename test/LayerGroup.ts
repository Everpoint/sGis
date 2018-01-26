import "jest";
import {LayerGroup} from "../source/LayerGroup";
import {DynamicLayer} from "../source/layers/DynamicLayer";
import {TileLayer} from "../source/layers/TileLayer";

describe('LayerGroup', function() {
    describe('constructor', function () {
        it('should correctly create simple LayerGroup instance', function () {
            const emptyGroup = new LayerGroup();

            const dynamicLayer = new DynamicLayer(() => {});
            const tileLayer = new TileLayer('url');

            const nonEmptyGroup = new LayerGroup([dynamicLayer, tileLayer]);

            expect(emptyGroup).toEqual(jasmine.any(LayerGroup));
            expect(nonEmptyGroup).toEqual(jasmine.any(LayerGroup));

            expect(emptyGroup.layers.length).toBe(0);
            expect(nonEmptyGroup.layers.length).not.toBe(0);
        });

        it('should correctly create nested LayerGroup instance', function () {
            const nestedGroup = new LayerGroup([
                new LayerGroup([ new DynamicLayer(() => {}), new DynamicLayer(() => {}) ]),
                new DynamicLayer(() => {})
            ]);

            expect(nestedGroup).toEqual(jasmine.any(LayerGroup));
        })
    });
});
