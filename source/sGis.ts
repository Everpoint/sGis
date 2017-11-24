import {PolyControl} from "./controls/PolyControl";

export {Map} from "./Map";
import {Circle} from "./controls/Circle";
import {Editor} from "./controls/Editor";
import {MultiPoint} from "./features/MultiPoint";
import {PointControl} from "./controls/Point";
import {PointEditor} from "./controls/PointEditor";
import {Poly} from "./features/Poly";
import {PolyDrag} from "./controls/PolyDrag";
import {PolyEditor} from "./controls/PolyEditor";
import {Polyline} from "./features/Polyline";
import {PolylineControl} from "./controls/PolylineControl";
import {PolygonControl} from "./controls/PolygonControl";
import {PolyTransform} from "./controls/PolyTransform";
import {Rectangle} from "./controls/Rectangle";
import {Snapping} from "./controls/Snapping";
import * as CrsModule from "./Crs";
export {DynamicLayer} from "./DynamicLayer";
export {EventHandler} from "./EventHandler";
export {Feature} from "./features/Feature";
import {ImageFeature} from "./features/ImageFeature";
import {Label} from "./features/Label";
import {Maptip} from "./features/Maptip";
import {PointFeature} from "./features/Point";
import {Polygon} from "./features/Polygon";
export {FeatureLayer} from "./FeatureLayer";
export {Layer} from "./Layer";
export {LayerGroup} from "./LayerGroup";
import {DomPainter} from "./painters/DomPainter/DomPainter";
import {Container} from "./painters/DomPainter/Container";
import {EventDispatcher} from "./painters/DomPainter/EventDispatcher";
import {SvgRender} from "./painters/DomPainter/SvgRender";
import {LayerRenderer} from "./painters/DomPainter/LayerRenderer";
import {Canvas} from "./painters/DomPainter/Canvas";
export {Point} from "./Point";
import {Arc} from "./renders/Arc";
import {ImageRender} from "./renders/Image";
import {Point as PointRender} from "./renders/Point";
import {PolyRender} from "./renders/Poly";
export {Symbol} from "./symbols/Symbol";
import {ImageSymbol} from "./symbols/Image";
import {LabelSymbol} from "./symbols/LabelSymbol";
import {MaptipSymbol} from "./symbols/MaptipSymbol";
import {PointImageSymbol} from "./symbols/point/PointImageSymbol";
import {MaskedImage} from "./symbols/point/MaskedImage";
import {PointSymbol} from "./symbols/point/Point";
import {SquareSymbol} from "./symbols/point/Square";
import {BrushFill} from "./symbols/polygon/BrushFill";
import {ImageFill} from "./symbols/polygon/ImageFill";
import {PolygonSymbol} from "./symbols/polygon/Simple";
import {PolylineSymbol} from "./symbols/PolylineSymbol";
export {TileLayer} from "./TileLayer";
export {TileScheme} from "./TileScheme";
import * as utilsModule from "./utils/utils";
import {Color} from "./utils/Color";
import * as mathModule from "./utils/math";
import * as geotoolsModule from "./geotools";
import * as symbolSerializer from "./serializers/symbolSerializer";
import * as eventModule from "./utils/domEvent";
import {EditorSymbol} from "./symbols/EditorSymbol";

export const math = mathModule;
export const geotools = geotoolsModule;
export const event = eventModule;

export {Bbox} from "./Bbox";
export {Control} from "./controls/Control";

export const version = "0.3.2";
export const releaseDate = "17.11.2017";

let utilsModulesExt = <any>{};
Object.assign(utilsModulesExt, utilsModule, { Color: Color });

export const controls = {
    Circle: Circle,
    Editor: Editor,
    MultiPoint: MultiPoint,
    Point: PointControl,
    PointEditor: PointEditor,
    Poly: PolyControl,
    PolyDrag: PolyDrag,
    PolyEditor: PolyEditor,
    Polyline: PolylineControl,
    Polygon: PolygonControl,
    PolyTransform: PolyTransform,
    Rectangle: Rectangle,
    Snapping: Snapping
};

export const Crs = CrsModule.Crs;
export const CRS = CrsModule;

export const feature = {
    Image: ImageFeature,
    Label: Label,
    Maptip: Maptip,
    MultiPoint: MultiPoint,
    Point: PointFeature,
    Poly: Poly,
    Polygon: Polygon,
    Polyline: Polyline
};

export const painter = {
    DomPainter: DomPainter,
    domPainter: {
        Container: Container,
        EventDispatcher: EventDispatcher,
        SvgRender: SvgRender,
        LayerRenderer: LayerRenderer,
        Canvas: Canvas
    }
};

export const render = {
    Arc: Arc,
    HtmlElement: HTMLElement,
    ImageRender: ImageRender,
    Point: PointRender,
    Polygon: PolyRender
};

export const symbol = {
    image: { Image: ImageSymbol },
    label: { Label: LabelSymbol },
    maptip: { Simple: MaptipSymbol },
    point: {
        Image: PointImageSymbol,
        MaskedImage: MaskedImage,
        Point: PointSymbol,
        Square: SquareSymbol
    },
    polygon: {
        BrushFill: BrushFill,
        ImageFill: ImageFill,
        Simple: PolygonSymbol
    },
    polyline: { Simple: PolylineSymbol },
    Editor: EditorSymbol
};


export const utils = utilsModulesExt;

export const serializer = {
    symbolSerializer: symbolSerializer
};

export {init} from "./init";
