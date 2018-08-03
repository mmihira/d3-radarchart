/**
 * Based of
 *  - https://github.com/alangrafu/radar-chart-d3
 *  - http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
 */
class RadarChart {
  /**
   * @param args {Object}
   */
  constructor(args) {
    this.rootElement = d3.select(args.rootElement);
    this.opts = _.omit(args, ['rootElement']);
    this.opts = _.cloneDeep(this.opts);

    this.opts.axis.maxAxisNo = this.opts.axis.config.length;
	  this.opts.levels.levelRadius = this.opts.factor * Math.min(this.opts.dims.width / 2, this.opts.dims.height / 2);

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    // Calculate the maximum value for the chart only used if
    // opts.axis.useGlobalMax is true
    const maxFromData = d3.max(this.data, (dataSet) => d3.max(dataSet.map(o => o.value)));
	  this.opts.maxValue = Math.max(this.opts.maxValue, maxFromData);

	  this.axisParameters = this.axisConfig.map((axis, inx) => new Axis(this.opts, axis, inx));
    this.axisMap = this.axisParameters
      .reduce((map, ix) => {
        map[ix.axis] = ix;
        return map;
      }, {});

    // To store the area components
    this.areas = [];
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
    for(var lvlInx = 0; lvlInx < opts.levels.levelsNo - 1; lvlInx++) {
      var levelFactor = opts.factor * opts.levels.levelRadius * ((lvlInx + 1) / opts.levels.levelsNo);

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
    for(var lvlInx = 0; lvlInx < opts.levels.levelsNo; lvlInx++) {
      var levelFactor = opts.factor * opts.levels.levelRadius * ((lvlInx + 1) / opts.levels.levelsNo);

      var z = this.drawingContext
       .selectAll(".levels")
       .data(this.axisParameters)
       .enter()
       .append("svg:text")
       .attr("x", function(d, i) {return levelFactor * (1 - opts.factor * Math.sin(i * RADIANS/maxAxisNo));})
       .attr("y", function(d, i) {return levelFactor * (1 - opts.factor * Math.cos(i * RADIANS/maxAxisNo));})
       .attr("class", "legend")
       .style("font-family", "sans-serif")
       .style("font-size", "10px")
       .style("opacity", 0.0)
       .attr("transform", "translate(" + (width / 2 - levelFactor + opts.ToRight) + ", " + (height / 2 - levelFactor) + ")")
       .attr("fill", "#737373")
       .text(function(d) { return Format((lvlInx + 1) * d.maxValue / opts.levels.levelsNo); })
       .each(function(d) { d.axisTickTextElements.push(this); })
    }

    this.axisG = this.drawingContext
      .selectAll(".axis")
      .data(this.axisParameters)
      .enter()
      .append("g")

    this.axisLines = this.axisG
      .attr("class", "axis")
      .append("line")
      .attr("x1", d => d.x1)
      .attr("y1", d => d.y1)
      .attr("x2", d => d.x2)
      .attr("y2", d => d.y2)
      .attr("class", "line")
      .attr('pointer-events', 'none')
      .style("stroke", "grey")
      .style("stroke-width", "1px")

    this.rects =  this.axisG
       .append('rect')
       .attr('class', 'overlay')
       .attr("x", d => d.x1)
       .attr("y", d => d.y1)
       .attr("transform", (d, i) => "rotate(" + d.angleFromNorth + "," + d.x1 + "," + d.y1 +")")
       .attr('width', d => d.axisLength)
       .attr('height', 10)
       .attr('fill-opacity', 0.0)
       .on('mouseover', d => d.onRectMouseOver())
       .on('mouseout', d => d.onRectMouseOut())
       .each(function(datum) { datum.axisRect = this; })

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
      .attr('pointer-events', 'none')
  }

  renderArea() {
    let series = 0;
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
