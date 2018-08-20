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
    this.series = _.cloneDeep(opts.series);
    this.drawingContext = opts.drawingContext;
    this.color = d3.scaleOrdinal(d3.schemeAccent);
    this.seriesIdent = opts.seriesIdent;
    this.seriesIndex = opts.seriesIndex;
    this.opts = _.cloneDeep(opts.areaOptions);
    this.opts.onValueChange = opts.areaOptions.onValueChange;
    this.opts.colorScale = opts.areaOptions.colorScale;
    this.onAreaUpdate = opts.onAreaUpdate;
    this.circleRadius = 5;
    this.label = this.series.label;

    this.polygonClassName = `chart-poly-${this.seriesIdent}`;
    this.polygonVertexLables = `poly-lables-${this.seriesIdent}`;
    this.circleOverlayClassName = `circle-overlay${this.seriesIdent}`;
    this.circleClassName = `circle-${this.seriesIdent}`;

    this.currentAreaOpacity = this.opts.areaHighlightProps.defaultAreaOpacity;

    // For each axisId calculate the apex points for this area
    this.points = this.series.data.map(spoke => {
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

    this.onLegendOver = this.onLegendOver.bind(this);
    this.onLegendOut = this.onLegendOut.bind(this);
    this.hilightThisAreaRemove = this.hilightThisAreaRemove.bind(this);
    this.hilightThisArea = this.hilightThisArea.bind(this);
  }

  circleSelectionTransition (d, self) {
    d3.select(d.circleRef)
      .style('fill-opacity', self.opts.hoverCircleOpacity);

    self.hilightThisArea();

    d3.select(d.circleRef)
      .transition(100)
      .attr('r', self.circleRadius * self.opts.circleOverlayRadiusMult);
  }

  circleSelectionTransitionOut (d, self) {
    d3.select(d.circleRef)
      .style('fill-opacity', self.opts.defaultCircleOpacity);

    self.hilightThisAreaRemove();

    d3.select(d.circleRef)
      .transition(100)
      .attr('r', self.circleRadius);
  }

  createOnDragEndCircle () {
    var self = this;
    return function (d) {
      self.axisMap[d.datum.axis].dragActive = false;
      self.dragActive = false;
      self.axisMap[d.datum.axis].onRectMouseOut();
      self.circleSelectionTransitionOut(d, self);
      self.hilightThisAreaRemove();
    };
  }

  createOnDraggingCircle () {
    var self = this;
    return function (d) {
      var axis = self.axisMap[d.datum.axis];
      self.axisMap[d.datum.axis].onRectMouseOver();
      self.axisMap[d.datum.axis].dragActive = true;
      self.dragActive = true;

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
      self.hilightThisArea();

      if (_.isFunction(self.opts.onValueChange)) {
        self.opts.onValueChange(d);
      }
    };
  }

  createMouseOutCirlce (_self) {
    const self = _self;
    return function (d) {
      if (!self.dragActive) {
        self.circleSelectionTransitionOut(d, self);
      }
    };
  }

  createOnMouseOverCircle (_self) {
    const self = _self;
    return function (d) {
      if (!self.dragActive) {
        self.circleSelectionTransition(d, self);
      }
    };
  }

  createOnMouseOverPolygon () {
    const self = this;
    return function (el) {
      const thisPoly = '.' + self.polygonClassName;
      self.drawingContext().selectAll('polygon')
        .transition(200)
        .style('fill-opacity', self.opts.areaHighlightProps.hiddenAreaOpacity);

      self.drawingContext().selectAll(thisPoly)
        .transition(200)
        .style('fill-opacity', self.opts.areaHighlightProps.highlightedAreaOpacity);
    };
  }

  createOnMouseOutPolygon () {
    const self = this;
    return function (el) {
      d3.select(this)
        .transition(200)
        .style('fill-opacity', self.opts.areaHighlightProps.defaultAreaOpacity);
    };
  }

  hilightThisArea () {
    const thisPolygon = '.' + this.polygonClassName;
    this.drawingContext()
      .selectAll('polygon')
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.hiddenAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.hiddenStrokeOpacity);

    this.drawingContext()
      .selectAll('.' + this.polygonVertexLables)
      .style('opacity', this.opts.areaHighlightProps.highlightedLabelOpacity);

    this.drawingContext()
      .selectAll(thisPolygon)
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.highlightedAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.highlightedStrokeOpacity);

    this.currentAreaOpacity = this.opts.areaHighlightProps.highlightedAreaOpacity;
  }

  hilightThisAreaRemove () {
    this.drawingContext().selectAll('polygon')
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.defaultAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.defaultStrokeOpacity);

    this.drawingContext()
      .selectAll('.' + this.polygonVertexLables)
      .style('opacity', this.opts.areaHighlightProps.hiddenLabelOpacity);

    this.currentAreaOpacity = this.opts.areaHighlightProps.defaultAreaOpacity;
  }

  renderArea () {
    this.area = this
      .drawingContext()
      .selectAll(this.polygonClassName)
      .data([this.polygonWrapper])
      .enter()
      .append('polygon')
      .attr('class', this.polygonClassName)
      .style('stroke-width', this.opts.lineProps['stroke-width'])
      .style('stroke', () => {
        if (this.opts.useColorScale) {
          return this.opts.lineColorScale(this.seriesIndex);
        }
      })
      .style('stroke-opacity', this.opts.areaHighlightProps.defaultStrokeOpacity)
      .attr('points', d => d.svgStringRep)
      .style('fill', () => {
        if (this.opts.useColorScale) {
          return this.opts.areaColorScale(this.seriesIndex);
        }
      })
      .style('fill-opacity', this.currentAreaOpacity);

    var Format = d3.format('.2');
    this.areaVertexLabels = this
      .drawingContext()
      .selectAll(this.polygonVertexLables)
      .data(this.points)
      .enter()
      .append('svg:text')
      .text(d => Format(d.datum.value))
      .attr('x', d => d.cords.x)
      .attr('y', d => d.cords.y)
      .attr('class', this.polygonVertexLables)
      .style('font-family', this.opts.labelProps['font-family'])
      .style('font-size', this.opts.labelProps['font-size'])
      .style('opacity', this.opts.areaHighlightProps.defaultLabelOpacity);

    if (this.opts.areaHighlight) {
      this.area
        .on('mouseover', this.createOnMouseOverPolygon())
        .on('mouseout', this.createOnMouseOutPolygon());
    }
  }

  renderCircles () {
    this.circles = this.drawingContext()
      .selectAll(this.circleClassName)
      .data(this.points)
      .enter()
      .append('svg:circle')
      .attr('r', this.circleRadius)
      .attr('alt', function (j) { return Math.max(j.value, 0); })
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .attr('class', this.circleClassName)
      .style('fill', () => {
        if (this.opts.useColorScale) {
          return this.opts.lineColorScale(this.seriesIndex);
        }
      })
      .style('fill-opacity', this.opts.defaultCircleOpacity)
      .each(function (d) { d.circleRef = this; });

    this.circleOverylays = this.drawingContext()
      .selectAll(this.circleOverlayClassName)
      .data(this.points)
      .enter()
      .append('svg:circle')
      .attr('r', this.circleRadius * this.opts.circleOverlayRadiusMult)
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .attr('opacity', 0.0)
      .attr('class', this.circleOverlayClassName)
      .attr('pointer-events', 'all')
      .each(function (d) { d.overlayRef = this; });

    if (this.series.circleHighlight) {
      this.circleOverylays
        .on('mouseover', this.createOnMouseOverCircle(this))
        .on('mouseout', this.createMouseOutCirlce(this));
    }

    if (this.series.dragEnabled) {
      this.circleOverylays
        .call(d3.drag()
          .subject(function (d) { return this; })
          .on('drag', this.createOnDraggingCircle())
          .on('end', this.createOnDragEndCircle())
        );
    }

    this.circles
      .append('svg:title')
      .text(d => d.datum.value);
  }

  onLegendOver () {
    if (!this.dragActive) {
      this.hilightThisArea(this);
    }
  }

  onLegendOut () {
    if (!this.dragActive) {
      this.hilightThisAreaRemove(this);
    }
  }

  /**
   * Remove this area. Also handles removing any event handlers.
   */
  remove () {
    if (this.series.showCircle) {
      this.circleOverylays.each(function (d) {
        d3.select(d.circleRef)
          .on('mouseover', null)
          .on('mouseout', null)
          .on('drag', null)
          .on('end', null)
          .remove();
      });
      this.circles.each(function (d) {
        d3.select(d.circleRef)
          .remove();
      });
    }
    this.removeArea();
  }

  removeArea () {
    this.area
      .on('mouseover', null)
      .on('mouseout', null);
    this.areaVertexLabels.remove();
    this.area.remove();
  }

  /**
   * Render the nodes and the area
   */
  render () {
    this.renderArea();
    if (this.series.showCircle) {
      this.renderCircles();
    }
  }

  updatePositions () {
    this.polygonWrapper.svgStringRep = this.points.reduce((acc, p) => {
      return acc + p.cords.x + ',' + p.cords.y + ' ';
    }, '');

    this.onAreaUpdate();
  }
}

export default Area;
