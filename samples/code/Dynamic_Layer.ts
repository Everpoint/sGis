/// Template: "full_screen_map.html"
/// Title: "Point symbols"

import {DynamicLayer} from "../../source/DynamicLayer";
import {Bbox} from "../../source/Bbox";
import {init} from "../../source/init";
import {TileLayer} from "../../source/TileLayer";

class ArcGisLayer extends DynamicLayer {
    readonly url: string;

    constructor(url: string, opacity: number) {
        super({opacity});
        this.url = url;
    }

    getUrl(bbox: Bbox, resolution: number): string {
        let imgWidth = Math.round((bbox.xMax - bbox.xMin) / resolution);
        let imgHeight = Math.round((bbox.yMax - bbox.yMin) / resolution);
        let sr = bbox.crs.toString();

        return `${this.url}/export?dpi=96&transparent=true&bbox=${bbox.xMin}%2C${bbox.yMin}%2C${bbox.xMax}%2C${bbox.yMax}` +
            `&bboxSR=${sr}&imageSR=${sr}&size=${imgWidth}%2C${imgHeight}&f=image`;
    }
}

init({
    position: [-10295767.463030389, 4868831.057002825],
    resolution: 4891.969810250004,
    wrapper: document.body,
    layers: [
        new TileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'),
        new ArcGisLayer('//utility.arcgis.com/usrsvcs/rest/services/f060a57639324461a263846c284a6e61/MapServer', 0.5)
    ]
});
