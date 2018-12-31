import * as d3 from '../../d3Wrapper/index';
import { AREA_STATE } from '../../const.js';

const buildArea = function _buildArea (params) {
  const {
    series,
    seriesInx,
    textOverflowWidthLimit,
    areaOptions,
    axisComponents,
    zoomProps,
    lineProps,
    circleProps,
    labelProps
  } = params;

  const seriesId = series.seriesId;
  const fillColor = series.fill
    ? series.fill
    : areaOptions.areaColorScale(seriesInx);

  const points = series.data.map(sers => {
    return {
      seriesId: seriesId,
      cords: axisComponents[sers.axis].props.projectValueOnAxis(sers.value),
      value: sers.value,
      axisId: sers.axis
    };
  });

  const svgStringRep = points.reduce((acc, p) => {
    return acc + p.cords.x + ',' + p.cords.y + ' ';
  }, '');

  const maxZoom = zoomProps.scaleExtent.maxZoom;

  const base = 8;
  const areaLineLop = d3.scaleLog()
    .base(base)
    .domain([1, maxZoom])
    .range([lineProps.strokeWidth, lineProps.maxZoomStroke]);

  const circleRadiusLop = d3.scaleLog()
    .base(base)
    .domain([1, maxZoom])
    .range([circleProps.defaultRadius, circleProps.maxZoomRadius]);

  const fontLop = d3.scaleLog()
    .domain([1, maxZoom])
    .range([labelProps.fontSize, labelProps.maxFontSize]);

  const label = series.label;
  const words = label.split(' ');
  let legendLabelLines = [words[0]];
  legendLabelLines = words.slice(1).reduce((acc, word) => {
    if (acc[acc.length - 1].length + word.length <= textOverflowWidthLimit) {
      acc[acc.length - 1] = acc[acc.length - 1] + ' ' + word;
    } else {
      acc.push(word);
    }
    return acc;
  }, legendLabelLines);

  return {
    props: {
      series: series,
      seriesId: seriesId,
      seriesInx: seriesInx,
      fillColor: fillColor,
      areaLineLop: areaLineLop,
      circleRadiusLop: circleRadiusLop,
      fontLop: fontLop,
      legendLabelLines: legendLabelLines
    },
    state: {
      points: points,
      svgStringRep: svgStringRep,
      currentAreaOpacity: areaOptions.areaHighlightProps.defaultAreaOpacity,
      state: AREA_STATE.NEUTRAL
    }
  };
};

export { buildArea };
