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
  constructor(axisMap, data, drawingContext) {
    this.axisMap = axisMap;
    this.data = JSON.parse(JSON.stringify(data));
    this.drawingContext = drawingContext;
	  this.color = d3.scaleOrdinal(d3.schemeAccent);
    this.opacityArea = 0.5;

    // For each axisId calculate the apex points for this area
    this.points =  this.data.map(spoke => {
      return this.axisMap[spoke.axis].projectValueOnAxis(spoke.value);
    });

    this.dataWrapper = {
      points: this.points,
      svgStringRep: this.points.reduce((acc, p) => {
        return acc + p.x + "," + p.y + " ";
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
     .attr("class", "radar-chart-serie"+series)
     .style("stroke-width", "2px")
     .style("stroke", this.color(series))
     .attr("points",d => d.svgStringRep)
     .style("fill", () => this.color(series))
     .style("fill-opacity", this.opacityArea)
     .on('mouseover', this.createOnMouseOver())
     .on('mouseout', this.createOnMouseOut())
  }

  createOnMouseOver() {
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

  createOnMouseOut() {
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
     .on('mouseout', null)
    this.area.remove();
  }
}
