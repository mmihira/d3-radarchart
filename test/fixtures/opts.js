import {scaleOrdinal, schemeAccent} from 'd3';

const DEFAULTS_OPTS = function () {
  return {
    enableZoom: true,
    backgroundColor: 'white',
    zoomProps: {
      scaleExtent: {
        minZoom: 1,
        maxZoom: 12
      }
    },
    data: [],
    dims: {
      width: 500,
      height: 500,
      translateXp: 0.05,
      translateYp: 0.05,
      legendSpaceP: 0.10,
      innerPaddingP: 0.10
    },
    legend: {
      interactive: true,
      legendWidthP: 0.9,
      legendHeightP: 0.2,
      legendWOverlap: 1.1,
      legendTopOffsetP: 0.030,
      textYOffset: 9,
      textOffsetP: 0.75,
      iconHeightP: 0.020,
      iconWidthP: 0.020,
      iconSpacingP: 0.05,
      title: 'Test title',
      scaleTextWithSize: true,
      titleScale: null,
      labelScale: null,
      titleProperties: {
        fontSize: 12,
        fontScaleMin: 5,
        fontScaleMax: 20,
        'font-family': 'sans-serif',
        'fill': '#404040'
      },
      labelTextProperties: {
        fontSize: 11,
        fontScaleMin: 5,
        fontScaleMax: 20,
        'font-family': 'sans-serif',
        'fill': '#737373'
      }
    },
    levels: {
      levelsFractions: [0.25, 0.5, 0.75]
    },
    showLegend: true,
    axis: {
      config: [],
      useGlobalMax: false,
      maxValue: 0.6,
      leftOffsetPLabel: 0.85,
      rotateTextWithAxis: true,
      textOverflowWidthLimit: 10,
      textOverflowWidthLimitZoomed: 50,
      textLineSpacingPx: 10,
      tickScale: null,
      axisTitleScale: null,
      axisScaleProps: {
        minTitleSize: 5,
        maxTitleSize: 20,
        minTickSize: 5,
        maxTickSize: 20,
        minTextLineSpacing: 1,
        maxTextLineSpacing: 20
      },
      axisLabelProps: {
        'font-family': 'sans-serif',
        fontSize: 11,
        'fill': '#808080',
        'value-fill': '#548bd8',
        'hover-fill': '#E44822'
      },
      lineProps: {
        fill: '#E0E0E0',
        'hover-fill': '#E44822'
      },
      ticks: {
        fill: '#737373',
        minZoomFont: 10,
        maxZoomFont: 1,
        'font-family': 'sans-serif'
      },
      wheelLabelAreaId: null,
      onAxisLabelOver: null,
      onAxisLabelOut: null,
      onWheelAxis: null
    },
    area: {
      areaHighlight: false,
      areaHighlightProps: {
        defaultAreaOpacity: 0.0,
        highlightedAreaOpacity: 0.7,
        hiddenAreaOpacity: 0.1,
        defaultStrokeOpacity: 0.8,
        highlightedStrokeOpacity: 1.0,
        hiddenStrokeOpacity: 0.2,
        defaultLabelOpacity: 0.0,
        highlightedLabelOpacity: 1.0,
        hiddenLabelOpacity: 0.0
      },
      labelProps: {
        'font-family': 'sans-serif',
        fontSize: 8,
        maxFontSize: 2
      },
      defaultCircleOpacity: 0.3,
      hoverCircleOpacity: 0.5,
      circleProps: {
        defaultRadius: 5,
        maxZoomRadius: 1,
        circleOverlayRadiusMult: 1.5
      },
      useColorScale: true,
      areaColorScale: scaleOrdinal(schemeAccent),
      lineColorScale: scaleOrdinal(schemeAccent),
      onValueChange: null,
      onValueFinishChange: null,
      textOverflowWidthLimit: 10,
      textLineSpacingRangeLegend: [1, 20],
      lineProps: {
        strokeWidth: 2,
        maxZoomStroke: 0.5
      }
    },
    rootElement: null
  };
};

export default DEFAULTS_OPTS;
