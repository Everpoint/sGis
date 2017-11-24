import {registerSymbol} from "../../serializers/symbolSerializer";
import {Symbol} from "../Symbol";
import {HtmlElement} from "../../renders/HtmlElement";
import {Color} from "../../utils/Color";
import {Offset} from "../../baseTypes";
import {warn} from "../../utils/utils";

/**
 * Symbol of point drawn as masked image.
 * @alias sGis.symbol.point.MaskedImage
 * @extends sGis.Symbol
 */
export class MaskedImage extends Symbol {
    /** Width of the image. If not set, image will be automatically resized according to height. If both width and height are not set, original image size will be used. */
    width = 32;

    /** Height of the image. If not set, image will be automatically resized according to width. If both width and height are not set, original image size will be used. */
    height = 32;

    private _anchorPoint: Offset = [16, 32];

    /**
     * Anchor point of the image. If set to [0, 0], image's left top corner will be at the feature position.<br>
     *     Anchor point does not scale with width and height parameters.
     */
    get anchorPoint(): Offset {
        return this._anchorPoint;
    }
    set anchorPoint(anchorPoint: Offset) {
        // TODO: remove deprecated part after 2018
        let deprecated = <any>anchorPoint;
        if (deprecated.x !== undefined && deprecated.y !== undefined) {
            warn('Using anchorPoint in {x, y} format is deprecated. Use [x, y] format instead.');
            this._anchorPoint = [deprecated.x, deprecated.y];
        } else {
            this._anchorPoint = anchorPoint;
        }
    }

    angle = 0;


    //noinspection SpellCheckingInspection
    _imageSource = 'data:image/png;base64,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';
    //noinspection SpellCheckingInspection
    _maskSource = 'data:image/png;base64,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';
    _maskColor = '#9bdb00';

    private _maskedSrc: string;
    private _image: HTMLImageElement;
    private _mask: HTMLImageElement;


    /**
     * @constructor
     * @param {Object} properties - key-value list of the properties to be assigned to the instance.
     */
    constructor(properties?: Object) {
        super();

        if (properties) Object.assign(this, properties);
        if (!this._image) this.imageSource = this._imageSource;
        if (!this._mask) this.maskSource = this._maskSource;

        this._updateMasked();
    }

    renderFunction(/** sGis.feature.Point */ feature, resolution, crs) {
        if (feature.position === undefined) return [];

        if (!this._isLoaded()) return [];

        var position = feature.projectTo(crs).position;
        var pxPosition = [position[0] / resolution, - position[1] / resolution];
        var renderPosition = [pxPosition[0], pxPosition[1]];

        let widthProp = this.width > 0 ? `width="${this.width}"` : '';
        let heightProp = this.height > 0 ? `height="${this.height}"` : '';
        let translateProp = this.angle !== 0 ? `style="transform-origin: 50% 50%; transform: rotate(${this.angle}rad)"` : '';

        let html = `<img src="${this._maskedSrc}" ${widthProp} ${heightProp} ${translateProp}>`;
        return [new HtmlElement(html, renderPosition, null, [-this.anchorPoint[0], -this.anchorPoint[1]])];
    }

    //noinspection SpellCheckingInspection
    /**
     * Source of the base image. Can be url or data:url string.
     * @type String
     * @default <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABECAYAAAA4E5OyAAAACXBIWXMAABYlAAAWJQFJUiTwAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAB7lJREFUeNrsnH9QVNcVx793Xdhll44GUbEzKNoWzQI6/go4ExHTGujYRg1MYtOpzsQ/mkAaK4nB/6haZ5pO80eTOGxmMmOaTuM/TabSzDBaBIV1tJUxbEQKnSWY8kcMYQwICyzD8u0fvkeXLOze3XcfvExyZt7M7tt7zj3nw333x7nvIkjiW/m/2GP9KIRQVhFJJ4BCAI8C8ADIBZADwA0gTSs2BiAI4A6A/wDoBNAK4F9CiHGFvsT+ca5LQcUukgdI1pMcZ/IyTvK8ZsulAsicMZsBhOQKkqdJfkn18qVme4XlgZBMI3mC5BjNlzGSvyGZZkkgJHeT/JTzL5+S3G0ZICRTSP6e5BQXTqY0H1KMAhGxAo83ypBcDOCvAH5kkVGzEUCFEGIo2VEmaSBap3YBwEaLTSX8AB4XQvTPGxCtZfgA5Ft0ftUB4NG5WkqsmG1JTrAarAYjHA7jxImT6OnpgeZbA0mH2jF59vJeWkwmJyf5i4OHmJLq4OqcNezr69N/8po6ypB8xmowQqEQ9z9ZzpRUx/T1SGERx8amp0I/MwUIyUySA1aDsW//kzNg6FdlVZVebIDkUjOAvG0lGMFgkHv37psVhn41NTfrxd9WCoSkZ4EnXlEwdu9+PCaMlFQH8ws2MBQK6RM3jwwQ2VHmOABhhdFkdHQU+/btx+UrV+KW7e7uxjvv/Ama7zUy9uPOQ0iuBNAHYJHq4O7du4eBgQGMjo4CAFwuFzIzM5GRkTGnTmdnJ4p3luD+/ftSdaxduxYdtz6G3W4PA8gWQnxmKB9C8pjqjvDNM2foycufs6l78vL55pkzenOPkgsXLzLV4Yz7yOhXfX29rnrMcB9Csl0VDL/fz4ING6UDKdiwkX6/f1Zbr7xSI23nqacP6GrthoCQzFIFo6WllRlLM6WD0K+HMpaypaU1yt7IyAhXrc6RsuFO/w6DwaCummWkU92loq/o7e1FeUUFhoeHE9YdGRlBeUUFent7Z9x3u92orj4qZWNiYgLXrl/Xv5bEKhsPSJEKIJWVVRgcHExaf3BwEJWVVVH3Dx08CIdDbrnia/XpH7cbAbLOKAyf7youNTUZhnqpqQk+39UZ95YsWYIfPvaY3PL39m2pmOIByTUayLt/flfZMD2brR3FO6R0A4GAVEzxgGQYDaKlpVUZkNlsrV+/Xkr37t3PpGKKB2Sxig5Vlcxm67srV0p2zkGpmGwwUVRteMWyZ7PJhRAKhaTKmQpECCE9CsiIw+GISmuGQhNSuk6nUwmQIaNB5OXlKQPi8Xii7t25I/dIulwuqZjiARkwGkRZaakyID8uK4tOsfs/ltLNysqSiikekP8aDeLw4WeRkpJiGIbdbsfhw89G3f9HY6OU/upVq6RiigfE8BCRnZ2NyuefNwykqrIS2dnZUfmO9vZ2Kf3c3FypmOIBuamiqZ86dRJbtmxJWn/z5s04depk1P3X33gjARub5GKKs9otUrXa7e//goVF2xNe7RYWbWd//xdR9rq7u+lyp0vb6enp0VWLjCz/7SSHlL2/MDbG6uqX6ExzxQ3AmeZidfVLkdsJM/ZhSnbtkoaxbv3DuuqQFpOhBNEHqpPEgUCANTXHmZdfEOV8Xn4Ba2qOMxAIzKmfSHIoJdXBo0erddUPVGTMDpmZQQ+HwwyFQgyFQgyHw3HL/+7VVxN+7K5du66rH1QBJJ1k0AqbUi++eCRhGA978qZ3L0imG96GEEKMAHh/Ibce2trasKN4J+q83oR1n3vul/rH97VYjG92k9w6768ETU3R57vKp54+kFCGPfJatnwFh4eHdZNbZWK2Sy7S2kheAbDTrFZw48YNDA4N4ZOeT3Dzo5tobLyEvr4+QzZ/9cILSE9PB4DLQog2JRtVEVRLADSbBSTV4VRqb/myZejq+rcOpEQIcSWyhRhe/gshLuPBizJfC6mtrdVhNETCUNZCNLL5AD4C5B61hWohRUWFuNzcDJvNNglgkxCi46v9ppIEkWb4NSu3jNTUVHjr6vRM2mtfhWFGxuwkgIBVgZw+/Vs9kRQAcCLhLF+SbyEW4sFbiHYrPTJlpaU4f/5vEEJM4sFbiP+ca6qhNKeqVVRrpZaRk5ODs2fP6n/E2rlgmNJCNMo2APUA9ix0C3G73fC1tuj52w8B7BVCTMWajCrPumsVPgOgeyFbht1ux3vv/UWH0Q3g57FgmLoNIYS4D+CnKpLRycpbXq+efB4A8BPNp+RFxfEQktuMroiTWavU1XkjV7LblMSs8LxMGcmJ+QLi9b6lq06QLFXWCBSfqHoiWSgGYDyh9KlQfeZOgxIyA4jLnc5z585N54ySgTHvQLQKdyWanJZ51+zCxYuRyeISU/pNs46pktxEsl8FkO99/we8devW9I4GyU2mDSQmn9tdQ7LTCJAdxcW8+/nnerHbJNco8GthgGiVLybZkAyQI0d+HfnyboN2kgtfayCaA4tI/kEWyOIlD0V2ntR0Fyn0Z2GBRDhSTnI4FpCt2x5hV1eXfnuYZLkJflgDiObMOpL+2YC8/PIxjo9P/4sAP8l1JvlgHSCaQ06Sr0cC6ejoiPz6R+2wI74RQCIc20Mycmu/n+SeeajXmkA051aQ/JDk30kun6c6kzvq/k0U27cIZsr/BgDbzNoD8uJVDwAAAABJRU5ErkJggg==">
     */
    get imageSource() { return this._imageSource; }
    set imageSource(/** String */ source) {
        this._imageSource = source;

        this._image = new Image();
        this._image.onload = this._updateMasked.bind(this);
        this._image.src = source;
    }

    //noinspection SpellCheckingInspection
    /**
     * Source of the mask image. Can be url or data:url string.
     * @type String
     * @default <img src="data:image/png;base64,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">
     */
    get maskSource() { return this._maskSource; }
    set maskSource(/** String */ source) {
        this._maskSource = source;

        this._mask  = new Image();
        this._mask.onload = this._updateMasked.bind(this);
        this._mask.src = source;
    }

    /**
     * Color of the mask. Can be any valid css color string.
     * @type String
     * @default "#9bdb00"
     */
    get maskColor() { return this._maskColor; }
    set maskColor(/** String */ color) {
        this._maskColor = color;
        this._updateMasked();
    }

    _isLoaded() { return this._image.complete && this._mask.complete; }

    _updateMasked() {
        if (!this._mask || !this._image || !this._isLoaded()) return;

        var canvas = document.createElement('canvas');
        canvas.width = this._mask.width;
        canvas.height = this._mask.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(this._mask, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._recolorMask(imageData);
        ctx.putImageData(imageData, 0, 0);

        var resultCanvas = document.createElement('canvas');
        resultCanvas.width = this._image.width;
        resultCanvas.height = this._image.height;

        var resultCtx = resultCanvas.getContext('2d');
        resultCtx.drawImage(this._image, 0, 0);
        resultCtx.drawImage(canvas, 0, 0);

        this._maskedSrc = resultCanvas.toDataURL();
    }

    _recolorMask(imageData) {
        var maskColor = new Color(this.maskColor);
        var alphaNormalizer = 65025;

        var d = imageData.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var a = d[i+3];
            var srcA = a * maskColor.a / alphaNormalizer;
            d[i+3] = + Math.round(Math.min(1, srcA) * 255);
            d[i] = maskColor.r * r / 255;
            d[i+1] = maskColor.g * r / 255;
            d[i+2] = maskColor.b * r / 255;
        }
    }
}

registerSymbol(MaskedImage, 'point.MaskedImage', ['width', 'height', 'anchorPoint', 'imageSource', 'maskSource', 'maskColor', 'angle']);
