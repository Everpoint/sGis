import {Map} from "./Map";
import {Bbox} from "./Bbox";
import {Control} from "./controls/Control";
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
import * as CRS from "./Crs";
import {DynamicLayer} from "./DynamicLayer";
import {EventHandler} from "./EventHandler";
import {Feature} from "./features/Feature";
import {ImageFeature} from "./features/ImageFeature";
import {Label} from "./features/Label";
import {Maptip} from "./features/Maptip";
import {PointFeature} from "./features/Point";
import {Polygon} from "./features/Polygon";
import {FeatureLayer} from "./FeatureLayer";
import {Layer} from "./Layer";
import {LayerGroup} from "./LayerGroup";
import {DomPainter} from "./painters/DomPainter/DomPainter";
import {Container} from "./painters/DomPainter/Container";
import {EventDispatcher} from "./painters/DomPainter/EventDispatcher";
import {SvgRender} from "./painters/DomPainter/SvgRender";
import {LayerRenderer} from "./painters/DomPainter/LayerRenderer";
import {Canvas} from "./painters/DomPainter/Canvas";
import {Point} from "./Point";
import {Arc} from "./renders/Arc";
import {ImageRender} from "./renders/Image";
import {Point as PointRender} from "./renders/Point";
import {PolygonRender} from "./renders/Polygon";
import {PolylineRender} from "./renders/Polyline";
import {Symbol} from "./symbols/Symbol";
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
import {PolylineSymbol} from "./symbols/Polyline";
import {TileLayer} from "./TileLayer";
import {TileScheme} from "./TileScheme";
import * as utils from "./utils/utils";
import {Color} from "./utils/Color";
import * as math from "./utils/math";
import * as geotools from "./geotools";
import * as symbolSerializer from "./serializers/symbolSerializer";
import * as event from "./utils/domEvent";

let sGis: any = {};

sGis.version = "0.3.0";
sGis.releaseDate = "02.10.2017";


sGis.Bbox = Bbox;
sGis.Control = Control;

sGis.controls = {
    Circle: Circle,
    Editor: Editor,
    MultiPoint: MultiPoint,
    Point: PointControl,
    PointEditor: PointEditor,
    Poly: Poly,
    PolyDrag: PolyDrag,
    PolyEditor: PolyEditor,
    Polyline: PolylineControl,
    Polygon: PolygonControl,
    PolyTransform: PolyTransform,
    Rectangle: Rectangle,
    Snapping: Snapping
};

sGis.Crs = CRS.Crs;
sGis.CRS = CRS;
sGis.DynamicLayer = DynamicLayer;
sGis.EventHandler = EventHandler;
sGis.Feature = Feature;

sGis.feature = {
    Image: ImageFeature,
    Label: Label,
    Maptip: Maptip,
    MultiPoint: MultiPoint,
    Point: PointFeature,
    Poly: Poly,
    Polygon: Polygon,
    Polyline: Polyline
};

sGis.FeatureLayer = FeatureLayer;
sGis.Layer = Layer;
sGis.LayerGroup = LayerGroup;
sGis.Map = Map;

sGis.painter = {
    DomPainter: DomPainter,
    domPainter: {
        Container: Container,
        EventDispatcher: EventDispatcher,
        SvgRender: SvgRender,
        LayerRenderer: LayerRenderer,
        Canvas: Canvas
    }
};

sGis.Point = Point;
sGis.render = {
    Arc: Arc,
    HtmlElement: HTMLElement,
    ImageRender: ImageRender,
    Point: PointRender,
    Polygon: PolygonRender,
    Polyline: PolylineRender
};

sGis.Symbol = Symbol;
sGis.symbol = {
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
    polyline: { Simple: PolylineSymbol }
};

sGis.TileLayer = TileLayer;
sGis.TileScheme = TileScheme;
sGis.utils = utils;
sGis.utils.Color = Color;
sGis.math = math;
sGis.geotools = geotools;
sGis.serializers = {
    symbolSerializer: symbolSerializer
};
sGis.event = event;