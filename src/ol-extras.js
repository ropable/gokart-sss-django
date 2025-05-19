// import ol from 'openlayers/dist/ol-debug.js'
/**
 * Render a grid for a coordinate system on a map.
 * Based on https://github.com/Brictarus/ol3/blob/d41eb87204e76cbf99d61915eb89b1c16c4a4e05/src/ol/graticule.js
 */
// import ExportComponent from '../components/layers/export.vue';

var labelGrat = function (optOptions) {
  var options = {
    showLabels: true,
    lonLabelFormatter: function (lon) {
      var formattedLon = Math.abs(Math.round(lon * 1000) / 1000)
      formattedLon += lon < 0 ? 'W' : lon > 0 ? 'E' : ''
      return formattedLon
    },
    lonLabelPosition: 0.02,
    latLabelFormatter: function (lat) {
      var formattedLat = Math.abs(Math.round(lat * 1000) / 1000)
      formattedLat += lat < 0 ? 'S' : lat > 0 ? 'N' : ''
      return formattedLat
    },
    latLabelPosition: 0.98
  }

  // new ol.layer.Graticule.call(this, optOptions)
  new ol.layer.Graticule(this, optOptions)
  this.meridiansLabels_ = []
  this.parallelsLabels_ = []
  this.baseTextStyle_ = {
    font: '10px Helvetica,Roboto,Arial,sans-serif',
    textAlign: 'center',
    fill: new ol.style.Fill({
      color: 'rgba(0,0,0,.8)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(255,255,255,.8)',
      width: 2
    })
  }
  this.showLabels_ = options.showLabels !== undefined ? options.showLabels : false
  this.lonLabelFormatter_ = options.lonLabelFormatter !== undefined ? options.lonLabelFormatter : null
  this.lonLabelPosition_ = options.lonLabelPosition !== undefined ? ol.math.clamp(options.lonLabelPosition, 0, 1) : 1
  this.latLabelFormatter_ = options.latLabelFormatter !== undefined ? options.latLabelFormatter : null
  this.latLabelPosition_ = options.latLabelPosition !== undefined ? ol.math.clamp(options.latLabelPosition, 0, 1) : 1
  this.setMap(options.map !== undefined ? options.map : null)
}
ol.inherits(labelGrat, ol.layer.Graticule)
labelGrat.intervals_ = [5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.01, 0.005, 0.002, 0.001]
labelGrat.prototype.addMeridianLabel_ = function (lon, squaredTolerance, extent, index) {
  var textPoint = this.getMeridianPoint_(lon, squaredTolerance, extent, index)
  var style = new ol.style.Text(this.baseTextStyle_)
  style.setText(this.lonLabelFormatter_ ? this.lonLabelFormatter_(lon) : lon.toString())
  style.setTextBaseline('bottom')
  style.setTextAlign('center')
  this.meridiansLabels_[index++] = {
    geom: textPoint,
    style: style
  }
  return index
}
labelGrat.prototype.getMeridianPoint_ = function (lon, squaredTolerance, extent, index) {
  var flatCoordinates = ol.geom.flat.geodesic.meridian(lon, this.minLat_, this.maxLat_, this.projection_, squaredTolerance)
  var lat = extent[1] + Math.abs(extent[1] - extent[3]) * this.lonLabelPosition_
  var coordinate = [flatCoordinates[0], lat]
  var point = this.meridiansLabels_[index] !== undefined ? this.meridiansLabels_[index].geom : new ol.geom.Point(null)
  point.setCoordinates(coordinate)
  return point
}
labelGrat.prototype.addParallelLabel_ = function (lat, squaredTolerance, extent, index) {
  var textPoint = this.getParallelPoint_(lat, squaredTolerance, extent, index)
  var style = new ol.style.Text(this.baseTextStyle_)
  style.setTextBaseline('middle')
  style.setText(this.latLabelFormatter_ ? this.latLabelFormatter_(lat) : lat.toString())
  style.setTextAlign('right')
  this.parallelsLabels_[index++] = {
    geom: textPoint,
    style: style
  }
  return index
}
labelGrat.prototype.getParallelPoint_ = function (lat, squaredTolerance, extent, index) {
  var flatCoordinates = ol.geom.flat.geodesic.parallel(lat, this.minLon_, this.maxLon_, this.projection_, squaredTolerance)
  var lon = extent[0] + Math.abs(extent[0] - extent[2]) * this.latLabelPosition_
  var coordinate = [lon, flatCoordinates[1]]
  var point = this.parallelsLabels_[index] !== undefined ? this.parallelsLabels_[index].geom : new ol.geom.Point(null)
  point.setCoordinates(coordinate)
  return point
}
labelGrat.prototype.createGraticule_ = function (extent, center, resolution, squaredTolerance) {
  var interval = this.getInterval_(resolution)
  if (interval === -1) {
    this.meridians_.length = this.parallels_.length = 0
    this.meridiansLabels_.length = this.parallelsLabels_.length = 0
    return
  }
  var centerLonLat = this.toLonLatTransform_(center)
  var centerLon = centerLonLat[0]
  var centerLat = centerLonLat[1]
  var validExtent = [
    Math.max(extent[0], this.minLonP_),
    Math.max(extent[1], this.minLatP_),
    Math.min(extent[2], this.maxLonP_),
    Math.min(extent[3], this.maxLatP_)
  ]
  var maxLines = this.maxLines_
  validExtent = ol.proj.transformExtent(validExtent, this.projection_, 'EPSG:4326')
  var maxLat = validExtent[3]
  var maxLon = validExtent[2]
  var minLat = validExtent[1]
  var minLon = validExtent[0]
  centerLon = Math.floor(centerLon / interval) * interval
  var lon = ol.math.clamp(centerLon, this.minLon_, this.maxLon_)
  var idx = this.addMeridian_(lon, minLat, maxLat, squaredTolerance, extent, 0)
  if (this.showLabels_) {
    idxLabels = this.addMeridianLabel_(lon, squaredTolerance, extent, 0)
  }
  var cnt = 0
  while (lon !== this.minLon_ && cnt++ < maxLines) {
    lon = Math.max(lon - interval, this.minLon_)
    idx = this.addMeridian_(lon, minLat, maxLat, squaredTolerance, extent, idx)
    if (this.showLabels_) {
      idxLabels = this.addMeridianLabel_(lon, squaredTolerance, extent, idxLabels)
    }
  }
  lon = ol.math.clamp(centerLon, this.minLon_, this.maxLon_)
  cnt = 0
  while (lon !== this.maxLon_ && cnt++ < maxLines) {
    lon = Math.min(lon + interval, this.maxLon_)
    idx = this.addMeridian_(lon, minLat, maxLat, squaredTolerance, extent, idx)
    if (this.showLabels_) {
      idxLabels = this.addMeridianLabel_(lon, squaredTolerance, extent, idxLabels)
    }
  }
  this.meridians_.length = idx
  this.meridiansLabels_.length = idxLabels
  centerLat = Math.floor(centerLat / interval) * interval
  var lat = ol.math.clamp(centerLat, this.minLat_, this.maxLat_)
  var idxLabels = 0
  idx = this.addParallel_(lat, minLon, maxLon, squaredTolerance, extent, 0)
  if (this.showLabels_) {
    idxLabels = this.addParallelLabel_(lat, squaredTolerance, extent, 0)
  }
  cnt = 0
  while (lat !== this.minLat_ && cnt++ < maxLines) {
    lat = Math.max(lat - interval, this.minLat_)
    idx = this.addParallel_(lat, minLon, maxLon, squaredTolerance, extent, idx)
    if (this.showLabels_) {
      idxLabels = this.addParallelLabel_(lat, squaredTolerance, extent, idxLabels)
    }
  }
  lat = ol.math.clamp(centerLat, this.minLat_, this.maxLat_)
  cnt = 0
  while (lat !== this.maxLat_ && cnt++ < maxLines) {
    lat = Math.min(lat + interval, this.maxLat_)
    idx = this.addParallel_(lat, minLon, maxLon, squaredTolerance, extent, idx)
    if (this.showLabels_) {
      idxLabels = this.addParallelLabel_(lat, squaredTolerance, extent, idxLabels)
    }
  }
  this.parallels_.length = idx
  this.parallelsLabels_.length = idxLabels
}
labelGrat.prototype.handlePostCompose_ = function (e) {
  var vectorContext = e.vectorContext
  var frameState = e.frameState
  var extent = frameState.extent
  var viewState = frameState.viewState
  var center = viewState.center
  var projection = viewState.projection
  var resolution = viewState.resolution
  var pixelRatio = frameState.pixelRatio
  var squaredTolerance = resolution * resolution / (4 * pixelRatio * pixelRatio)
  var updateProjectionInfo = !this.projection_ || !ol.proj.equivalent(this.projection_, projection)
  if (updateProjectionInfo) {
    this.updateProjectionInfo_(projection)
  }
  var offsetX = 0
  if (projection.canWrapX()) {
    var projectionExtent = projection.getExtent()
    var worldWidth = ol.extent.getWidth(projectionExtent)
    var x = frameState.focus[0]
    if (x < projectionExtent[0] || x > projectionExtent[2]) {
      var worldsAway = Math.ceil((projectionExtent[0] - x) / worldWidth)
      offsetX = worldWidth * worldsAway
      extent = [extent[0] + offsetX, extent[1], extent[2] + offsetX, extent[3]]
    }
  }
  this.createGraticule_(extent, center, resolution, squaredTolerance)
  vectorContext.setFillStrokeStyle(null, this.strokeStyle_)
  var i, l, line
  for (i = 0, l = this.meridians_.length; i < l; ++i) {
    line = this.meridians_[i]
    vectorContext.drawLineString(line, null)
  }
  for (i = 0, l = this.parallels_.length; i < l; ++i) {
    line = this.parallels_[i]
    vectorContext.drawLineString(line, null)
  }
  if (this.showLabels_) {
    var point, style
    for (i = 0, l = this.meridiansLabels_.length; i < l; ++i) {
      point = this.meridiansLabels_[i].geom
      style = this.meridiansLabels_[i].style
      vectorContext.setTextStyle(style)
      vectorContext.drawPoint(point, null)
    }
    for (i = 0, l = this.parallelsLabels_.length; i < l; ++i) {
      point = this.parallelsLabels_[i].geom
      style = this.parallelsLabels_[i].style
      vectorContext.setTextStyle(style)
      vectorContext.drawPoint(point, null)
    }
  }
}
ol.LabelGraticule = labelGrat

var DEFAULT_OVERVIEWMAP_MIN_RATIO = ol.OVERVIEWMAP_MIN_RATIO
var DEFAULT_OVERVIEWMAP_MAX_RATIO = ol.OVERVIEWMAP_MAX_RATIO

var DefaultOverviewMap =  ol.control.OverviewMap

// ol.control.OverviewMap = function(options){
//     options = options || {}
//     this.min_ratio = options.min_ratio || DEFAULT_OVERVIEWMAP_MIN_RATIO
//     this.max_ratio = options.max_ratio || DEFAULT_OVERVIEWMAP_MAX_RATIO
//     // DefaultOverviewMap.call(this,options)
//     new DefaultOverviewMap(this,options)
//     return this
// }
//ol.inherits(ol.control.OverviewMap,DefaultOverviewMap)

// ol.control.OverviewMap.render = function(mapEvent) {
//     this.validateExtent_();
//     this.updateBox_();
// };


new ol.Collection(["validateExtent_","resetExtent_"]).forEach(function(name,index) {
    ol.control.OverviewMap.prototype[name] = function() {
        var originalFunc = DefaultOverviewMap.prototype[name]
        return function() {
            try{
                ol.OVERVIEWMAP_MIN_RATIO = this.min_ratio
                ol.OVERVIEWMAP_MAX_RATIO = this.max_ratio
                originalFunc.call(this)
            } finally{
                ol.OVERVIEWMAP_MIN_RATIO = DEFAULT_OVERVIEWMAP_MIN_RATIO
                ol.OVERVIEWMAP_MAX_RATIO = DEFAULT_OVERVIEWMAP_MAX_RATIO
            }
        }
    }()
})

///////////////////////////////////////////////event simulator////////////////////////////////////////
//type is "pointermove","pointerdown" or "pointerup"
ol.Map.prototype.simulateEvent = function(type, x, y, opt_shiftKey) {
    var viewport = this.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    var position = viewport.getBoundingClientRect();
    var shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false;
    var event = new ol.pointer.PointerEvent(type, {
      clientX: position.left + x,
      clientY: position.top + y,
      shiftKey: shiftKey
    });
    this.handleMapBrowserEvent(new ol.MapBrowserPointerEvent(type, this, event));
  }

  
  // Copied from openlayers 4.1.1
  ol.events.EventType = {
    /**
     * Generic change event. Triggered when the revision counter is increased.
     * @event ol.events.Event#change
     * @api
     */
    CHANGE: 'change',
  
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    DRAGENTER: 'dragenter',
    DRAGOVER: 'dragover',
    DROP: 'drop',
    ERROR: 'error',
    KEYDOWN: 'keydown',
    KEYPRESS: 'keypress',
    LOAD: 'load',
    MOUSEDOWN: 'mousedown',
    MOUSEMOVE: 'mousemove',
    MOUSEOUT: 'mouseout',
    MOUSEUP: 'mouseup',
    MOUSEWHEEL: 'mousewheel',
    MSPOINTERDOWN: 'MSPointerDown',
    RESIZE: 'resize',
    TOUCHSTART: 'touchstart',
    TOUCHMOVE: 'touchmove',
    TOUCHEND: 'touchend',
    WHEEL: 'wheel'
  };


  ol.interaction.Draw.Mode_ = {
    CIRCLE : "Circle",
    LINE_STRING : "LineString",
    POINT : "Point",
    POLYGON : "Polygon",
  }

/**
 * @private
 * @param {number} degrees Degrees.
 * @param {string} hemispheres Hemispheres.
 * @param {number=} opt_fractionDigits The number of digits to include
 *    after the decimal point. Default is `0`.
 * @return {string} String.
 */
ol.coordinate.degreesToStringHDMS_ = function(degrees, hemispheres, opt_fractionDigits) {
  var normalizedDegrees = ol.math.modulo(degrees + 180, 360) - 180;
  var x = Math.abs(3600 * normalizedDegrees);
  var dflPrecision = opt_fractionDigits || 0;
  var precision = Math.pow(10, dflPrecision);

  var deg = Math.floor(x / 3600);
  var min = Math.floor((x - deg * 3600) / 60);
  var sec = x - (deg * 3600) - (min * 60);
  sec = Math.ceil(sec * precision) / precision;

  if (sec >= 60) {
    sec = 0;
    min += 1;
  }

  if (min >= 60) {
    min = 0;
    deg += 1;
  }

  return deg + '\u00b0 ' + ol.string.padNumber(min, 2) + '\u2032 ' +
    ol.string.padNumber(sec, 2, dflPrecision) + '\u2033 ' +
    hemispheres.charAt(normalizedDegrees < 0 ? 1 : 0);
};
const DEFAULT_DPI = 90;
const LEADING_DIGITS = [1, 2, 5];
ol.control.ScaleLine.prototype.updateElement_ = function() {
  const viewState = this.viewState_;

  if (!viewState) {
    if (this.renderedVisible_) {
      this.element.style.display = 'none';
      this.renderedVisible_ = false;
    }
    return;
  }

  const center = viewState.center;
  const projection = viewState.projection;
  const units = this.getUnits();
  const pointResolutionUnits = units == 'degrees' ? 'degrees' : 'm';
  let pointResolution = ol.proj.getPointResolution(
    projection,
    viewState.resolution,
    center,
    pointResolutionUnits,
  );
  pointResolution = pointResolution * 0.92;

  const minWidth =
    (this.minWidth_ * (this.dpi_ || DEFAULT_DPI)) / DEFAULT_DPI;

  const maxWidth =
    this.maxWidth_ !== undefined
      ? (this.maxWidth_ * (this.dpi_ || DEFAULT_DPI)) / DEFAULT_DPI
      : undefined;

  let nominalCount = minWidth * pointResolution;
  let suffix = '';
  if (units == 'degrees') {
    const metersPerDegree = METERS_PER_UNIT.degrees;
    nominalCount *= metersPerDegree;
    if (nominalCount < metersPerDegree / 60) {
      suffix = '\u2033'; // seconds
      pointResolution *= 3600;
    } else if (nominalCount < metersPerDegree) {
      suffix = '\u2032'; // minutes
      pointResolution *= 60;
    } else {
      suffix = '\u00b0'; // degrees
    }
  } else if (units == 'imperial') {
    if (nominalCount < 0.9144) {
      suffix = 'in';
      pointResolution /= 0.0254;
    } else if (nominalCount < 1609.344) {
      suffix = 'ft';
      pointResolution /= 0.3048;
    } else {
      suffix = 'mi';
      pointResolution /= 1609.344;
    }
  } else if (units == 'nautical') {
    pointResolution /= 1852;
    suffix = 'NM';
  } else if (units == 'metric') {
    if (nominalCount < 1e-6) {
      suffix = 'nm';
      pointResolution *= 1e9;
    } else if (nominalCount < 0.001) {
      suffix = 'μm';
      pointResolution *= 1000000;
    } else if (nominalCount < 1) {
      suffix = 'mm';
      pointResolution *= 1000;
    } else if (nominalCount < 1000) {
      suffix = 'm';
    } else {
      suffix = 'km';
      pointResolution /= 1000;
    }
  } else if (units == 'us') {
    if (nominalCount < 0.9144) {
      suffix = 'in';
      pointResolution *= 39.37;
    } else if (nominalCount < 1609.344) {
      suffix = 'ft';
      pointResolution /= 0.30480061;
    } else {
      suffix = 'mi';
      pointResolution /= 1609.3472;
    }
  } else {
    throw new Error('Invalid units');
  }

  let i = 3 * Math.floor(Math.log(minWidth * pointResolution) / Math.log(10));
  let count, width, decimalCount;
  let previousCount = 0;
  let previousWidth, previousDecimalCount;
  while (true) {
    decimalCount = Math.floor(i / 3);
    const decimal = Math.pow(10, decimalCount);
    count = LEADING_DIGITS[((i % 3) + 3) % 3] * decimal;
    width = Math.round(count / pointResolution);
    if (isNaN(width)) {
      this.element.style.display = 'none';
      this.renderedVisible_ = false;
      return;
    }
    if (maxWidth !== undefined && width >= maxWidth) {
      count = previousCount;
      width = previousWidth;
      decimalCount = previousDecimalCount;
      break;
    } else if (width >= minWidth) {
      break;
    }
    previousCount = count;
    previousWidth = width;
    previousDecimalCount = decimalCount;
    ++i;
  }
  const html = this.scaleBar_
    ? this.createScaleBar(width, count, suffix)
    : count.toFixed(decimalCount < 0 ? -decimalCount : 0) + ' ' + suffix;

  if (this.renderedHTML_ != html) {
    this.innerElement_.innerHTML = html;
    this.renderedHTML_ = html;
  }

  if (this.renderedWidth_ != width) {
    this.innerElement_.style.width = width + 'px';
    this.renderedWidth_ = width;
  }

  if (!this.renderedVisible_) {
    this.element.style.display = '';
    this.renderedVisible_ = true;
  }
}

ol.control.ScaleLine.prototype.getScaleForResolution = function(){
  const resolution = ol.proj.getPointResolution(
    this.viewState_.projection,
    this.viewState_.resolution,
    this.viewState_.center,
    'm',
  );
  const dpi = this.dpi_ || DEFAULT_DPI;
  const inchesPerMeter = 1000 / 25.4;
  return resolution * inchesPerMeter * dpi * 0.9237;
}


export default ol

