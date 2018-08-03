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
    }
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
      d.cords = self.axisMap[d.datum.axis].projectValueOnAxis(newValue)

      d3.select(d3.event.subject)
        .attr("cx", newX)
        .attr("cy", newY)

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
     .style("stroke", this.color(this.seriesIndex))
     .style("stroke", () => {
       if(this.opts.useColorScale) {
         return this.opts.lineColorScale(this.seriesIndex);
       }
      })
     .attr("points",d => d.svgStringRep)
     .style("fill", () => {
       if(this.opts.useColorScale) {
         return this.opts.areaColorScale(this.seriesIndex);
       }
      })
     .style("fill-opacity", this.opts.defaultAreaOpacity)
     .on('mouseover', this.createOnMouseOverPolygon())
     .on('mouseout', this.createOnMouseOutPolygon())
  }

  renderCircles() {
    this.circles = this.drawingContext.selectAll(".nodes")
      .data(this.points)
      .enter()
      .append("svg:circle")
      .call(d3.drag()
        .subject(function(d) { return this; })
        .on('drag', this.createOnDraggingCircle())
        .on('end', this.createOnDragEndCircle())
      )
      .attr("class", "radar-chart-serie" + this.seriesIdent)
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
      .on('mouseover', this.createOnMouseOverCircle())
      .on('mouseout', this.createMouseOutCirlce())
      .attr('z-index', 10)
      .each(function(d) { d.ref = this; })

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
      d3.select(d.ref)
        .on('mouseover', null)
        .on('mouseout', null)
        .remove();
    });

    this.area.remove();
  }
}
