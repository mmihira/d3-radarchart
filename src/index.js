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
    data: [],
    dims: {
      width: 500,
      height: 500,
      translateXp: 0.05,
      translateYp: 0.05,
      legendSpaceP: 0.10,
      innerPaddingP: 0.10
    },
    showLegend: true,
    legend: {
      legendWidthP: 0.9,
      legendHeightP: 0.2,
      legendWOverlap: 1.1,
      legendTopOffset: 20,
      textYOffset: 9,
      textOffsetP: 0.75,
      colorScale: d3.scaleOrdinal(d3.schemeAccent),
      iconHeight: 10,
      iconWidth: 10,
      iconSpacing: 20,
      title: 'Test title',
      titleProperties: {
        'font-size': '12px',
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
      levelsColor: null,
      ticks: {
        fill: '#737373',
        'font-size': '10px',
        'font-family': 'sans-serif'
      }
    },
    point: {
      radius: 5
    },
    axis: {
      config: [],
      colorScale: null,
      useGlobalMax: false,
      maxValue: 0.6,
      leftOffsetPLabel: 0.85,
      textOverflow: true,
      textOverflowWidthLimit: 10,
      textLineSpacingPx: 10
    },
    area: {
      areaHighlight: false,
      areaHighlightProps: {
        defaultAreaOpacity: 0.0,
        highlightedAreaOpacity: 0.7,
        hiddenAreaOpacity: 0.1,
      },
      defaultCircleOpacity: 0.3,
      hoverCircleOpacity: 0.8,
      circleOverlayRadiusMult: 1.5,
      useColorScale: true,
      areaColorScale: d3.scaleOrdinal(d3.schemeAccent),
      lineColorScale: d3.scaleOrdinal(d3.schemeAccent),
      onValueChange: null
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
    this.renderAxis();
    this.renderArea();
    if (this.opts.showLegend) {
      this.renderLegend();
    }
  }

  renderAxis () {
    const opts = this.opts;
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

    this.drawingContext = (function () {
      let rootElId = this.rootElId.toString();
      return function () {
        return d3.select(`.root${rootElId}`);
      };
    }.bind(this))();

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

    const ticksAttr = opts.levels.ticks;

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
        .style('font-size', ticksAttr['font-size'])
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
      .style('stroke-width', '1px');

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
              .attr('dy', i * d.textLineSpacingPx)
              .text(lines[i])
              .style('font-family', 'sans-serif')
              .style('font-size', '11px')
              .attr('text-anchor', 'middle')
              .each(function (d) { d.labelLines.push(this); });
          }
        });
    } else {
      this.axisText = this.axisG
        .append('text')
        .attr('class', 'axis-label')
        .text(d => d.label)
        .style('font-family', 'sans-serif')
        .style('font-size', '11px')
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
      onAreaUpdate: this.onUpdateArea.bind(this)
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

    let LegendOptions = this.opts.axis.config.map(e => e.axisId);

    let svg = this.rootSvg
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create the title for the legend
    svg.append('text')
      .attr('class', 'title')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)))
      .attr('y', legendOpts.legendTopOffset)
      .text(legendOpts.title)
      .attr('font-size', legendOpts.titleProperties['font-size'])
      .attr('fill', legendOpts.titleProperties['fill']);

    // Initiate Legend
    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('height', legendOpts.height)
      .attr('width', legendOpts.width)
      .attr('transform', 'translate(0,' + (legendOpts.legendTopOffset * 2) + ')');

    // Create colour squares
    legend.selectAll('rect')
      .data(LegendOptions)
      .enter()
      .append('rect')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)))
      .attr('y', (d, i) => i * legendOpts.iconSpacing)
      .attr('width', legendOpts.iconWidth)
      .attr('height', legendOpts.iconHeight)
      .style('fill', (d, i) => legendOpts.colorScale(i));

    // Create text next to squares
    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append('text')
      .attr('x', width - (legendW * (1 + legendOpts.legendWOverlap)) * legendOpts.textOffsetP)
      .attr('y', (d, i) => i * legendOpts.iconSpacing + legendOpts.textYOffset)
      .attr('font-size', legendOpts.labelTextProperties['font-size'])
      .attr('fill', legendOpts.labelTextProperties['fill'])
      .text(function (d) { return d; });
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
