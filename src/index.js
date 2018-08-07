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
const DEFAULTS_OPTS = {
  data: [],
  dims: {
    width: 500,
    height: 500,
    extraWidthP: 0.6,
    extraHeightP: 0.25,
    translateXp: 0.1,
    translateYp: 0.05
  },
  showLegend: true,
  legend: {
    height: 100,
    width: 200,
    factor: 0.85,
    translateX: -75,
    translateY: 10,
    textTranslateX: -52,
    textSpacing: 20,
    textYOffset: 9,
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
    maxValue: 0.6
  },
  area: {
    defaultAreaOpacity: 0.4,
    highlightedAreaOpacity: 0.7,
    hiddenAreaOpacity: 0.1,
    defaultCircleOpacity: 0.3,
    hoverCircleOpacity: 1.0,
    circleOverlayRadiusMult: 1.2,
    useColorScale: true,
    areaColorScale: d3.scaleOrdinal(d3.schemeAccent),
    lineColorScale: d3.scaleOrdinal(d3.schemeAccent)
  },
  rootElement: null
};

class RadarChart {
  /**
   * @param args {Object}
   */
  constructor (opts) {
    this.rootElement = d3.select(opts.rootElement);
    this.opts = _.merge(DEFAULTS_OPTS, opts);

    this.opts.axis.maxAxisNo = this.opts.axis.config.length;

    this.opts.dims.extraWidth = this.opts.dims.width * (1 + this.opts.dims.extraWidthP);
    this.opts.dims.extraHeight = this.opts.dims.height * (1 + this.opts.dims.extraHeightP);

    this.opts.dims.translateX = (this.opts.dims.width + this.opts.dims.extraWidth) * this.opts.dims.translateXp;
    this.opts.dims.translateY = (this.opts.dims.height + this.opts.dims.extraHeight) * this.opts.dims.translateYp;

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    this.axisParameters = this.axisConfig.map((axis, inx) => new Axis(this.opts, axis, inx));
    this.axisMap = this.axisParameters
      .reduce((map, ix) => {
        map[ix.axis] = ix;
        return map;
      }, {});

    // To store the area components
    this.areas = [];
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
      extraWidth,
      extraHeight,
      translateX,
      translateY
    } = this.opts.dims;

    this.rootSvg = this.rootElement
      .append('svg')
      .attr('width', width + extraWidth)
      .attr('height', height + extraHeight);

    this.drawingContext = this.rootSvg
      .append('g')
      .attr('transform', 'translate(' + translateX + ',' + translateY + ')');

    // Circular segments
    for (let lvlInx = 0; lvlInx < opts.levels.levelsNo - 1; lvlInx++) {
      let tickNos = opts.levels.levelsNo;

      this.drawingContext.selectAll('.levels')
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

      this.drawingContext
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

    this.axisG = this.drawingContext
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

    this.axisText = this.axisG
      .append('text')
      .attr('class', 'legend')
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

  renderArea () {
    this.areas = this.data.map((series, inx) => new Area({
      axisMap: this.axisMap,
      series: series,
      drawingContext: this.drawingContext,
      seriesIdent: inx,
      seriesIndex: inx,
      areaOptions: this.opts.area
    }));
    this.areas.forEach(area => area.render());
  }

  renderLegend () {
    const {
      width,
      height,
      extraWidth
    } = this.opts.dims;
    const legendOpts = this.opts.legend;

    let LegendOptions = ['Smartphone', 'Tablet'];

    let svg = this.rootSvg
      .append('svg')
      .attr('width', width + extraWidth)
      .attr('height', height);

    // Create the title for the legend
    svg.append('text')
      .attr('class', 'title')
      .attr('transform', 'translate(90,0)')
      .attr('x', width + legendOpts.translateX)
      .attr('y', legendOpts.translateY)
      .text(legendOpts.title)
      .attr('font-size', legendOpts.titleProperties['font-size'])
      .attr('fill', legendOpts.titleProperties['fill']);

    // Initiate Legend
    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('height', legendOpts.height)
      .attr('width', legendOpts.width)
      .attr('transform', 'translate(90,20)');

    // Create colour squares
    legend.selectAll('rect')
      .data(LegendOptions)
      .enter()
      .append('rect')
      .attr('x', width + legendOpts.translateX)
      .attr('y', (d, i) => i * legendOpts.iconSpacing)
      .attr('width', legendOpts.iconWidth)
      .attr('height', legendOpts.iconHeight)
      .style('fill', (d, i) => legendOpts.colorScale(i));

    // Create text next to squares
    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append('text')
      .attr('x', width + legendOpts.textTranslateX)
      .attr('y', (d, i) => i * legendOpts.textSpacing + legendOpts.textYOffset)
      .attr('font-size', legendOpts.labelTextProperties['font-size'])
      .attr('fill', legendOpts.labelTextProperties['fill'])
      .text(function (d) { return d; });
  }

  /**
   * Remove the chart
   */
  remove () {
    this.areas.forEach(area => area.remove());
  }
}

export default RadarChart;
