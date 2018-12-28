import {scaleLinear, scaleOrdinal, schemeAccent} from 'd3';
import {buildAxis, buildArea} from './builders/index.js';
import merge from 'lodash.merge';
import pick from 'lodash.pick';
import {setters} from './setters/index.js';
import * as renderPropsGetters from './renderPropsGetters/index.js';
import * as stateQuery from './stateQuery/index.js';
import * as selectors from './selectors/index.js';

const DEFAULTS_OPTS = function () {
  return {
    charRootName: 'd3radarchart',
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
    }
  };
};

/**
 * State holds all state variables for the radar chart.
 * Only state instance members should access __STATE__ directly.
 * Otherwise other components should interact with the __STATE__ through
 * setters/getters.
 *
 * @param options {Object}
 */
class State {
  constructor (options) {
    this.__STATE__ = merge(
      {opts: DEFAULTS_OPTS()},
      {opts: options},
      {
        calculatedDims: {},
        series: [],
        axisConfig: [],
        components: {
          root: {
            rootSvg: null,
            rootG: null
          },
          areas: {},
          axis: {}
        }
      }
    );

    // Bind the mixins
    Object.keys(setters).forEach(key => { this[key] = this[key].bind(this); });
    Object.keys(renderPropsGetters).forEach(key => { this[key] = this[key].bind(this); });
    Object.keys(stateQuery).forEach(key => { this[key] = this[key].bind(this); });
    Object.keys(selectors).forEach(key => { this[key] = this[key].bind(this); });

    this.__construct();
  }

  __construct () {
    this.__calculateDimensions();
    this.__associateData();
    this.__buildAxis();
    this.__buildArea();
    this.__buildLegend();
  }

  get stateSetters () {
    return Object.keys(setters).reduce((acc, key) => {
      acc[key] = this[key];
      return acc;
    }, {});
  }

  get stateQuery () {
    return Object.keys(stateQuery).reduce((acc, key) => {
      acc[key] = this[key];
      return acc;
    }, {});
  }

  get selectors () {
    return Object.keys(selectors).reduce((acc, key) => {
      acc[key] = this[key];
      return acc;
    }, {});
  }

  get opts () {
    return this.__STATE__.opts;
  }

  get calculatedDims () {
    return this.__STATE__.calculatedDims;
  }

  get legendDims () {
    return this.calculatedDims.legendDims;
  }

  get renderProps () {
    return Object.keys(renderPropsGetters).reduce((acc, key) => {
      acc[key] = this[key];
      return acc;
    }, {});
  }

  get axisConfig () {
    return this.__STATE__.axisConfig;
  }

  get chartRootName () {
    return this.__STATE__.opts.chartRootName;
  }

  get axisProps () {
    return this.__STATE__.opts.axis;
  }

  /**
   * Calculate chart layout dimensions
   */
  __calculateDimensions () {
    const legendDimsToKeep = [
      'legendWidthP',
      'legendHeightP',
      'iconSpacingP',
      'iconWidthP',
      'iconHeightP'
    ];

    this.__STATE__.calculatedDims = merge(
      {},
      this.__STATE__.opts.dims,
      {legendDims: pick(this.__STATE__.opts.legend, legendDimsToKeep)}
    );

    const optDims = this.__STATE__.calculatedDims;
    optDims.paddingW = optDims.width * optDims.translateXp / 2;
    optDims.paddingH = optDims.paddingW;
    optDims.legendW = optDims.width * optDims.legendSpaceP;
    optDims.chartContainerW = optDims.width - optDims.paddingW - optDims.legendW;
    optDims.chartContainerH = optDims.height - (optDims.paddingH * 2);
    optDims.innerPadding = optDims.chartContainerH * optDims.innerPaddingP;
    optDims.innerW = optDims.chartContainerW - (2 * optDims.innerPadding);
    optDims.innerH = optDims.chartContainerH - (2 * optDims.innerPadding);
    optDims.optsLeftChartOffset = optDims.innerPadding;
    optDims.optsTopChartOffset = optDims.innerPadding;

    const legOpts = this.legendDims;
    legOpts.width = optDims.legendW * legOpts.legendWidthP;
    legOpts.height = optDims.height * legOpts.legendHeightP;
    legOpts.iconSpacing = legOpts.iconSpacingP * optDims.height;
    legOpts.iconHeight = legOpts.iconHeightP * optDims.height;
    legOpts.iconWidth = legOpts.iconWidthP * optDims.height;
  }

  __associateData () {
    this.__STATE__.series = this.__STATE__.opts.data;
    this.__STATE__.axisConfig = this.__STATE__.opts.axis.config;
    this.__STATE__.calculatedDims.maxAxisNo = this.__STATE__.axisConfig.length;
  }

  /**
   * Create parameters for all axis
   */
  __buildAxis () {
    const axisParameters = this.axisConfig.map((axisOptions, inx) => {
      const { axis } = this.__STATE__.opts;
      const params = {
        axisScaleProps: this.__STATE__.opts.axis.axisScaleProps,
        zoomProps: this.__STATE__.opts.zoomProps,
        width: this.calculatedDims.width,
        innerW: this.calculatedDims.innerW,
        innerH: this.calculatedDims.innerH,
        optsLeftChartOffset: this.calculatedDims.optsLeftChartOffset,
        optsTopChartOffset: this.calculatedDims.optsLeftChartOffset,
        useGlobalMax: axis.useGlobalMax,
        maxValue: axis.maxValue,
        maxAxisNo: this.calculatedDims.maxAxisNo,
        maxZoomFont: this.__STATE__.opts.axis.ticks.maxZoomFont,
        textOverflowWidthLimit: axis.textOverflowWidthLimit,
        textOverflowWidthLimitZoomed: axis.textOverflowWidthLimitZoomed,
        axisIndex: inx,
        axisOptions: Object.assign({}, axisOptions)
      };

      return buildAxis(params);
    });

    this.__STATE__.components.axis =  axisParameters.reduce((acc, axisParams) => {
      acc[axisParams.axisId] = {
        props: axisParams,
        state: {},
        labelLines: [],
        zoomedLabelLines: [],
        percLabels: []
      };
      return acc;
    }, {});
  }

  __buildArea () {
    const areaParameters = this.__STATE__.series.map((series, inx) => {
      const { area } = this.__STATE__.opts;
      const params = {
        series: series,
        seriesInx: inx,
        textOverflowWidthLimit: area.textOverflowWidthLimit,
        areaOptions: area,
        axisComponents: this.__STATE__.components.axis,
        zoomProps: this.__STATE__.opts.zoomProps,
        lineProps: area.lineProps,
        circleProps: area.circleProps,
        labelProps: area.labelProps
      };
      return buildArea(params);
    });

    this.__STATE__.components.areas = areaParameters.reduce((acc, areaParams) => {
      acc[areaParams.props.seriesId] = {
        props: areaParams.props,
        state: areaParams.state,
        circleRef: [],
        circleOverlayRef: [],
        legendLabelLines: []
      };
      return acc;
    }, {});
  }

  __buildLegend () {
    const legendOpts = this.__STATE__.opts.legend;
    const { titleProperties, labelTextProperties } = legendOpts;

    if (legendOpts.scaleTextWithSize && !legendOpts.titleScale) {
      legendOpts.titleScale = scaleLinear()
        .domain([100, 1200])
        .range([titleProperties.fontScaleMin, titleProperties.fontScaleMax]);
    }

    if (legendOpts.scaleTextWithSize && !legendOpts.labelScale) {
      legendOpts.labelScale = scaleLinear()
        .domain([100, 1200])
        .range([labelTextProperties.fontScaleMin, labelTextProperties.fontScaleMax]);
    }

    legendOpts.labelTextLineSpacing = scaleLinear()
      .domain([100, 1200])
      .range(this.areaProps().textLineSpacingRangeLegend);
  }

  axisById (axisId) {
    return this.__STATE__.components.axis[axisId];
  }

  seriesById (seriesId) {
    return this.__STATE__.components.areas[seriesId];
  }

  getAxisDatums () {
    return Object.values(this.__STATE__.components.axis).map(e => e.props);
  }

  getAreaDatums () {
    return Object.values(this.__STATE__.components.areas).map(e => {
      return {
        props: e.props,
        state: e.state
      };
    });
  }
}

// Add the mixins
Object.assign(State.prototype, setters);
Object.assign(State.prototype, renderPropsGetters);
Object.assign(State.prototype, stateQuery);
Object.assign(State.prototype, selectors);

export default State;
export const STATE_DEFAULTS_OPTS = DEFAULTS_OPTS;
