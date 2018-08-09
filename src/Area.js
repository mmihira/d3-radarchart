import * as d3 from 'd3';
import * as _ from 'lodash';
import {
  QUAD_1,
  QUAD_2
} from './Axis.js';

/**
 * The area represents the radar chat area for a particular series.
 * It includes the polygon and circles on the apex.
 */
class Area {
  /**
   * @param opts {Object}
   */
  constructor (opts) {
    this.axisMap = opts.axisMap;
    this.data = _.cloneDeep(opts.series);
    this.drawingContext = opts.drawingContext;
    this.color = d3.scaleOrdinal(d3.schemeAccent);
    this.seriesIdent = opts.seriesIdent;
    this.seriesIndex = opts.seriesIndex;
    this.opts = _.cloneDeep(opts.areaOptions);
    this.opts.onValueChange = opts.areaOptions.onValueChange;
    this.opts.colorScale = opts.areaOptions.colorScale;
    this.circleRadius = 5;

    // For each axisId calculate the apex points for this area
    this.points = this.data.map(spoke => {
      return {
        cords: this.axisMap[spoke.axis].projectValueOnAxis(spoke.value),
        datum: _.cloneDeep(spoke)
      };
    });

    this.polygonWrapper = {
      points: this.points,
      svgStringRep: this.points.reduce((acc, p) => {
        return acc + p.cords.x + ',' + p.cords.y + ' ';
      }, '')
    };
  }

  /**
   * Render the nodes and the area
   */
  render () {
    this.renderArea();
    this.renderCircles();
  }

  updatePositions () {
    this.polygonWrapper.svgStringRep = this.points.reduce((acc, p) => {
      return acc + p.cords.x + ',' + p.cords.y + ' ';
    }, '');

    this.removeArea();
    this.renderArea();
  }

  createOnMouseOverCircle () {
    const self = this;

    return function (d) {
      const thisPolygon = 'polygon.' + d3.select(this).attr('class');
      d3.select(this)
        .style('fill-opacity', self.opts.hoverCircleOpacity);
      self.drawingContext.selectAll('polygon')
        .transition(200)
        .style('fill-opacity', self.opts.hiddenAreaOpacity);
      self.drawingContext.selectAll(thisPolygon)
        .transition(200)
        .style('fill-opacity', self.opts.highlightedAreaOpacity);

      d3.select(d.circleRef)
        .transition(100)
        .attr('r', self.circleRadius * self.opts.circleOverlayRadiusMult);
    };
  }

  createMouseOutCirlce () {
    const self = this;
    return function (d) {
      d3.select(this)
        .style('fill-opacity', self.opts.defaultCircleOpacity);
      self.drawingContext.selectAll('polygon')
        .transition(200)
        .style('fill-opacity', self.opts.defaultAreaOpacity);

      d3.select(d.circleRef)
        .transition(100)
        .attr('r', self.circleRadius);
    };
  }

  createOnDragEndCircle () {
    var self = this;
    return function (d) {
      self.axisMap[d.datum.axis].dragActive = false;
      self.axisMap[d.datum.axis].onRectMouseOut();
    };
  }

  createOnDraggingCircle () {
    var self = this;
    return function (d) {
      var axis = self.axisMap[d.datum.axis];
      self.axisMap[d.datum.axis].onRectMouseOver();
      self.axisMap[d.datum.axis].dragActive = true;

      let {x: mouseX, y: mouseY} = d3.event;

      var newX = axis.projectCordToAxis(mouseX, mouseY).x;
      var newY = axis.projectCordToAxis(mouseX, mouseY).y;

      if (axis.quad === QUAD_1 || axis.quad === QUAD_2) {
        if (newY < axis.y2 || newY > axis.y1) return;
      } else {
        if (newY < axis.y1 || newY > axis.y2) return;
      }

      var newValue = axis.cordOnAxisToValue(newX, newY);

      d.datum.value = newValue;
      d.cords = self.axisMap[d.datum.axis].projectValueOnAxis(newValue);

      d3.select(d.circleRef)
        .attr('cx', newX)
        .attr('cy', newY);

      d3.select(d.overlayRef)
        .attr('cx', newX)
        .attr('cy', newY);

      self.updatePositions();

      if (_.isFunction(self.opts.onValueChange)) {
        self.opts.onValueChange(d);
      }
    };
  }

  createOnMouseOverPolygon () {
    const self = this;

    return function (el) {
      const thisPoly = 'polygon.' + d3.select(this).attr('class');
      self.drawingContext.selectAll('polygon')
        .transition(200)
        .style('fill-opacity', self.opts.hiddenAreaOpacity);

      self.drawingContext.selectAll(thisPoly)
        .transition(200)
        .style('fill-opacity', self.opts.highlightedAreaOpacity);
    };
  }

  createOnMouseOutPolygon () {
    const self = this;
    return function (el) {
      d3.select(this)
        .transition(200)
        .style('fill-opacity', self.opts.defaultAreaOpacity);
    };
  }

  renderArea () {
    this.area = this.drawingContext.selectAll('.area')
      .data([this.polygonWrapper])
      .enter()
      .append('polygon')
      .attr('class', 'radar-chart-series' + this.seriesIdent)
      .style('stroke-width', '2px')
      .style('stroke', () => {
        if (this.opts.useColorScale) {
          return this.opts.lineColorScale(this.seriesIndex);
        }
      })
      .attr('points', d => d.svgStringRep)
      .attr('z-index', -1)
      .style('fill', () => {
        if (this.opts.useColorScale) {
          return this.opts.areaColorScale(this.seriesIndex);
        }
      })
      .style('fill-opacity', this.opts.defaultAreaOpacity)
      .on('mouseover', this.createOnMouseOverPolygon())
      .on('mouseout', this.createOnMouseOutPolygon());
  }

  renderCircles () {
    this.circles = this.drawingContext.selectAll('.nodes')
      .data(this.points)
      .enter()
      .append('svg:circle')
      .attr('class', 'radar-chart-series' + this.seriesIdent)
      .attr('r', this.circleRadius)
      .attr('alt', function (j) { return Math.max(j.value, 0); })
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .style('fill', () => {
        if (this.opts.useColorScale) {
          return this.opts.lineColorScale(this.seriesIndex);
        }
      })
      .style('fill-opacity', this.opts.defaultCircleOpacity)
      .each(function (d) { d.circleRef = this; });

    this.circleOverylays = this.drawingContext
      .selectAll('.nodes-overlay')
      .data(this.points)
      .enter()
      .append('svg:circle')
      .call(d3.drag()
        .subject(function (d) { return this; })
        .on('drag', this.createOnDraggingCircle())
        .on('end', this.createOnDragEndCircle())
      )
      .attr('r', this.circleRadius * this.opts.circleOverlayRadiusMult)
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .attr('opacity', 0.0)
      .on('mouseover', this.createOnMouseOverCircle())
      .on('mouseout', this.createMouseOutCirlce())
      .each(function (d) { d.overlayRef = this; });

    this.circles
      .append('svg:title')
      .text(d => d.datum.value);
  }

  removeArea () {
    this.area
      .on('mouseover', null)
      .on('mouseout', null);
    this.area.remove();
  }

  /**
   * Remove this area. Also handles removing any event handlers.
   */
  remove () {
    this.circles.each(function (d) {
      d3.select(d.circleRef)
        .on('mouseover', null)
        .on('mouseout', null)
        .remove();
    });
    this.circleOverylays.each(function (d) {
      d3.select(d.circleRef)
        .on('mouseover', null)
        .on('mouseout', null)
        .remove();
    });
    this.removeArea();
  }
}

export default Area;
