import * as d3 from 'd3';
import { RADIANS, AXIS_QUADS } from '../../const.js';
const { QUAD_1, QUAD_2, QUAD_3, QUAD_4 } = AXIS_QUADS;

function __setupZoomLops (params) {
  const { maxZoom, minZoom } = params.zoomProps.scaleExtent;
  const {
    width,
    scaledTitleSize,
    scaledTickSize,
    maxZoomFont,
    textLineSpacingPx
  } = params;

  const axisTitleSizeLop = d3.scaleLog()
    .base(5)
    .domain([minZoom, maxZoom])
    .range([scaledTitleSize, scaledTitleSize * 0.1]);

  const axisTitleSizeLopMin = d3.scaleLog()
    .base(5)
    .domain([minZoom, maxZoom])
    .range([3, 2]);

  const tickFontLop = d3.scaleLog()
    .domain([minZoom, maxZoom])
    .range([scaledTickSize, maxZoomFont]);

  const axisLabelFactorLop = d3.scaleLog()
    .domain([minZoom, maxZoom])
    .range([0.2, 0.1]);

  const labelLineSpacingLop = d3.scaleLinear()
    .domain([minZoom, maxZoom])
    .range([textLineSpacingPx(width), textLineSpacingPx(width) * 0.1]);

  const labelLineSpaceLopMin = d3.scaleLinear()
    .domain([minZoom, maxZoom])
    .range([
      textLineSpacingPx(width) * 0.5,
      textLineSpacingPx(width) * 0.3 * 0.5
    ]);

  return {
    axisTitleSizeLop,
    axisTitleSizeLopMin,
    tickFontLop,
    axisLabelFactorLop,
    labelLineSpacingLop,
    labelLineSpaceLopMin
  };
}

function __setupSizeScales (params) {
  const {
    axisScaleProps,
    axisLabelCordLop,
    lines,
    projectValueOnAxis,
    textOverflowWidthLimit,
    width,
    zoomProps
  } = params;

  const tickScale = d3.scaleLinear()
    .domain([100, 1200])
    .range([5, 20]);

  const axisTitleScale = d3.scaleLinear()
    .domain([100, 1200])
    .range([axisScaleProps.minTitleSize, axisScaleProps.maxTitleSize]);

  const textLineSpacingPx = d3.scaleLinear()
    .domain([100, 1200])
    .range([
      axisScaleProps.minTextLineSpacing,
      axisScaleProps.maxTextLineSpacing
    ]);

  const axisLabelCords = function _axisLabelCords (zoomK) {
    if (!zoomK) {
      return projectValueOnAxis(
        axisLabelCordLop(zoomProps.scaleExtent.minZoom)
      );
    }
    return projectValueOnAxis(axisLabelCordLop(zoomK));
  };

  const scaledTickSize = tickScale(width);
  const scaledTitleSize = axisTitleScale(width);
  const currentTickSize = tickScale(width);

  const overLayWidth = axisTitleScale(width) * textOverflowWidthLimit;
  const overLayx = () => axisLabelCords().x - overLayWidth / 2;
  const overLayHeight = () => (1 + lines.length) * axisTitleScale(width) * 2;
  const overLayy = () => axisLabelCords().y - overLayHeight() / 2.5;

  return {
    tickScale: tickScale,
    axisTitleScale: axisTitleScale,
    textLineSpacingPx: textLineSpacingPx,
    axisLabelCords: axisLabelCords,
    scaledTickSize: scaledTickSize,
    scaledTitleSize: scaledTitleSize,
    currentTickSize: currentTickSize,
    overLayWidth: overLayWidth,
    overLayx: overLayx,
    overLayHeight: overLayHeight,
    overLayy: overLayy
  };
}

const buildAxis = function _buildAxis (params) {
  const {
    axisScaleProps,
    zoomProps,
    width,
    axisIndex,
    axisOptions,
    innerW,
    innerH,
    optsLeftChartOffset,
    optsTopChartOffset,
    maxAxisNo,
    maxZoomFont,
    maxValue: globalMaxValue,
    textOverflowWidthLimit,
    textOverflowWidthLimitZoomed,
    useGlobalMax
  } = params;

  const x1 = optsLeftChartOffset + innerW / 2;
  const y1 = optsTopChartOffset + innerH / 2;
  const x2 =
    optsLeftChartOffset +
    (innerW / 2) * (1 - Math.sin((axisIndex * RADIANS) / maxAxisNo));
  const y2 =
    optsTopChartOffset +
    (innerH / 2) * (1 - Math.cos((axisIndex * RADIANS) / maxAxisNo));

  let quad = null;
  if (x2 < x1 && y2 <= y1) {
    quad = QUAD_1;
  } else if (x2 >= x1 && y2 <= y1) {
    quad = QUAD_2;
  } else if (x2 <= x1 && y2 >= y1) {
    quad = QUAD_3;
  } else if (x2 >= x1 && y2 >= y1) {
    quad = QUAD_4;
  }

  const labelX = x2;
  const labelY = y2;

  // Note the gradients are inversed because of the SVG co-ordinate system.
  const gradient =
    Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
  const linearConstant = gradient === Infinity ? 0 : y2 - gradient * x2;

  // Axis max value
  const maxValue = useGlobalMax ? globalMaxValue : axisOptions.axisValueMax;
  // Axis min value
  const minValue =
    useGlobalMax || isNaN(axisOptions.axisValueMin)
      ? 0
      : axisOptions.axisValueMin;
  const range = maxValue - minValue;
  const axisLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angleFromNorth =
    (180 / Math.PI) * (1 - (axisIndex * RADIANS) / maxAxisNo) -
    180 / Math.PI -
    90 -
    ((180 / Math.PI) * 10) / axisLength / 2;
  const axisId = axisOptions.axisId;
  const label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

  // Split the axis label into lines for renderings
  const words = label.split(' ');
  let lines = [words[0]];
  lines = words.slice(1).reduce((acc, word) => {
    if (acc[acc.length - 1].length + word.length <= textOverflowWidthLimit) {
      acc[acc.length - 1] = acc[acc.length - 1] + ' ' + word;
    } else {
      acc.push(word);
    }
    return acc;
  }, lines);

  let zoomLines = [words[0]];
  zoomLines = words.slice(1).reduce((acc, word) => {
    if (
      acc[acc.length - 1].length + word.length <=
      textOverflowWidthLimitZoomed
    ) {
      acc[acc.length - 1] = acc[acc.length - 1] + ' ' + word;
    } else {
      acc.push(word);
    }
    return acc;
  }, zoomLines);

  const projectValueOnAxisXMultTerm = Math.sin(
    (axisIndex * RADIANS) / maxAxisNo
  );
  const projectValueOnAxisYMultTerm = Math.cos(
    (axisIndex * RADIANS) / maxAxisNo
  );

  /**
   * Project a cordinate on the svg onto this axis
   * @param x {Float} x-value
   * @param y {Float} y-value
   */
  const projectCordToAxis = function (x, y) {
    if (gradient === Infinity) {
      return { x: x1, y: y };
    }
    if (gradient < -2 || (gradient >= 0 || gradient < 0.145)) {
      return { x: x, y: gradient * x + linearConstant };
    }
    return { x: (y - linearConstant) / gradient, y: y };
  };

  /**
   * Project a value onto the axis.
   * @param value {Float}
   * @return cordinates Like {x: Float, y: Float}
   */
  const projectValueOnAxis = function (value) {
    return {
      x:
        optsLeftChartOffset +
        (innerW / 2) *
          (1 -
            ((parseFloat(value) - minValue) / range) *
              projectValueOnAxisXMultTerm),
      y:
        optsTopChartOffset +
        (innerH / 2) *
          (1 -
            ((parseFloat(value) - minValue) / range) *
              projectValueOnAxisYMultTerm)
    };
  };

  // Convert a coordinate on the axis to a value
  const cordOnAxisToValue = function (x, y) {
    if (gradient === Infinity) {
      const len = Math.abs(y2 - y);
      return minValue + ((axisLength - len) * range) / axisLength;
    } else if (gradient >= 0 && gradient < 0.00000001) {
      const len = Math.abs(x2 - x);
      return minValue + ((axisLength - len) * range) / axisLength;
    }
    return (
      minValue +
        ((2 * (x - optsLeftChartOffset)) / innerW - 1) *
          (range / projectValueOnAxisXMultTerm) *
          -1
    );
  };

  const axisLabelRotation = function () {
    if (angleFromNorth > -270.0) {
      return angleFromNorth - 180;
    }
    return angleFromNorth;
  };

  const { maxZoom, minZoom } = zoomProps.scaleExtent;
  const axisLabelCordLop = d3.scaleLog()
    .base(20)
    .domain([minZoom, maxZoom])
    .range([maxValue, minValue]);

  const sizeScales = __setupSizeScales({
    axisScaleProps,
    axisLabelCordLop,
    lines,
    projectValueOnAxis,
    textOverflowWidthLimit,
    width,
    zoomProps
  });

  const { scaledTitleSize, scaledTickSize, textLineSpacingPx } = sizeScales;

  const zoomLops = __setupZoomLops({
    zoomProps,
    width,
    scaledTitleSize,
    scaledTickSize,
    maxValue,
    minValue,
    maxZoomFont,
    textLineSpacingPx
  });

  return Object.assign(
    {
      axisLabelRotation: axisLabelRotation,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      quad: quad,
      labelX: labelX,
      labelY: labelY,
      gradient: gradient,
      maxValue: maxValue,
      minValue: minValue,
      range: range,
      axisLength: axisLength,
      angleFromNorth: angleFromNorth,
      axisId: axisId, // Change this
      label: label,
      words: words,
      lines: lines,
      zoomLines: zoomLines,
      projectCordToAxis: projectCordToAxis,
      projectValueOnAxis: projectValueOnAxis,
      cordOnAxisToValue: cordOnAxisToValue,
      axisLabelCordLop: axisLabelCordLop
    },
    sizeScales,
    zoomLops
  );
};

export { buildAxis };
