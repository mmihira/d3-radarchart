/**
 * Based of
 *  - https://github.com/alangrafu/radar-chart-d3
 *  - http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
 */
class RadarChart {
  /**
   * @param config {Object}
   * @param axisConfig {Array}
   * @param data {Array}
   * @param rootElement {Object} Root element to attach svg - should be a raw DOM element
   */
  // constructor(config, axisConfig, data, rootElement) {
  constructor(args) {
    this.rootElement = d3.select(args.rootElement);
    this.opts = _.omit(args, ['rootElement']);
    this.opts = _.cloneDeep(this.opts);
    this.data = this.opts.data;

    this.areas = [];

    // We should be constructing some of these items in this class

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    this.opts.axis.maxAxisNo = this.opts.axis.config.length;
	  this.opts.levels.levelRadius = this.opts.factor * Math.min(this.opts.dims.width / 2, this.opts.dims.height / 2);

    // Calculate the maximum value for the chart
    const maxFromData = d3.max(this.data, (dataSet) => d3.max(dataSet.map(o => o.value)));
	  this.opts.maxValue = Math.max(this.opts.maxValue, maxFromData);

	  this.axisParameters = this.axisConfig.map((axis, inx) => {
      const opts = this.opts;
      const {width, height} = this.opts.dims;
      const {maxAxisNo: axisNo} = this.opts.axis;
      const {RADIANS} = RadarChart;

      const x1 = width / 2;
      const y1 = height / 2;
      const x2 = width / 2 * (1 - opts.factor * Math.sin(inx * RADIANS / axisNo));
      const y2 = height / 2 * (1 - opts.factor * Math.cos(inx * RADIANS / axisNo));
      const label_x = ( width / 2) * (1 - opts.factorLegend * Math.sin(inx * RADIANS / axisNo)) - 60 * Math.sin(inx * RADIANS / axisNo);
      const label_y = ( height / 2) * (1 - Math.cos(inx * RADIANS / axisNo)) - 20 * Math.cos(inx * RADIANS/axisNo);
      const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
      const b = gradient === Infinity ? 0 : y2 - gradient * x2;
      const projectCordToAxis = function(x, y) {
        if (gradient === Infinity) {
          return {x: x1, y: y};
        } else {
          return {x: x, y: gradient * x + b};
        }
      };

      return {
        axis: axis.axisId,
        label: axis.label ? axis.label : axis.axisId,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        label_x: label_x,
        label_y: label_y,
        projectCordToAxis: projectCordToAxis,
        projectValueOnAxis: function(value) {
          return {
            x: width / 2 * (1 - (parseFloat(Math.max(value, 0)) / opts.maxValue) * opts.factor * Math.sin(inx * RADIANS / axisNo)),
            y: height / 2 * (1 - (parseFloat(Math.max(value, 0)) / opts.maxValue) * opts.factor * Math.cos(inx * RADIANS / axisNo)),
          };
        }
      };
    });

    this.axisMap = this.axisParameters
      .reduce((map, ix) => {
        map[ix.axis] = ix;
        return map;
      }, {});
  }

  render() {
    this.renderAxis();
    this.renderArea();
    this.renderLegend();
  }

  renderAxis() {
    const opts = this.opts;
    const {maxAxisNo} = this.opts.axis;
    const {
      width,
      height,
      extraWidthX,
      extraWidthY,
      translateX,
      translateY
    } = this.opts.dims;
    const {RADIANS} = RadarChart;

    this.rootSvg = this.rootElement
        .append("svg")
        .attr("width", width + extraWidthX)
        .attr("height", height + extraWidthY);

    this.drawingContext = this.rootSvg
      .append("g")
      .attr("transform", "translate(" + translateX + "," + translateY + ")");

    // Circular segments
    for(var j = 0; j < opts.levels.levelsNo - 1; j ++){
      var levelFactor = opts.factor * opts.levels.levelRadius * ((j + 1) / opts.levels.levelsNo);
      this.drawingContext.selectAll(".levels")
       .data(this.axisParameters)
       .enter()
       .append("svg:line")
       .attr("x1", function(d, i){return levelFactor*(1 - opts.factor*Math.sin(i*RADIANS/maxAxisNo));})
       .attr("y1", function(d, i){return levelFactor*(1 - opts.factor*Math.cos(i*RADIANS/maxAxisNo));})
       .attr("x2", function(d, i){return levelFactor*(1 - opts.factor*Math.sin((i+1)*RADIANS/maxAxisNo));})
       .attr("y2", function(d, i){return levelFactor*(1 - opts.factor*Math.cos((i+1)*RADIANS/maxAxisNo));})
       .attr("class", "line")
       .style("stroke", "grey")
       .style("stroke-opacity", "0.75")
       .style("stroke-width", "0.3px")
       .attr("transform", "translate(" + (width / 2 - levelFactor) + ", " + (height / 2 - levelFactor) + ")");
    }

	  var Format = d3.format('.2%');

    // Text indicating at what % each level is
    for(var j = 0; j < opts.levels.levelsNo; j++){
      var levelFactor = opts.factor * opts.levels.levelRadius * ((j + 1) / opts.levels.levelsNo);
      var z = this.drawingContext
       .selectAll(".levels")
       .data([1]) //dummy data
       .enter()
       .append("svg:text")
       .attr("x", function(d) {return levelFactor * (1 - opts.factor * Math.sin(0));})
       .attr("y", function(d) {return levelFactor * (1 - opts.factor * Math.cos(0));})
       .attr("class", "legend")
       .style("font-family", "sans-serif")
       .style("font-size", "10px")
       .attr("transform", "translate(" + (width / 2 - levelFactor + opts.ToRight) + ", " + (height / 2 - levelFactor) + ")")
       .attr("fill", "#737373")
       .text(Format((j+1) * opts.maxValue / opts.levels.levelsNo));
    }

    this.axisG = this.drawingContext
      .selectAll(".axis")
      .data(this.axisParameters)
      .enter()
      .append("g")

    this.axisLines = this.axisG
      .attr('pointer-events', 'none')
      .attr("class", "axis")
      .append("line")
      .attr("x1", d => d.x1)
      .attr("y1", d => d.y1)
      .attr("x2", d => d.x2)
      .attr("y2", d => d.y2)
      .attr("class", "line")
      .attr('pointer-events', 'none')
      .style("stroke", "grey")
      .style("stroke-width", "1px");

    this.axisText = this.axisG
      .append("text")
      .attr("class", "legend")
      .text(d => d.label)
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", () => "translate(0, -10)")
      .attr("x", d  => d.label_x)
      .attr("y", d  => d.label_y)
  }

  renderArea() {
    let series = 0;
    this.areas = this.data.map((series, inx) => new Area(this.axisMap, series, this.drawingContext, inx));
    this.areas.forEach(area => area.render());
  }

  renderLegend() {
    const {
      width,
      height,
      extraWidthX,
      extraWidthY,
      translateX,
      translateY
    } = this.opts.dims;
    const {
      width: legendWidth,
      height: legendHeight,
      marginTop
    } = this.opts.dims;
    const {opts} = this;

    var LegendOptions = ['Smartphone','Tablet'];
    var colorscale = d3.scaleOrdinal(d3.schemeAccent);

    var svg =
      this.rootSvg
      .append('svg')
      .attr("width", width + extraWidthX)
      .attr("height", height)

    // MAKE THESE CONFIGURABLE !!

    //Create the title for the legend
    var text = svg.append("text")
      .attr("class", "title")
      .attr('transform', 'translate(90,0)')
      .attr("x", width  - 70)
      .attr("y", 10)
      .attr("font-size", "12px")
      .attr("fill", "#404040")
      .text("What % of owners use a specific service in a week");

    //Initiate Legend
    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("height", legendHeight)
      .attr("width", legendWidth)
      .attr('transform', 'translate(90,20)')
      ;

    //Create colour squares
    legend.selectAll('rect')
      .data(LegendOptions)
      .enter()
      .append("rect")
      .attr("x", width  - 65)
      .attr("y", function(d, i){ return i * 20;})
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d, i){ return colorscale(i);})
      ;

    //Create text next to squares
    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append("text")
      .attr("x", width - 52)
      .attr("y", function(d, i){ return i * 20 + 9;})
      .attr("font-size", "11px")
      .attr("fill", "#737373")
      .text(function(d) { return d; })
      ;
  }

  /**
   * Remove the chart
   */
  remove() {
    this.areas.forEach(area => area.remove());
  }
}

RadarChart.RADIANS = 2 * Math.PI;
