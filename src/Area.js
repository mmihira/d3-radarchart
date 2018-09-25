import * as d3 from 'd3';
import * as _ from 'lodash';
import {
  QUAD_1,
  QUAD_2
} from './Axis.js';
import { AREA_STATE, AREA_EVENT, browserVendor } from './const.js';

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
    this.seriesIdent = opts.seriesIdent;
    this.seriesIndex = opts.seriesIndex;
    this.zoomConfig = opts.zoomProps;
    this.opts = _.cloneDeep(opts.areaOptions);
    this.dims = opts.dims;
    this.opts.onValueChange = opts.areaOptions.onValueChange;
    this.opts.colorScale = opts.areaOptions.colorScale;
    this.onAreaUpdate = opts.onAreaUpdate;
    this.dragCoordOffset = {x: 0, y: 0};

    // Area legend Labels
    this.label = this.series.label;
    const words = this.label.split(' ');

    // Create lines for the legend labels
    this.legendLabelLines = [words[0]];
    this.legendLabelLines = words.slice(1).reduce((acc, word) => {
      if ((acc[acc.length - 1].length + word.length) <= this.opts.textOverflowWidthLimit) {
        acc[acc.length - 1] = acc[acc.length - 1] + ' ' + word;
      } else {
        acc.push(word);
      }
      return acc;
    }, this.legendLabelLines);

    this.labelTextLineSpacing = d3.scaleLinear()
      .domain([100, 1200])
      .range(this.opts.textLineSpacingRangeLegend);

    this.polygonClassName = `chart-poly-${this.seriesIdent}`;
    this.polygonVertexLables = `poly-labels-${this.seriesIdent}`;
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

    this.setupZoomInterpolators();
    // Will hold the svg elements once created.
    this.legendLabelEls = [];
    this.onLegendOver = this.onLegendOver.bind(this);
    this.onLegendOut = this.onLegendOut.bind(this);
    this.hilightThisAreaRemove = this.hilightThisAreaRemove.bind(this);
    this.hilightThisArea = this.hilightThisArea.bind(this);
    this.state = AREA_STATE.NEUTRAL;
    this.postRenderQueue = [];
    this.draggingParams = {
      tFMatrix: null,
      svgEl: null
    };
  }

  /**
   * All events route through here
   * @param self {Object} this class
   * @param NEW_EVENT {String} New Event
   */
  createEventHandler (NEW_EVENT, self) {
    /**
     * @param d {Object} d3 backing datum
     */
    return function (d) {
      switch (NEW_EVENT) {
        case AREA_EVENT.CIRCLE_WHEEL_SCROLL:
          d3.event.stopPropagation();
          console.warn('hello');
          break;
        case AREA_EVENT.CIRCLE_ENTER:
          if (self.state !== AREA_STATE.DRAGGING &&
              self.state !== AREA_STATE.CIRCLE_LEAVE_WHILE_DRAGGING) {
            self.state = AREA_STATE.CIRCLE_HOVER;
            d3.select(d.circleRef)
              .style('fill-opacity', self.opts.hoverCircleOpacity);

            self.hilightThisArea();

            d3.select(d.circleRef)
              .transition(100)
              .attr('r', self.opts.circleProps.defaultRadius * self.opts.circleProps.circleOverlayRadiusMult);
            self.axisMap[d.datum.axis].setAxisLabelValue(
              self.getCurrentValueForAxis(d.datum.axis)
            );
          }
          break;
        case AREA_EVENT.CIRCLE_LEAVE:
          if (self.state === AREA_STATE.CIRCLE_HOVER) {
            d3.select(d.circleRef)
              .style('fill-opacity', self.opts.defaultCircleOpacity);

            self.hilightThisAreaRemove();

            d3.select(d.circleRef)
              .transition(100)
              .attr('r', self.opts.circleProps.defaultRadius);
            self.axisMap[d.datum.axis].setAxisLabelValue(null);
            self.state = AREA_STATE.NEUTRAL;
          } else if (self.state === AREA_STATE.DRAGGING) {
            self.state = AREA_STATE.CIRCLE_LEAVE_WHILE_DRAGGING;
          }
          break;
        case AREA_EVENT.DRAGGING_START:
          if (browserVendor.isFirefox) {
            const ctm = this.getCTM();
            let svgEl = self.drawingContext().nodes()[0].parentNode;
            let transformationMatrix = svgEl.createSVGMatrix();

            transformationMatrix.e = svgEl.parentNode.getBoundingClientRect().x;
            transformationMatrix.f = svgEl.parentNode.getBoundingClientRect().y;
            transformationMatrix = transformationMatrix.multiply(ctm);
            self.draggingParams.tFMatrix = transformationMatrix.inverse();
            self.draggingParams.svgEl = svgEl;
          }
          break;
        case AREA_EVENT.DRAGGING:
          self.draggingActions(d, self);
          break;
        case AREA_EVENT.DRAGGING_END:
          self.axisMap[d.datum.axis].dragActive = false;
          self.axisMap[d.datum.axis].onAxisLineRectMouseOut();
          self.axisMap[d.datum.axis].setAxisLabelValue(null);

          d3.select(d.circleRef)
            .style('fill-opacity', self.opts.defaultCircleOpacity);

          self.state = AREA_STATE.NEUTRAL;
          self.postRenderQueue.push(() => self.hilightThisAreaRemove());
          self.updatePolygonPositions();
          self.ctm = null;
          break;
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

  draggingActions (d, self) {
    var axis = self.axisMap[d.datum.axis];
    self.axisMap[d.datum.axis].onAxisLineRectOver();
    self.axisMap[d.datum.axis].dragActive = true;

    let {x: mouseX, y: mouseY} = d3.event;

    /**
     * Firefox doesn't include ancestor transformations in calculating
     * the current transformation matrix. So we have to compensate
     * for that manually.
     * https://github.com/d3/d3-selection/issues/81*
     * https://bugzilla.mozilla.org/show_bug.cgi?id=972041*
     */
    if (browserVendor.isFirefox) {
      let eventPoint = self.draggingParams.svgEl.createSVGPoint();

      eventPoint.x = d3.event.sourceEvent.clientX;
      eventPoint.y = d3.event.sourceEvent.clientY;

      eventPoint = eventPoint.matrixTransform(self.draggingParams.tFMatrix);

      mouseX = eventPoint.x;
      mouseY = eventPoint.y;
    }

    var newX = axis.projectCordToAxis(mouseX, mouseY).x;
    var newY = axis.projectCordToAxis(mouseX, mouseY).y;

    if (axis.quad === QUAD_1 || axis.quad === QUAD_2) {
      if (newY < axis.y2 || newY > axis.y1) return;
    } else {
      if (newY < axis.y1 || newY > axis.y2) return;
    }
    this.state = AREA_STATE.DRAGGING;

    var newValue = axis.cordOnAxisToValue(newX, newY);
    d.datum.value = newValue;
    d.cords = self.axisMap[d.datum.axis].projectValueOnAxis(newValue);
    self.axisMap[d.datum.axis].setAxisLabelValue(newValue);

    self.updatePolygonPositions();

    if (_.isFunction(self.opts.onValueChange)) {
      self.opts.onValueChange(d);
    }
  }

  /**
   * Highlight this area
   */
  hilightThisArea () {
    const thisPolygon = '.' + this.polygonClassName;
    this.drawingContext()
      .selectAll('polygon')
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.hiddenAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.hiddenStrokeOpacity);

    this.showVertexLabels();

    this.drawingContext()
      .selectAll(thisPolygon)
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.highlightedAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.highlightedStrokeOpacity);

    this.currentAreaOpacity = this.opts.areaHighlightProps.highlightedAreaOpacity;
  }

  hideVertexLabels () {
    this.drawingContext()
      .selectAll('.' + this.polygonVertexLables)
      .style('opacity', this.opts.areaHighlightProps.hiddenLabelOpacity);
  }

  showVertexLabels () {
    this.drawingContext()
      .selectAll('.' + this.polygonVertexLables)
      .style('opacity', this.opts.areaHighlightProps.highlightedLabelOpacity);
  }

  /**
   * Remove this area highlight
   */
  hilightThisAreaRemove () {
    this.drawingContext().selectAll('polygon')
      .transition(200)
      .style('fill-opacity', this.opts.areaHighlightProps.defaultAreaOpacity)
      .style('stroke-opacity', this.opts.areaHighlightProps.defaultStrokeOpacity);
    this.hideVertexLabels();

    this.currentAreaOpacity = this.opts.areaHighlightProps.defaultAreaOpacity;
  }

  /**
   * Is circle drag active
   */
  isDragActive () {
    return this.state === AREA_STATE.CIRCLE_LEAVE_WHILE_DRAGGING || this.state === AREA_STATE.DRAGGING;
  }

  /**
   * Called by the legend onHover Handler
   */
  onLegendOver () {
    if (!this.dragActive) {
      d3.select(this.legendRect)
        .attr('opacity', 1.0);
      this.legendLabelEls
        .map(e => d3.select(e))
        .forEach(e => {
          e.attr('fill', this.opts.areaColorScale(this.seriesIndex));
          e.attr('font-weight', 'bold');
        });
      this.hilightThisArea(this);

      Object.values(this.axisMap).forEach(d => {
        d.setAxisLabelValue(this.getCurrentValueForAxis(d.axis));
      });
    }
  }

  /**
   * Called by the legend onHoverOut Handler
   */
  onLegendOut () {
    if (!this.dragActive) {
      d3.select(this.legendRect)
        .attr('opacity', 0.7);
      this.legendLabelEls
        .map(e => d3.select(e))
        .forEach(e => {
          e.attr('fill', e.attr('original-fill'));
          e.attr('font-weight', 'normal');
        });
      this.hilightThisAreaRemove(this);
      Object.values(this.axisMap).forEach(d => {
        d.setAxisLabelValue(null);
      });
    }
  }

  /**
   * On zoom update the stroke & circle sizes
   * @param k zoom level
   */
  onZoomUpdateSizes (k) {
    this.opts.lineProps.strokeWidth = this.zlop.areaLineLop(k);
    this.opts.circleProps.defaultRadius = this.zlop.circleRadiusLop(k);
    this.opts.labelProps.fontSize = this.zlop.fontLop(k);
  }

  /**
   * Render polygons
   */
  renderArea () {
    this.area = this
      .drawingContext()
      .selectAll(this.polygonClassName)
      .data([this.polygonWrapper])
      .enter()
      .append('polygon')
      .attr('class', this.polygonClassName)
      .style('stroke-width', this.opts.lineProps.strokeWidth + 'px')
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
      .style('font-size', this.opts.labelProps.fontSize + 'px')
      .style('opacity', () => {
        return this.isDragActive() ? 1.0 : this.opts.areaHighlightProps.defaultLabelOpacity;
      });

    if (this.opts.areaHighlight) {
      this.area
        .on('mouseover', this.createOnMouseOverPolygon())
        .on('mouseout', this.createOnMouseOutPolygon());
    }
  }

  /**
   * Render
   */
  renderCircles () {
    this.circles = this.drawingContext()
      .selectAll(this.circleClassName)
      .data(this.points)
      .enter()
      .append('svg:circle')
      .attr('r', () => {
        return this.isDragActive() ? this.opts.circleProps.circleOverlayRadiusMult * this.opts.circleProps.defaultRadius : this.opts.circleProps.defaultRadius;
      })
      .attr('alt', function (j) { return Math.max(j.value, 0); })
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .attr('class', this.circleClassName)
      .style('fill', () => {
        if (this.opts.useColorScale) {
          return this.opts.lineColorScale(this.seriesIndex);
        }
      })
      .style('fill-opacity', () => {
        return this.isDragActive() ? this.opts.hoverCircleOpacity : this.opts.defaultCircleOpacity;
      })
      .each(function (d) { d.circleRef = this; });

    this.circleOverylays = this.drawingContext()
      .selectAll(this.circleOverlayClassName)
      .data(this.points)
      .enter()
      .append('svg:circle')
      .attr('r', this.opts.circleProps.defaultRadius * this.opts.circleProps.circleOverlayRadiusMult)
      .attr('cx', d => d.cords.x)
      .attr('cy', d => d.cords.y)
      .attr('opacity', 0.0)
      .attr('class', this.circleOverlayClassName)
      .attr('pointer-events', 'all')
      .each(function (d) { d.overlayRef = this; });

    if (this.series.circleHighlight) {
      this.circleOverylays
        .on('mouseover', this.createEventHandler(AREA_EVENT.CIRCLE_ENTER, this))
        .on('mouseout', this.createEventHandler(AREA_EVENT.CIRCLE_LEAVE, this));
    }

    if (this.series.dragEnabled) {
      this.circleOverylays
        .call(d3.drag()
          .subject(function (d) { return this; })
          .on('start', this.createEventHandler(AREA_EVENT.DRAGGING_START, this))
          .on('drag', this.createEventHandler(AREA_EVENT.DRAGGING, this))
          .on('end', this.createEventHandler(AREA_EVENT.DRAGGING_END, this))
        );
    }

    this.circles
      .append('svg:title')
      .text(d => d.datum.value);
  }

  /**
   * Remove this area. Also handles removing any event handlers.
   */
  remove () {
    if (this.series.showCircle) {
      d3.selectAll('.' + this.circleOverlayClassName)
        .on('mouseover', null)
        .on('mouseout', null)
        .on('drag', null)
        .on('end', null)
        .data([])
        .exit()
        .remove();
      d3.selectAll('.' + this.circleClassName)
        .data([])
        .exit()
        .remove();
    }
    this.circles = [];
    this.circleOverylays = [];
    this.removeArea();
  }

  removeArea () {
    d3.selectAll('.' + this.polygonClassName)
      .on('mouseover', null)
      .on('mouseout', null)
      .data([])
      .exit()
      .remove();
    this.areaVertexLabels.remove();
  }

  /**
   * Render the nodes and the area
   */
  render () {
    this.renderArea();
    if (this.series.showCircle) {
      this.renderCircles();
    }

    while (this.postRenderQueue.length > 0) {
      this.postRenderQueue.pop()();
    }
  }

  /**
   * Setup intepolators to scale based on the zoom
   */
  setupZoomInterpolators () {
    const maxZoom = this.zoomConfig.scaleExtent.maxZoom;
    this.zlop = {};

    const base = 8;
    this.zlop.areaLineLop = d3.scaleLog()
      .base(base)
      .domain([1, maxZoom])
      .range([this.opts.lineProps.strokeWidth, this.opts.lineProps.maxZoomStroke]);

    this.zlop.circleRadiusLop = d3.scaleLog()
      .base(base)
      .domain([1, maxZoom])
      .range([this.opts.circleProps.defaultRadius, this.opts.circleProps.maxZoomRadius]);

    this.zlop.fontLop = d3.scaleLog()
      .domain([1, maxZoom])
      .range([this.opts.labelProps.fontSize, this.opts.labelProps.maxFontSize]);
  }

  getCurrentValueForAxis (axisId) {
    return this.points.find(e => e.datum.axis === axisId).datum.value;
  }

  /**
   * Update the polygon path
   */
  updatePolygonPositions () {
    this.polygonWrapper.svgStringRep = this.points.reduce((acc, p) => {
      return acc + p.cords.x + ',' + p.cords.y + ' ';
    }, '');

    this.onAreaUpdate();
  }

  onAxisLabelRectOver(axisId) {
    const currentValue = this.getCurrentValueForAxis(axisId);
    this.axisMap[axisId].setAxisLabelValue(currentValue);
  }

  onWheelEvent (axis) {
    d3.event.stopPropagation();
    const { axisId } = axis.axisOptions;
    const currentValue = this.getCurrentValueForAxis(axisId);
    let newValue;
    if (d3.event.deltaY <= 0) {
      newValue = currentValue + axis.range * 0.01;
    } else {
      newValue = currentValue - axis.range * 0.01;
    }

    if (newValue >= axis.maxValue) {
      newValue = axis.maxValue;
    }

    if (newValue <= axis.minValue) {
      newValue = axis.minValue;
    }

    const point = this.points.find(e => e.datum.axis === axisId);
    point.datum.value = newValue;
    point.cords = this.axisMap[axisId].projectValueOnAxis(newValue);

    this.axisMap[axisId].setAxisLabelValue(newValue);
    this.updatePolygonPositions();

    if (_.isFunction(this.opts.onValueChange)) {
      this.opts.onValueChange(point);
    }
  }
}

export default Area;
