import * as d3 from 'd3';
import * as _ from 'lodash';
import Area from './Area.js';
import Axis from './Axis.js';
import { browserVendor } from './const.js';

/**
 * Based of
 *  - https://github.com/alangrafu/radar-chart-d3
 *  - http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
 */

/**
 * Default options
 */
const DEFAULTS_OPTS = function () {
  return {
    enableZoom: true,
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
        'font-family': 'sans-serif',
        'fill': '#404040'
      },
      labelTextProperties: {
        fontSize: 11,
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
      areaColorScale: d3.scaleOrdinal(d3.schemeAccent),
      lineColorScale: d3.scaleOrdinal(d3.schemeAccent),
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

class RadarChart {
  /**
   * @param opts {Object}
   */
  constructor (opts) {
    this.rootElement = d3.select(opts.rootElement);
    this.rootElId = this.rootElement.attr('id');
    this.setOps(opts);
    this.areas = [];

    this.axisRectClassName = 'axis-rect-overlay';
  }

  render () {
    this.setupDrawingArea();
    this.renderAxis();
    this.renderArea();
    if (this.opts.showLegend) {
      this.renderLegend();
    }
  }

  /**
   * @param opts {Object}
   */
  setOps (opts) {
    this.opts = _.merge(DEFAULTS_OPTS(), opts);
    this.opts.axis.maxAxisNo = this.opts.axis.config.length;

    const optDims = this.opts.dims;
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

    const legOpts = this.opts.legend;
    legOpts.width = optDims.legendW * legOpts.legendWidthP;
    legOpts.height = optDims.height * legOpts.legendHeightP;
    legOpts.iconSpacing = legOpts.iconSpacingP * optDims.height;
    legOpts.iconHeight = legOpts.iconHeightP * optDims.height;
    legOpts.iconWidth = legOpts.iconWidthP * optDims.height;

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    this.axisParameters = this.axisConfig.map((axis, inx) => new Axis(
      this.opts,
      axis,
      inx,
      this.onAxisLabelWheel.bind(this)
    ));
    this.axisMap = this.axisParameters.reduce((map, ix) => {
      map[ix.axis] = ix;
      return map;
    }, {});
  }

  onAxisLabelWheel (callingAxis) {
    if (this.opts.axis.wheelLabelAreaId) {
      const area = this.areas.find(e => e.label === this.opts.axis.wheelLabelAreaId);
      area.onWheelEvent(callingAxis);
    }
  }

  setupDrawingArea () {
    const {
      width,
      height,
      paddingH,
      paddingW
    } = this.opts.dims;

    this.rootSvg = this.rootElement
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.rootSvg
      .append('g')
      .attr('class', `root${this.rootElId}`)
      .attr('transform', 'translate(' + paddingW + ',' + paddingH + ')');

    if (this.opts.enableZoom) {
      this.zoom = d3.zoom()
        .on('zoom', d => {
          // d3 zoom on firefox zooms gradient is too much so constraint and
          // reset every time on zoom.
          if (browserVendor.isFirefox) {
            const k = d3.event.transform.k;
            const minZoom = k > this.opts.zoomProps.scaleExtent.minZoom ? k * 0.1 : this.opts.zoomProps.scaleExtent.minZoom;
            const maxZoom = k < this.opts.zoomProps.scaleExtent.maxZoom ? k * 1.1 : this.opts.zoomProps.scaleExtent.maxZoom;
            this.zoom.scaleExtent([minZoom, maxZoom]);

            this.drawingContext().attr('transform', d3.event.transform);
            this.areas.forEach(area => area.onZoomUpdateSizes(k));
            this.axisParameters.forEach(axis => axis.onZoom(k));
          } else {
            this.drawingContext().attr('transform', d3.event.transform);
            this.areas.forEach(area => area.onZoomUpdateSizes(d3.event.transform.k));
            this.axisParameters.forEach(axis => axis.onZoom(d3.event.transform.k));
          }

          this.onUpdateArea();
        })
        .translateExtent([[0, 0], [width, height]])
        .scaleExtent([
          this.opts.zoomProps.scaleExtent.minZoom,
          this.opts.zoomProps.scaleExtent.maxZoom
        ]);

      this.rootSvg.call(this.zoom);
    }

    this.drawingContext = (function () {
      let rootElId = this.rootElId.toString();
      return function () {
        return d3.select(`.root${rootElId}`);
      };
    }.bind(this))();
  }

  renderAxis () {
    const opts = this.opts;
    const { width } = this.opts.dims;

    // Circular segments
    for (let lvlInx = 0; lvlInx < opts.levels.levelsFractions.length; lvlInx++) {
      const { levelsFractions } = this.opts.levels;
      this.drawingContext().selectAll('.levels')
        .data(this.axisParameters)
        .enter()
        .append('svg:line')
        .attr('x1', (d, i) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y1', (d, i) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('x2', (d, i) => {
          let nxtInx = i + 1 === this.axisParameters.length ? 0 : (i + 1);
          let nAxis = this.axisParameters[nxtInx];
          let nValue = nAxis.range * levelsFractions[lvlInx] + nAxis.minValue;
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.x;
        })
        .attr('y2', (d, i) => {
          let nxtInx = i + 1 === this.axisParameters.length ? 0 : (i + 1);
          let nAxis = this.axisParameters[nxtInx];
          let nValue = nAxis.range * levelsFractions[lvlInx] + nAxis.minValue;
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.y;
        })
        .attr('class', 'line')
        .style('stroke', '#DCDCDC')
        .style('stroke-opacity', '0.75')
        .style('stroke-width', '0.3px');
    }

    var Format = d3.format('.2%');

    const ticksAttr = opts.axis.ticks;

    // Text indicating at what % each level is
    for (let lvlInx = 0; lvlInx < opts.levels.levelsFractions.length; lvlInx++) {
      const { levelsFractions } = this.opts.levels;

      this.drawingContext()
        .selectAll('.levels')
        .data(this.axisParameters)
        .enter()
        .append('svg:text')
        .attr('x', (d) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y', (d) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('class', 'legend')
        .style('font-family', ticksAttr['font-family'])
        .style('font-size', d => d.scaledTickSize + 'px')
        .style('opacity', 0.0)
        .attr('fill', ticksAttr['fill'])
        .text(d => Format(levelsFractions[lvlInx]))
        .each(function (d) { d.axisTickTextElements.push(this); });
    }

    this.axisG = this.drawingContext()
      .selectAll('.axis')
      .data(this.axisParameters)
      .enter()
      .append('g');

    this.axisLines = this.axisG
      .append('line')
      .attr('class', 'axisline')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('pointer-events', 'none')
      .style('stroke', opts.axis.lineProps.fill)
      .style('stroke-opacity', 0.75)
      .style('stroke-width', '0.3px')
      .each(function (datum) { datum.axisLineEl = this; });

    this.rects = this.axisG
      .append('rect')
      .attr('class', this.axisRectClassName)
      .attr('x', d => d.x1)
      .attr('y', d => d.y1)
      .attr('transform', (d, i) => 'rotate(' + d.angleFromNorth + ',' + d.x1 + ',' + d.y1 + ')')
      .attr('width', d => d.axisLength)
      .attr('height', 10)
      .attr('fill-opacity', 0.0)
      .on('mouseover', d => d.onAxisLineRectOver())
      .on('mouseout', d => d.onAxisLineRectMouseOut())
      .each(function (datum) { datum.axisRect = this; });

    const { axisLabelProps } = this.opts.axis;

    this.axisText = this.axisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('pointer-events', 'none')
      .attr('transform', (d, i) => {
        if (this.opts.axis.rotateTextWithAxis) {
          return 'rotate(' + d.axisLabelRotation() + ',' + d.x2 + ',' + d.y2 + ')';
        } else {
          return '';
        }
      })
      .text('')
      .each(function (d) {
        // Label text
        d.axisLabelEl = this;
        let lines = d.lines;
        for (let i = 0; i < lines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', d => d.axisLabelCords().x)
            .attr('y', d => d.axisLabelCords().y)
            .attr('dy', d => {
              return d.textLineSpacingPx(width) * i;
            })
            .text(lines[i])
            .style('font-family', axisLabelProps['font-family'])
            .style('font-size', d => d.axisTitleScale(width) + 'px')
            .style('fill', axisLabelProps['fill'])
            .attr('text-anchor', 'middle')
            .each(function (d) { d.labelLines.push(this); });
        }

        // Label value
        d3.select(this)
          .append('tspan')
          .attr('x', d => d.axisLabelCords().x)
          .attr('y', d => d.axisLabelCords().y)
          .attr('dy', d => {
            return d.textLineSpacingPx(width) * d.lines.length;
          })
          .text('')
          .style('font-family', axisLabelProps['font-family'])
          .style('font-size', d => d.axisTitleScale(width) + 'px')
          .style('fill', axisLabelProps['value-fill'])
          .attr('text-anchor', 'middle')
          .each(function (d) { d.labelValue = this; });

        // Zoom label text
        for (let i = 0; i < d.zoomLines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', d => d.axisLabelCords().x)
            .attr('y', d => d.axisLabelCords().y)
            .attr('dy', d => {
              return d.textLineSpacingPx(width) * i;
            })
            .text(d.zoomLines[i])
            .style('font-family', axisLabelProps['font-family'])
            .style('font-size', d => d.axisTitleScale(width) + 'px')
            .style('fill', axisLabelProps['fill'])
            .style('fill-opacity', 0.0)
            .attr('text-anchor', 'middle')
            .each(function (d) { d.zoomedLabelLines.push(this); });
        }
      });

    this.axisTextOverlay = this.axisG
      .append('rect')
      .attr('class', 'axis-text-overlay')
      .attr('x', d => d.overLayx())
      .attr('y', d => d.overLayy())
      .attr('width', d => d.overLayWidth)
      .attr('height', d => d.overLayHeight())
      .attr('fill-opacity', 0.0)
      .attr('transform', (d, i) => {
        if (this.opts.axis.rotateTextWithAxis) {
          return 'rotate(' + d.axisLabelRotation() + ',' + d.x2 + ',' + d.y2 + ')';
        } else {
          return '';
        }
      })
      .on('wheel', d => d.onLabelWheel())
      .on('mouseover', d => {
        if (this.opts.axis.wheelLabelAreaId) {
          const area = this.areas.find(e => e.label === this.opts.axis.wheelLabelAreaId);
          area.onAxisLabelRectOver(d.axisOptions.axisId);
        }
        d.onLabelRectOver();
        if (this.opts.axis.onWheelAxis) {
          this.opts.axis.onWheelAxis();
        }
      })
      .on('mouseout', d => d.onLabelRectOut());
  }

  renderArea () {
    this.areas = this.data.map((series, inx) => new Area({
      axisMap: this.axisMap,
      dims: this.opts.dims,
      series: series,
      drawingContext: this.drawingContext,
      seriesIdent: `${inx}${this.rootElId}`,
      seriesIndex: inx,
      areaOptions: this.opts.area,
      onAreaUpdate: this.onUpdateArea.bind(this),
      zoomProps: this.opts.zoomProps
    }));
    this.areas.forEach(area => area.render());
  }

  renderLegend () {
    const {
      width,
      height,
      legendW
    } = this.opts.dims;
    const legendOpts = this.opts.legend;

    let svg = this.rootSvg
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    this.legendSvg = svg;

    if (legendOpts.scaleTextWithSize && !legendOpts.titleScale) {
      legendOpts.titleScale = d3.scaleLinear()
        .domain([100, 1200])
        .range([5, 20]);
    }
    if (legendOpts.scaleTextWithSize && !legendOpts.labelScale) {
      legendOpts.labelScale = d3.scaleLinear()
        .domain([100, 1200])
        .range([5, 15]);
    }

    // Create the title for the legend
    svg.append('text')
      .attr('class', 'title')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)))
      .attr('y', legendOpts.legendTopOffsetP * height)
      .text(legendOpts.title)
      .style('font-size', () => {
        if (legendOpts.scaleTextWithSize) {
          return legendOpts.titleScale(width) + 'px';
        } else {
          return legendOpts.titleProperties.fontSize + 'px';
        }
      })
      .style('font-size', legendOpts.titleProperties['font-family'])
      .attr('fill', legendOpts.titleProperties['fill']);

    // Initiate Legend
    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('height', legendOpts.height)
      .attr('width', legendOpts.width)
      .attr('transform', 'translate(0,' + (legendOpts.legendTopOffsetP * height * 2) + ')');
    this.legendG = legend;

    // Create colour squares
    legend.selectAll('rect')
      .data(this.areas)
      .enter()
      .append('rect')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)))
      .attr('y', (d, i) => i * legendOpts.iconSpacing)
      .attr('width', legendOpts.iconWidth)
      .attr('height', legendOpts.iconHeight)
      .attr('opacity', 0.7)
      .style('fill', (d, i) => this.opts.area.areaColorScale(i))
      .each(function (d) { d.legendRect = this; });

    // Create text next to squares
    legend.selectAll('text')
      .data(this.areas)
      .enter()
      .append('text')
      .text('')
      .each(function (d, z) {
        var lines = d.legendLabelLines;
        for (let i = 0; i < lines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)) * legendOpts.textOffsetP)
            .attr('y', d => z * legendOpts.iconSpacing + legendOpts.textYOffset)
            .attr('dy', d => d.labelTextLineSpacing(width) * i)
            .text(d => d.legendLabelLines[i])
            .style('font-size', () => {
              if (legendOpts.scaleTextWithSize) {
                return legendOpts.labelScale(width) + 'px';
              } else {
                return legendOpts.labelTextProperties.fontSize + 'px';
              }
            })
            .style('font-size', legendOpts.labelTextProperties['font-family'])
            .attr('fill', legendOpts.labelTextProperties['fill'])
            .attr('original-fill', legendOpts.labelTextProperties['fill'])
            .each(function (d) { d.legendLabelEls.push(this); });
        }
      });

    this.createLegendOverlays();
  }

  createLegendOverlays () {
    const {
      width,
      legendW
    } = this.opts.dims;
    const legendOpts = this.opts.legend;

    this.legendG
      .selectAll('legend-rect-overlays')
      .attr('class', 'legend-rect-overylays')
      .data(this.areas)
      .enter()
      .append('rect')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)))
      .attr('y', (d, i) => i * legendOpts.iconSpacing)
      .attr('width', legendW * (1 + legendOpts.legendWOverlap))
      .attr('height', legendOpts.iconSpacing)
      .attr('opacity', 0.0)
      .on('mouseover', function (d, i) {
        d.onLegendOver(d);
      })
      .on('mouseout', function (d, i) {
        d.onLegendOut(d);
      })
      .each(function (d) { d.rectOverlay = d; });
  }

  /**
   * Rerender only the area with new data
   * @param data {Object}
   */
  reRenderWithNewData (data) {
    this.data = data;
    this.removeAreas();
    this.renderArea();
    this.updateLegendOverlays();
  }

  /**
   * Rerenders everything using new options.
   * @param opts {Object}
   */
  reRenderWithNewOptions (opts) {
    this.delete();

    this.setOps(opts);
    this.areas = [];
    this.render();
  }

  /**
   * Remove the axis
   */
  removeAxis () {
    this.axisLines.remove();
    this.axisText.remove();
    d3.selectAll('.' + this.axisRectClassName)
      .on('mouseover', null)
      .on('mouseout', null)
      .data([])
      .exit()
      .remove();
  }

  /**
   * Remove chart areas
   */
  removeAreas () {
    this.areas.forEach(area => area.remove());
  }

  updateLegendOverlays () {
    d3.select('.legend-rect-overlays')
      .data([])
      .exit()
      .remove();

    this.createLegendOverlays();
  }

  showAxisLabelValues (seriesLabel) {
    const area = this.areas.find(e => e.label === seriesLabel);
    Object.values(this.axisMap).forEach(d => {
      d.setAxisLabelValue(area.getCurrentValueForAxis(d.axis));
    });
  }

  hideAxisLabelValues () {
    Object.values(this.axisMap).forEach(d => {
      d.setAxisLabelValue(null);
    });
  }

  /**
   * Remove everything
   */
  delete () {
    this.removeAreas();
    this.removeAxis();
    this.rootSvg.remove();
  }

  /**
   * Update all the areas to maintain the same
   */
  onUpdateArea () {
    this.removeAreas();
    this.areas.forEach(area => area.render());
  }
}

export default RadarChart;
