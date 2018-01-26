import {StaticImageRender, StaticImageRenderParams} from "./StaticImageRender";
import {Coordinates} from "../baseTypes";

export interface StaticVectorImageRenderParams extends StaticImageRenderParams {
    position: Coordinates,
    angle?: number
}

export class StaticVectorImageRender extends StaticImageRender {
    position: Coordinates;
    angle: number;

    constructor({src, position, width, height, onLoad, offset, angle = 0}: StaticVectorImageRenderParams) {
        super({src, width, height, onLoad, offset});
        this.position = position;
        this.angle = angle;
    }

    contains(position: Coordinates) {
        let minX = this.position[0] + this.offset[0];
        let minY = this.position[1] + this.offset[1];

        return position[0] > minX
            && position[0] < minX + this.width
            && position[1] > minY
            && position[1] < minY + this.height;
    }
}