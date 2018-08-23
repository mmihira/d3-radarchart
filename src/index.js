import * as d3 from 'd3';
import * as _ from 'lodash';
import Area from './Area.js';
import Axis from './Axis.js';

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
      colorScale: d3.scaleOrdinal(d3.schemeAccent),
      iconHeightP: 0.020,
      iconWidthP: 0.020,
      iconSpacingP: 0.05,
      title: 'Test title',
      scaleTextWithSize: true,
      titleScale: null,
      labelScale: null,
      titleProperties: {
        fontSize: 12,
        'fill': '#404040'
      },
      labelTextProperties: {
        'font-size': '11px',
        'fill': '#737373'
      }
    },
    levels: {
      levelsNo: 2,
      noTicks: 3,
      levelsColor: null
    },
    point: {
      radius: 5
    },
    showLegend: true,
    axis: {
      config: [],
      colorScale: null,
      useGlobalMax: false,
      maxValue: 0.6,
      leftOffsetPLabel: 0.85,
      textOverflow: true,
      textOverflowWidthLimit: 10,
      textLineSpacingPx: 10,
      tickScale: null,
      axisTitleScale: null,
      axisLabelProps: {
        'font-family': 'sans-serif',
        fontSize: 11,
        'fill': '#808080'
      },
      ticks: {
        fill: '#737373',
        minZoomFont: 10,
        maxZoomFont: 1,
        'font-family': 'sans-serif'
      }
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
        fontSize: 10,
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

    this.axisParameters = this.axisConfig.map((axis, inx) => new Axis(this.opts, axis, inx));
    this.axisMap = this.axisParameters
      .reduce((map, ix) => {
        map[ix.axis] = ix;
        return map;
      }, {});
  }

  render () {
    this.setupDrawingArea();
    this.renderAxis();
    this.renderArea();
    if (this.opts.showLegend) {
      this.renderLegend();
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
        .on('zoom', (d) => {
          this.drawingContext().attr('transform', d3.event.transform);
          this.areas.forEach(area => area.onZoomUpdateSizes(d3.event.transform.k));
          this.axisParameters.forEach(axis => axis.onZoom(d3.event.transform.k));
          this.onUpdateArea();
        })
        .translateExtent([[0, 0], [width, height]])
        .scaleExtent([
          this.opts.zoomProps.scaleExtent.minZoom,
          this.opts.zoomProps.scaleExtent.maxZoom
        ]);

      this.rootSvg
        .call(this.zoom);
    }

    this.drawingContext = (function () {
      let rootElId = this.rootElId.toString();
      return function () {
        return d3.select(`.root${rootElId}`);
      };
    }.bind(this))();
  }

  /**
   * Set this when the element containing the svg is css translated.
   * Only needs to be set for Firefox because of this bug :
   * https://bugzilla.mozilla.org/show_bug.cgi?id=972041*
   * @param xOffset {Number}
   * @param yOffset {Number}
   */
  setDragCoordOffset (xOffset, yOffset) {
    this.areas.forEach(area => {
      area.setDragCoordOffset(xOffset, yOffset);
    });
  }

  renderAxis () {
    const opts = this.opts;
    const { width } = this.opts.dims;

    // Circular segments
    for (let lvlInx = 0; lvlInx < opts.levels.levelsNo - 1; lvlInx++) {
      let tickNos = opts.levels.levelsNo;

      this.drawingContext().selectAll('.levels')
        .data(this.axisParameters)
        .enter()
        .append('svg:line')
        .attr('x1', (d, i) => {
          let tickValue = (d.maxValue / tickNos) * (lvlInx + 1);
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y1', (d, i) => {
          let tickValue = (d.maxValue / tickNos) * (lvlInx + 1);
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('x2', (d, i) => {
          let nxtInx = i + 1 === this.axisParameters.length ? 0 : (i + 1);
          let nAxis = this.axisParameters[nxtInx];
          let nValue = (nAxis.maxValue / tickNos) * (lvlInx + 1);
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.x;
        })
        .attr('y2', (d, i) => {
          let nxtInx = i + 1 === this.axisParameters.length ? 0 : (i + 1);
          let nAxis = this.axisParameters[nxtInx];
          let nValue = (nAxis.maxValue / tickNos) * (lvlInx + 1);
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.y;
        })
        .attr('class', 'line')
        .style('stroke', 'grey')
        .style('stroke-opacity', '0.75')
        .style('stroke-width', '0.3px');
    }

    var Format = d3.format('.2%');

    const ticksAttr = opts.axis.ticks;

    if (!opts.axis.axisTitleScale) {
      opts.axis.axisTitleScale = d3.scaleLinear()
        .domain([100, 1200])
        .range([5, 23]);
    }

    // Text indicating at what % each level is
    for (let lvlInx = 0; lvlInx < opts.levels.levelsNo; lvlInx++) {
      let tickNos = opts.levels.levelsNo;

      this.drawingContext()
        .selectAll('.levels')
        .data(this.axisParameters)
        .enter()
        .append('svg:text')
        .attr('x', (d) => {
          let tickValue = (d.maxValue / tickNos) * (lvlInx + 1);
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y', (d) => {
          let tickValue = (d.maxValue / tickNos) * (lvlInx + 1);
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('class', 'legend')
        .style('font-family', ticksAttr['font-family'])
        .style('font-size', d => d.scaledTickSize + 'px')
        .style('opacity', 0.0)
        .attr('fill', ticksAttr['fill'])
        .text(function (d) { return Format((d.maxValue / tickNos) * (lvlInx + 1) / d.maxValue); })
        .each(function (d) { d.axisTickTextElements.push(this); });
    }

    this.axisG = this.drawingContext()
      .selectAll('.axis')
      .data(this.axisParameters)
      .enter()
      .append('g');

    this.axisLines = this.axisG
      .attr('class', 'axis')
      .append('line')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('class', 'line')
      .attr('pointer-events', 'none')
      .style('stroke', 'grey')
      .style('stroke-opacity', 0.75)
      .style('stroke-width', '0.3px');

    this.rects = this.axisG
      .append('rect')
      .attr('class', 'overlay')
      .attr('x', d => d.x1)
      .attr('y', d => d.y1)
      .attr('transform', (d, i) => 'rotate(' + d.angleFromNorth + ',' + d.x1 + ',' + d.y1 + ')')
      .attr('width', d => d.axisLength)
      .attr('height', 10)
      .attr('fill-opacity', 0.0)
      .on('mouseover', d => d.onRectMouseOver())
      .on('mouseout', d => d.onRectMouseOut())
      .each(function (datum) { datum.axisRect = this; });

    const { axisLabelProps } = this.opts.axis;
    const axisOpts = this.opts.axis;

    axisOpts.textLineSpacingPx = d3.scaleLinear()
      .domain([100, 1200])
      .range([1, 30]);

    if (opts.axis.textOverflow) {
      this.axisText = this.axisG
        .append('text')
        .attr('class', 'axis-label')
        .attr('pointer-events', 'none')
        .text('')
        .each(function (d) {
          var lines = d.lines;
          for (var i = 0; i < lines.length; i++) {
            d3.select(this)
              .append('tspan')
              .attr('x', d => d.labelX)
              .attr('y', d => d.labelY)
              .attr('dy', d => {
                return axisOpts.textLineSpacingPx(width) * i;
              })
              .text(lines[i])
              .style('font-family', axisLabelProps['font-family'])
              .style('font-size', d => d.axisTitleScale(width) + 'px')
              .style('fill', axisLabelProps['fill'])
              .attr('text-anchor', 'middle')
              .each(function (d) { d.labelLines.push(this); });
          }
        });
    } else {
      this.axisText = this.axisG
        .append('text')
        .attr('class', 'axis-label')
        .text(d => d.label)
        .style('font-family', axisLabelProps['font-family'])
        .style('font-size', d => d.axisTitleScale(width) + 'px')
        .style('fill', axisLabelProps['fill'])
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .attr('transform', () => 'translate(0, -10)')
        .attr('x', d => d.labelX)
        .attr('y', d => d.labelY)
        .attr('pointer-events', 'none');
    }
  }

  renderArea () {
    this.areas = this.data.map((series, inx) => new Area({
      axisMap: this.axisMap,
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
      .attr('fill', legendOpts.titleProperties['fill']);

    // Initiate Legend
    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('height', legendOpts.height)
      .attr('width', legendOpts.width)
      .attr('transform', 'translate(0,' + (legendOpts.legendTopOffsetP * height * 2) + ')');

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
        for (var i = 0; i < lines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)) * legendOpts.textOffsetP)
            .attr('y', d => z * legendOpts.iconSpacing + legendOpts.textYOffset)
            .attr('dy', d => {
              return d.labelTextLineSpacing(width) * i;
            })
            .text(d => d.legendLabelLines[i])
            .style('font-size', () => {
              if (legendOpts.scaleTextWithSize) {
                return legendOpts.labelScale(width) + 'px';
              } else {
                return legendOpts.labelTextProperties.fontSize + 'px';
              }
            })
            .attr('fill', legendOpts.labelTextProperties['fill'])
            .attr('original-fill', legendOpts.labelTextProperties['fill'])
            .each(function (d) { d.legendLabelEls.push(this); });
        }
      });

    // Create overlays
    legend.selectAll('legend-rect-overlays')
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
    this.rects.each(function (d) {
      d3.select(d.axisRect)
        .on('mouseover', null)
        .on('mouseout', null)
        .remove();
    });
  }

  /**
   * Remove chart areas
   */
  removeAreas () {
    this.areas.forEach(area => area.remove());
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
