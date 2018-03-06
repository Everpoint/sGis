import "jest";
import {TileScheme} from "../../source/TileScheme";
import {Bbox} from "../../source/Bbox";
import {plain} from "../../source/Crs";
import {TileIndex, TileLayer} from "../../source/layers/TileLayer";

describe('TileLayer', () => {
    describe('._getTileIndexes()', () => {
        it('should return correct y indexes for normal y direction', () => {
            let tileScheme = new TileScheme({
                origin: [0, 10],
                limits: [0, 0, 10, 10],
                reversedY: false,
                tileWidth: 1,
                tileHeight: 1,
                levels: [
                    {zIndex: 0, resolution: 10, indexCount: 1},
                    {zIndex: 1, resolution: 5, indexCount: 2},
                    {zIndex: 2, resolution: 1, indexCount: 10}
                ]
            });

            let layer = new TileLayer('url', {tileScheme: tileScheme, crs: plain});

            let bbox = new Bbox([0, 0], [5, 5], plain);
            let indexes: TileIndex[] = (<any>layer)._getTileIndexes(bbox, 5);
            expect(indexes.length).toBe(1);
            expect(indexes[0].y).toBe(1);
        });

        it('should return correct y indexes for reversed y direction', () => {
            let tileScheme = new TileScheme({
                origin: [0, 0],
                limits: [0, 0, 10, 10],
                reversedY: true,
                tileWidth: 1,
                tileHeight: 1,
                levels: [
                    {zIndex: 0, resolution: 10, indexCount: 1},
                    {zIndex: 1, resolution: 5, indexCount: 2},
                    {zIndex: 2, resolution: 1, indexCount: 10}
                ]
            });

            let layer = new TileLayer('url', {tileScheme: tileScheme, crs: plain});

            let bbox = new Bbox([0, 0], [5, 5], plain);
            let indexes: TileIndex[] = (<any>layer)._getTileIndexes(bbox, 5);
            expect(indexes.length).toBe(1);
            expect(indexes[0].y).toBe(0);
        });
    });
});