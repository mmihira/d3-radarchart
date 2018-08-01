/**
 * The area represents the radar chat area for a particular series.
 * It includes the polygon and circles on the apex.
 */
class Area {
  /**
   * @param axisMap {Object} A map of axisId to axis Objects
   * @param data {Array} Array of axis to value for this series
   * @param drawingContext {Object} A svg g-element for drawing on
   */
  constructor(axisMap, data, drawingContext, seriesIdent) {
    this.axisMap = axisMap;
    this.data = JSON.parse(JSON.stringify(data));
    this.drawingContext = drawingContext;
	  this.color = d3.scaleOrdinal(d3.schemeAccent);
    this.seriesIdent = seriesIdent;
    this.opacityArea = 0.5;
    this.circleRadius = 5;

    // For each axisId calculate the apex points for this area
    this.points =  this.data.map(spoke => {
      return {
        cords: this.axisMap[spoke.axis].projectValueOnAxis(spoke.value),
        datum: spoke
      }
    });

    this.dataWrapper = {
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
    let series = 0;

    this.area = this.drawingContext.selectAll(".area")
     .data([this.dataWrapper])
     .enter()
     .append("polygon")
     .attr("class", "radar-chart-serie"+ this.seriesIdent)
     .style("stroke-width", "2px")
     .style("stroke", this.color(series))
     .attr("points",d => d.svgStringRep)
     .style("fill", () => this.color(series))
     .style("fill-opacity", this.opacityArea)
     .on('mouseover', this.createOnMouseOverPolygon())
     .on('mouseout', this.createOnMouseOutPolygon())

    this.circles = this.drawingContext.selectAll(".nodes")
      .data(this.points)
      .enter()
      .append("svg:circle")
      .call(d3.drag()
        .subject(function(d) { return this; })
        .on('drag', d => {
          var axis = this.axisMap[d.datum.axis];
          var {x, y} = d3.event;
          d3.select(d3.event.subject)
            .attr("cx", axis.projectCordToAxis(x, y).x)
            .attr("cy", axis.projectCordToAxis(x, y).y)
        })
      )
      .attr("class", "radar-chart-serie"+ this.seriesIdent)
      .attr('r', this.circleRadius)
      .attr("alt", function(j){return Math.max(j.value, 0)})
      .attr("cx", d => d.cords.x)
      .attr("cy", d => d.cords.y)
      // .attr("data-id", function(j) {return j.axis})
      .style("fill", this.color(series)).style("fill-opacity", .9)
      .on('mouseover', this.createOnMouseOverCircle())
      .on('mouseout', this.createMouseOutCirlce())
      .each(function(d) { d.ref = this; })

    this.circles
      .append("svg:title")
      .text(d => d.datum.value);
  }

  createOnMouseOverCircle() {
    const self = this;

    return function(el) {
      const z = "polygon."+d3.select(this).attr("class");
      self.drawingContext.selectAll("polygon")
        .transition(200)
        .style("fill-opacity", 0.1);
      self.drawingContext.selectAll(z)
        .transition(200)
        .style("fill-opacity", .7);
    }
  }

  createMouseOutCirlce() {
    const self = this;
    return function(el) {
      self.drawingContext.selectAll("polygon")
        .transition(200)
        .style("fill-opacity", self.opacityArea);
    }
  }

  createOnMouseOverPolygon() {
    const self = this;

    return function(el) {
      const z = "polygon." + d3.select(this).attr("class");

      self.drawingContext.selectAll("polygon")
       .transition(200)
       .style("fill-opacity", 0.1);

      self.drawingContext.selectAll(z)
       .transition(200)
       .style("fill-opacity", .7);
    }
  }

  createOnMouseOutPolygon() {
    const self = this;
    return function(el) {
      d3.select(this)
       .transition(200)
       .style("fill-opacity", self.opacityArea);
    }
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
