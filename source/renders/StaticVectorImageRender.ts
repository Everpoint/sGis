import {StaticImageRender, StaticImageRenderParams} from "./StaticImageRender";
import {Coordinates} from "../baseTypes";

export interface StaticVectorImageRenderParams extends StaticImageRenderParams {
    position: Coordinates,
    angle?: number
}

export class StaticVectorImageRender extends StaticImageRender {
    private _angle: number;

    position: Coordinates;

    constructor({src, position, width, height, onLoad, offset, angle = 0}: StaticVectorImageRenderParams) {
        super({src, width, height, onLoad, offset});
        this.position = position;
        this.angle = angle;
    }

    contains(position: Coordinates) {
        if (this.angle === 0) return this._boxContains(position[0], position[1]);

        let sin = this._sin;
        let cos = this._cos;

        let dx = position[0] - this.position[0];
        let dy = position[1] - this.position[1];

        let rotatedX = this.position[0] + dx * cos + dy * sin;
        let rotatedY = this.position[1] + dy * cos - dx * sin;

        return this._boxContains(rotatedX, rotatedY);
    }

    private _boxContains(x: number, y: number) {
        let minX = this.position[0] + this.offset[0];
        let minY = this.position[1] + this.offset[1];

        return x > minX
            && x < minX + this.width
            && y > minY
            && y < minY + this.height;
    }

    get angle() { return this._angle; }
    set angle(value: number) {
        this._angle = value;
        this._cachedCos = null;
        this._cachedSin = null;
    }

    private get _sin(): number {
        if (this._cachedSin === null) this._cachedSin = Math.sin(this.angle);
        return this._cachedSin;
    }

    private _cachedSin?: number = null;

    private get _cos(): number {
        if (this._cachedCos === null) this._cachedCos = Math.cos(this.angle);
        return this._cachedCos;
    }

    private _cachedCos?: number = null;
}