
class RadarChartT {
  /**
   * @param config {Object}
   * @param axisConfig {Array}
   * @param data {Array}
   * @param rootElement {Object} Root element to attach svg - should be a raw DOM element
   */
  constructor(config, axisConfig, data, rootElement) {

    this.areas = [];

    // We should be constructing some of these items in this class
    this.config = JSON.parse(JSON.stringify(config));
    this.config.color = config.color;

    this.data = JSON.parse(JSON.stringify(data));
    this.axisConfig = JSON.parse(JSON.stringify(axisConfig));
    this.rootElement = d3.select(rootElement);

    this.config.maxAxisNo = axisConfig.length;
	  this.config.levelRadius = this.config.factor * Math.min(this.config.w / 2, this.config.h / 2);

    // Calculate the maximum value for the chart
    const maxFromData = d3.max(this.data, (dataSet) => d3.max(dataSet.map(o => o.value)));
	  this.config.maxValue = Math.max(this.config.maxValue, maxFromData);


    // Calculate parameters describing the axis
	  this.axisParameters = axisConfig.map((axis, inx) => {
      const {config: cfg} = this;
      const {maxAxisNo: axisNo} = this.config;

      const x1 = cfg.w / 2;
      const y1 = cfg.h / 2;
      const x2 = cfg.w / 2 * (1 - cfg.factor*Math.sin(inx * cfg.radians / axisNo));
      const y2 = cfg.h / 2 * (1 - cfg.factor*Math.cos(inx * cfg.radians / axisNo));
      const label_x = cfg.w/2*(1-cfg.factorLegend*Math.sin(inx*cfg.radians/axisNo))-60*Math.sin(inx*cfg.radians/axisNo);
      const label_y = cfg.h/2*(1-Math.cos(inx*cfg.radians/axisNo))-20*Math.cos(inx*cfg.radians/axisNo);
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
            x: cfg.w / 2 * (1 - (parseFloat(Math.max(value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(inx * cfg.radians / axisNo)),
            y: cfg.h / 2 * (1 - (parseFloat(Math.max(value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(inx * cfg.radians / axisNo)),
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
  }

  renderAxis () {
    const {config: cfg} = this;
    const {maxAxisNo } = cfg;

    this.rootSvg = this.rootElement
        .append("svg")
        .attr("width", cfg.w+cfg.ExtraWidthX)
        .attr("height", cfg.h+cfg.ExtraWidthY)

    this.drawingContext = this.rootSvg
      .append("g")
      .attr("transform", "translate(" + this.config.TranslateX + "," + this.config.TranslateY + ")");

    // Circular segments
    for(var j = 0; j < cfg.levels - 1; j ++){
      var levelFactor = cfg.factor * cfg.levelRadius * ((j + 1) / cfg.levels);
      this.drawingContext.selectAll(".levels")
       .data(this.axisParameters)
       .enter()
       .append("svg:line")
       .attr("x1", function(d, i){return levelFactor*(1 - cfg.factor*Math.sin(i*cfg.radians/maxAxisNo));})
       .attr("y1", function(d, i){return levelFactor*(1 - cfg.factor*Math.cos(i*cfg.radians/maxAxisNo));})
       .attr("x2", function(d, i){return levelFactor*(1 - cfg.factor*Math.sin((i+1)*cfg.radians/maxAxisNo));})
       .attr("y2", function(d, i){return levelFactor*(1 - cfg.factor*Math.cos((i+1)*cfg.radians/maxAxisNo));})
       .attr("class", "line")
       .style("stroke", "grey")
       .style("stroke-opacity", "0.75")
       .style("stroke-width", "0.3px")
       .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
    }

	  var Format = d3.format('.2%');

    // Text indicating at what % each level is
    for(var j=0; j<cfg.levels; j++){
      var levelFactor = cfg.factor*cfg.levelRadius*((j+1)/cfg.levels);
      var z = this.drawingContext
       .selectAll(".levels")
       .data([1]) //dummy data
       .enter()
       .append("svg:text")
       .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
       .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
       .attr("class", "legend")
       .style("font-family", "sans-serif")
       .style("font-size", "10px")
       .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
       .attr("fill", "#737373")
       .text(Format((j+1)*cfg.maxValue/cfg.levels));
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
    const {config: cfg} = this;
    const {maxAxisNo} = cfg;

    this.data.forEach((y, x) => {
      const dataValues = [];
      this.areas.push(new Area(this.axisMap, y, this.drawingContext));

      // this.drawingContext
      //   .selectAll(".nodes")
      //   .data(y, function(j, i) {
      //     dataValues.push([
      //       cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / maxAxisNo)),
      //       cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / maxAxisNo))
      //     ]);
      //   });

      // this.drawingContext.selectAll(".area")
      //  .data([dataValues])
      //  .enter()
      //  .append("polygon")
      //  .attr("class", "radar-chart-serie"+series)
      //  .style("stroke-width", "2px")
      //  .style("stroke", cfg.color(series))
      //  .attr("points",function(d) {
      //    var str="";
      //    for(var pti=0;pti<d.length;pti++) {
      //      str=str+d[pti][0]+","+d[pti][1]+" ";
      //    }
      //    return str;
      //   })
      //  .style("fill", function(j, i) {return cfg.color(series)})
      //  .style("fill-opacity", cfg.opacityArea)
      //  .on('mouseover', function (d) {
      //     const z = "polygon."+d3.select(this).attr("class");
      //     g.selectAll("polygon")
      //      .transition(200)
      //      .style("fill-opacity", 0.1);
      //     g.selectAll(z)
      //      .transition(200)
      //      .style("fill-opacity", .7);
      //   })
      //  .on('mouseout', function() {
      //     g.selectAll("polygon")
      //      .transition(200)
      //      .style("fill-opacity", cfg.opacityArea);
      //  });
      // series++;
    });

    this.areas.forEach(area => area.render());

    series=0;

    // this.data.forEach((y, x) => {
    //   this.drawingContext.selectAll(".nodes")
    //   .data(y)
    //   .enter()
    //   .append("svg:circle")
    //   .call(d3.drag()
    //     .subject(function(d) { return this; })
    //     .on('drag', function(d) {
    //       var axis = axisMap[d.axis];
    //       var {x, y} = d3.event;
    //       d3.select(d3.event.subject)
    //         .attr("cx", axis.projectCordToAxis(x, y).x)
    //         .attr("cy", axis.projectCordToAxis(x, y).y)
    //     })
    //   )
    //   .attr("class", "radar-chart-serie"+series)
    //   .attr('r', cfg.radius)
    //   .attr("alt", function(j){return Math.max(j.value, 0)})
    //   .attr("cx", function(j, i) {
    //     return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/maxAxisNo));
    //   })
    //   .attr("cy", function(j, i) {
    //     return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/maxAxisNo));
    //   })
    //   .attr("data-id", function(j) {return j.axis})
    //   .style("fill", cfg.color(series)).style("fill-opacity", .9)
    //   .on('mouseover', (d) => {
    //       newX =  parseFloat(d3.select(this).attr('cx')) - 10;
    //       newY =  parseFloat(d3.select(this).attr('cy')) - 5;

    //       tooltip
    //         .attr('x', newX)
    //         .attr('y', newY)
    //         .text(Format(d.value))
    //         .transition(200)
    //         .style('opacity', 1);

    //       const z = "polygon."+d3.select(this).attr("class");
    //       this.drawingContext.selectAll("polygon")
    //         .transition(200)
    //         .style("fill-opacity", 0.1);
    //       this.drawingContext.selectAll(z)
    //         .transition(200)
    //         .style("fill-opacity", .7);
    //   })
    //   .on('mouseout', function(){
    //     tooltip
    //       .transition(200)
    //       .style('opacity', 0);
    //     g.selectAll("polygon")
    //       .transition(200)
    //       .style("fill-opacity", cfg.opacityArea);
    //   })
    //   .append("svg:title")
    //   .text(function(j){return Math.max(j.value, 0)})

    //   series++;
    // });
  }
}

