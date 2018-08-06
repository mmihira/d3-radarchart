(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.myBundle = factory());
}(this, (function () { 'use strict';

  /**
   * The area represents the radar chat area for a particular series.
   * It includes the polygon and circles on the apex.
   */
  class Area {
    /**
     * @param axisMap {Object} A map of axisId to axis Objects
     * @param series {Array} Number of areas
     * @param drawingContext {Object} A svg g-element for drawing on
     * @param seriesIdent {String} The identity of the series must be unique
     * @param areaOptions {Object} Options for this area
     */
    constructor(args) {
      this.axisMap = args.axisMap;
      this.data = _.cloneDeep(args.series);
      this.drawingContext = args.drawingContext;
  	  this.color = d3.scaleOrdinal(d3.schemeAccent);
      this.seriesIdent = args.seriesIdent;
      this.seriesIndex = args.seriesIndex;
      this.opts = _.cloneDeep(args.areaOptions);
      this.opts.colorScale = args.areaOptions.colorScale;
      this.circleRadius = 5;

      // For each axisId calculate the apex points for this area
      this.points =  this.data.map(spoke => {
        return {
          cords: this.axisMap[spoke.axis].projectValueOnAxis(spoke.value),
          datum: _.cloneDeep(spoke)
        }
      });

      this.polygonWrapper = {
        points: this.points,
        svgStringRep: this.points.reduce((acc, p) => {
          return acc + p.cords.x + "," + p.cords.y + " ";
        }, "")
      };
    }

    /**
     * Render the nodes and the area
     */
    render() {
      this.renderArea();
      this.renderCircles();
    }

    updatePositions() {
      this.polygonWrapper.svgStringRep = this.points.reduce((acc, p) => {
          return acc + p.cords.x + "," + p.cords.y + " ";
        }, "");

      this.area.remove();
      this.renderArea();
    }

    createOnMouseOverCircle() {
      const self = this;

      return function(d) {
        const thisPolygon = "polygon." + d3.select(this).attr("class");
        d3.select(this)
          .style('fill-opacity', self.opts.hoverCircleOpacity);
        self.drawingContext.selectAll("polygon")
          .transition(200)
          .style("fill-opacity", self.opts.hiddenAreaOpacity);
        self.drawingContext.selectAll(thisPolygon)
          .transition(200)
          .style("fill-opacity", self.opts.highlightedAreaOpacity);

        d3.select(d.circleRef)
          .transition(100)
          .attr('r', self.circleRadius * self.opts.circleOverlayRadiusMult);
      }
    }

    createMouseOutCirlce() {
      const self = this;
      return function(d) {
        d3.select(this)
          .style('fill-opacity', self.opts.defaultCircleOpacity);
        self.drawingContext.selectAll("polygon")
          .transition(200)
          .style("fill-opacity", self.opts.defaultAreaOpacity);

        d3.select(d.circleRef)
          .transition(100)
          .attr('r', self.circleRadius);
      }
    }

    createOnDragEndCircle() {
      var self = this;
      return function(d) {
        var axis = self.axisMap[d.datum.axis];
        self.axisMap[d.datum.axis].dragActive = false;
        self.axisMap[d.datum.axis].onRectMouseOut();
      }
    }

    createOnDraggingCircle() {
      var self = this;
      return function(d) {
        var axis = self.axisMap[d.datum.axis];
        self.axisMap[d.datum.axis].onRectMouseOver();
        self.axisMap[d.datum.axis].dragActive = true;

        let {x: mouseX, y: mouseY} = d3.event;

        var newX = axis.projectCordToAxis(mouseX, mouseY).x;
        var newY = axis.projectCordToAxis(mouseX, mouseY).y;

        if (axis.quad === Axis.QUAD_1 || axis.quad === Axis.QUAD_2) {
          if (newY < axis.y2 || newY > axis.y1 ) return;
        } else {
          if (newY < axis.y1 || newY > axis.y2 ) return;
        }

        var newValue = axis.cordOnAxisToValue(newX, newY);

        d.datum.value = newValue;
        d.cords = self.axisMap[d.datum.axis].projectValueOnAxis(newValue);

        d3.select(d.circleRef)
          .attr("cx", newX)
          .attr("cy", newY);

        d3.select(d.overlayRef)
          .attr("cx", newX)
          .attr("cy", newY);

        self.updatePositions();
      }
    }

    createOnMouseOverPolygon() {
      const self = this;

      return function(el) {
        const thisPoly = "polygon." + d3.select(this).attr("class");
        self.drawingContext.selectAll("polygon")
         .transition(200)
         .style("fill-opacity", self.opts.hiddenAreaOpacity);

        self.drawingContext.selectAll(thisPoly)
         .transition(200)
         .style("fill-opacity", self.opts.highlightedAreaOpacity);
      }
    }

    createOnMouseOutPolygon() {
      const self = this;
      return function(el) {
        d3.select(this)
         .transition(200)
         .style("fill-opacity", self.opts.defaultAreaOpacity);
      }
    }

    renderArea() {
      this.area = this.drawingContext.selectAll(".area")
        .data([this.polygonWrapper])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie"+ this.seriesIdent)
        .style("stroke-width", "2px")
        .style("stroke", () => {
          if(this.opts.useColorScale) {
            return this.opts.lineColorScale(this.seriesIndex);
          }
        })
        .attr("points",d => d.svgStringRep)
        .attr('z-index', -1)
        .style("fill", () => {
          if(this.opts.useColorScale) {
            return this.opts.areaColorScale(this.seriesIndex);
          }
        })
        .style("fill-opacity", this.opts.defaultAreaOpacity)
        .on('mouseover', this.createOnMouseOverPolygon())
        .on('mouseout', this.createOnMouseOutPolygon());
    }

    renderCircles() {
      this.circles = this.drawingContext.selectAll(".nodes")
        .data(this.points)
        .enter()
        .append("svg:circle")
        .attr("class", "radar-chart-series" + this.seriesIdent)
        .attr('r', this.circleRadius)
        .attr("alt", function(j){return Math.max(j.value, 0)})
        .attr("cx", d => d.cords.x)
        .attr("cy", d => d.cords.y)
        .style("fill", () => {
          if(this.opts.useColorScale) {
            return this.opts.lineColorScale(this.seriesIndex);
          }
        })
        .style("fill-opacity", this.opts.defaultCircleOpacity)
        .each(function(d) { d.circleRef = this; });

      this.circleOverylays = this.drawingContext
        .selectAll('.nodes-overlay')
        .data(this.points)
        .enter()
        .append("svg:circle")
        .call(d3.drag()
          .subject(function(d) { return this; })
          .on('drag', this.createOnDraggingCircle())
          .on('end', this.createOnDragEndCircle())
        )
        .attr('r', this.circleRadius * this.opts.circleOverlayRadiusMult)
        .attr("cx", d => d.cords.x)
        .attr("cy", d => d.cords.y)
        .attr('opacity', 0.0)
        .on('mouseover', this.createOnMouseOverCircle())
        .on('mouseout', this.createMouseOutCirlce())
        .each(function(d) { d.overlayRef = this; });

      this.circles
        .append("svg:title")
        .text(d => d.datum.value);
    }

    /**
     * Remove this area. Also handles removing any event handlers.
     */
    remove() {
      this.area
       .on('mouseover', null)
       .on('mouseout', null);

      this.circles.each(function(d) {
        d3.select(d.circleRef)
          .on('mouseover', null)
          .on('mouseout', null)
          .remove();
      });

      this.circleOverylays.each(function(d) {
        d3.select(d.circleRef)
          .on('mouseover', null)
          .on('mouseout', null)
          .remove();
      });

      this.area.remove();
    }
  }

  /**
   * Represents the axis, labels and circles
   */
  class Axis$1 {
    constructor(opts, axisOptions, axisIndex) {
      this.opts = opts;
      this.axisIndex = axisIndex;
      this.axisOptions = axisOptions;

      this.dragActive = false;
      this.axisTickTextElements = [];
      this.calculateAxisParameters();
    }

    calculateAxisParameters() {
      const {opts, axisIndex, axisOptions} = this;
      const {width, height} = this.opts.dims;
      const {maxAxisNo} = this.opts.axis;
      const {RADIANS} = RadarChart;

      const x1 = width / 2;
      const y1 = height / 2;
      const x2 = width / 2 * (1 - opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo));
      const y2 = height / 2 * (1 - opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo));

      if (x2 < x1 && y2 <= y1) {
        this.quad = Axis$1.QUAD_1;
      } else if (x2 >= x2 && y2 <= y1) {
        this.quad = Axis$1.QUAD_2;
      } else if (x2 <= x2 && y2 >= y1) {
        this.quad = Axis$1.QUAD_3;
      } else if (x2 >= x2 && y2 >= y1) {
        this.quad = Axis$1.QUAD_4;
      }

      const label_x = (width / 2) * (1 - opts.factorLegend * Math.sin(axisIndex * RADIANS / maxAxisNo)) - 60 * Math.sin(axisIndex * RADIANS/maxAxisNo);
      const label_y = (height / 2) * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo)) - 20 * Math.cos(axisIndex * RADIANS / maxAxisNo);

      // Note the gradients are inversed because of the SVG co-ordinate system.
      const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
      const b = gradient === Infinity ? 0 : y2 - gradient * x2;
      this.gradient =  gradient;

      const projectCordToAxis = function(x, y) {
        if (gradient === Infinity) {
          return {x: x1, y: y};
        } else {
          if(gradient < -2 || (gradient >= 0 || gradient < 0.145)) {
            return {x: x, y: gradient * x + b};
          } else {
            return {x: (y-b)/gradient, y: y};
          }
        }
      };

      this.maxValue = opts.axis.useGlobalMax ? opts.axis.maxValue : axisOptions.axisValueMax;
      this.axisLength = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
      this.angleFromNorth = (180 / Math.PI) * (1 - axisIndex * RADIANS / maxAxisNo) - (180 / Math.PI) - 90 - (180 / Math.PI * 10 / this.axisLength / 2);

      this.axis = axisOptions.axisId,
      this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;

      this.label_x = label_x;
      this.label_y = label_y;

      const projectValueOnAxisXMultTerm = opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo);
      const projectValueOnAxisYMultTerm = opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo);

      this.projectCordToAxis = projectCordToAxis;
      this.projectValueOnAxis = function(value) {
        return {
          x: width / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * projectValueOnAxisXMultTerm),
          y: height / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * projectValueOnAxisYMultTerm),
        };
      };

      this.cordOnAxisToValue = function (x, y) {
        if (this.gradient === Infinity) {
          let len = Math.abs(this.y2 - y);
          return (this.axisLength - len) * this.maxValue/ this.axisLength;
        } else if (this.gradient >= 0 && this.gradient < 0.00000001) {
          let len = Math.abs(this.x2 - x);
          return (this.axisLength - len) * this.maxValue/ this.axisLength;
        } else {
          return (2*x/width - 1) * (this.maxValue/projectValueOnAxisXMultTerm) * -1;
        }
      };
    }

    onRectMouseOver() {
      if (this.dragActive) return false;
      this.axisTickTextElements.forEach(d => {
        d3.select(d)
          .style('opacity', 0.9);
      });
    }

    onRectMouseOut() {
      if (this.dragActive) return false;
      this.axisTickTextElements.forEach(d => {
        d3.select(d)
          .transition(200)
          .style('opacity', 0.0);
      });
    }
  }

  Axis$1.QUAD_1 = 'QUAD_1';
  Axis$1.QUAD_2 = 'QUAD_2';
  Axis$1.QUAD_3 = 'QUAD_3';
  Axis$1.QUAD_4 = 'QUAD_4';

  /**
   * Based of
   *  - https://github.com/alangrafu/radar-chart-d3
   *  - http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
   */
  class RadarChart$1 {
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

  	  this.axisParameters = this.axisConfig.map((axis, inx) => new Axis$1(this.opts, axis, inx));
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
      const {RADIANS} = RadarChart$1;

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
         .each(function(d) { d.axisTickTextElements.push(this); });
      }

      this.axisG = this.drawingContext
        .selectAll(".axis")
        .data(this.axisParameters)
        .enter()
        .append("g");

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
        .style("stroke-width", "1px");

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
         .each(function(datum) { datum.axisRect = this; });

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
        .attr('pointer-events', 'none');
    }

    renderArea() {
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

      var LegendOptions = ['Smartphone','Tablet'];
      var colorscale = d3.scaleOrdinal(d3.schemeAccent);

      var svg =
        this.rootSvg
        .append('svg')
        .attr("width", width + extraWidthX)
        .attr("height", height);

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

  RadarChart$1.RADIANS = 2 * Math.PI;

  return RadarChart$1;

})));
