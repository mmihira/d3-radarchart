import * as d3 from 'd3';
import isFunction from 'lodash.isfunction';
import { AXIS_QUADS, AREA_STATE, AREA_EVENT, browserVendor } from '../const.js';
import Area from '../renderer/Area.js';
const { QUAD_1, QUAD_2 } = AXIS_QUADS;

function highlightArea (areaDatum, areaProps) {
  this.selectors
    .selectAllPolygons()
    .transition(200)
    .style('fill-opacity', areaProps.areaHighlightProps.hiddenAreaOpacity)
    .style('stroke-opacity', areaProps.areaHighlightProps.hiddenStrokeOpacity);

  this.showVertexLabelsForArea(areaDatum, areaProps);

  this.selectors
    .selectPolygonForSeries(areaDatum.props.seriesId)
    .transition(200)
    .style('fill-opacity', areaProps.areaHighlightProps.highlightedAreaOpacity)
    .style(
      'stroke-opacity',
      areaProps.areaHighlightProps.highlightedStrokeOpacity
    );

  areaDatum.state.currentAreaOpacity =
    areaProps.areaHighlightProps.highlightedAreaOpacity;
}

function highlightAreaRemove (areaDatum, areaProps) {
  this.selectors
    .selectAllPolygons()
    .transition(200)
    .style('fill-opacity', areaProps.areaHighlightProps.defaultAreaOpacity)
    .style('stroke-opacity', areaProps.areaHighlightProps.defaultStrokeOpacity);

  this.hideVertexLabelForArea(areaDatum, areaProps);

  areaDatum.state.currentAreaOpacity =
    areaProps.areaHighlightProps.defaultAreaOpacity;
}

function showVertexLabelsForArea (areaDatum, areaProps) {
  this.selectors
    .selectPolyVertexLabelForSeries(areaDatum.props.seriesId)
    .style('opacity', areaProps.areaHighlightProps.highlightedLabelOpacity);
}

function hideVertexLabelForArea (areaDatum, areaProps) {
  this.selectors
    .selectPolyVertexLabelForSeries(areaDatum.props.seriesId)
    .style('opacity', areaProps.areaHighlightProps.hiddenLabelOpacity);
}

function draggingActions (areaDatum, pointDatum, context, areaProps) {
  const axis = this.state.axisById(pointDatum.axisId).props;

  let { x: mouseX, y: mouseY } = d3.event;

  /**
   * Firefox doesn't include ancestor transformations in calculating
   * the current transformation matrix. So we have to compensate
   * for that manually.
   * https://github.com/d3/d3-selection/issues/81*
   * https://bugzilla.mozilla.org/show_bug.cgi?id=972041*
   */
  if (browserVendor.isFirefox) {
    let eventPoint = areaDatum.state.draggingParams.svgEl.createSVGPoint();

    eventPoint.x = d3.event.sourceEvent.clientX;
    eventPoint.y = d3.event.sourceEvent.clientY;

    eventPoint = eventPoint.matrixTransform(
      areaDatum.state.draggingParams.tFMatrix
    );

    mouseX = eventPoint.x;
    mouseY = eventPoint.y;
  }

  const newX = axis.projectCordToAxis(mouseX, mouseY).x;
  const newY = axis.projectCordToAxis(mouseX, mouseY).y;

  if (axis.quad === QUAD_1 || axis.quad === QUAD_2) {
    if (newY < axis.y2 || newY > axis.y1) return;
  } else {
    if (newY < axis.y1 || newY > axis.y2) return;
  }

  areaDatum.state.state = AREA_STATE.DRAGGING;

  const newValue = axis.cordOnAxisToValue(newX, newY);

  pointDatum.value = newValue;
  pointDatum.cords = axis.projectValueOnAxis(newValue);
  areaDatum.state.svgStringRep = areaDatum.state.points.reduce((acc, p) => {
    return acc + p.cords.x + ',' + p.cords.y + ' ';
  }, '');

  this.showCurrentValueForSeriesAndAxis(
    areaDatum.props.seriesId,
    pointDatum.axisId
  );

  this.reRenderArea(areaDatum);

  if (isFunction(areaProps.onValueChange)) {
    areaProps.onValueChange(Object.assign({}, pointDatum));
  }
}

function reRenderArea (areaDatum) {
  const areaRenderProps = Object.assign({}, this.state.renderConstructProps(), {
    eventHandlerFactory: this
  });
  const areaRenderer = new Area(areaRenderProps);

  areaRenderer.removeAreaForSeries(areaDatum.props.seriesId);
  areaRenderer.render(this.state.areaRenderProps(), [areaDatum]);
}

function reRenderAllAreas () {
  const areaDatums = this.state.getAreaDatums();
  areaDatums.forEach(datum => this.reRenderArea(datum));
}

/**
 * @param eventType {String}
 * @param seriesId {String}
 * @param context {Object}
 */
const createAreaEventHandler = function _createHandler (
  eventType,
  seriesId
) {
  const self = this;
  return function (d) {
    const area = self.state.areaForAreaId(seriesId);
    const areaProps = self.state.areaProps();
    const currentState = area.state.state;

    switch (eventType) {
      case AREA_EVENT.CIRCLE_ENTER:
        if (
          currentState !== AREA_STATE.DRAGGING &&
          currentState !== AREA_STATE.CIRCLE_LEAVE_WHILE_DRAGGING
        ) {
          area.state.state = AREA_STATE.CIRCLE_HOVER;
          self.showAxisTickLabels(d.axisId);

          d3.select(this).style('fill-opacity', areaProps.hoverCircleOpacity);

          self.highlightArea(area, areaProps);

          d3.select(d.circleRef)
            .transition(100)
            .attr(
              'r',
              areaProps.circleProps.defaultRadius *
                areaProps.circleProps.circleOverlayRadiusMult
            );

          self.showCurrentValueForSeriesAndAxis(area.props.seriesId, d.axisId);
        }
        break;
      case AREA_EVENT.CIRCLE_LEAVE:
        if (
          currentState === AREA_STATE.CIRCLE_HOVER ||
          currentState === AREA_STATE.DRAGGING_END
        ) {
          d3.select(this).style('fill-opacity', areaProps.defaultCircleOpacity);

          self.highlightAreaRemove(area, areaProps);
          self.hideAxisTickLabels(d.axisId);

          d3.select(d.circleRef)
            .transition(100)
            .attr('r', areaProps.circleProps.defaultRadius);

          self.hideAllAxisValues(area.props.seriesId);

          area.state.state = AREA_STATE.NEUTRAL;
        } else if (self.state === AREA_STATE.DRAGGING) {
          self.state = AREA_STATE.CIRCLE_LEAVE_WHILE_DRAGGING;
        }
        break;
      case AREA_EVENT.DRAGGING_START:
        self.showAxisTickLabels(d.axisId);
        if (browserVendor.isFirefox) {
          const ctm = this.getCTM();
          const svgEl = self.selectors.drawingContext().nodes()[0].parentNode;
          let transformationMatrix = svgEl.createSVGMatrix();

          transformationMatrix.e = svgEl.parentNode.getBoundingClientRect().x;
          transformationMatrix.f = svgEl.parentNode.getBoundingClientRect().y;
          transformationMatrix = transformationMatrix.multiply(ctm);
          area.state.draggingParams = {};
          area.state.draggingParams.tFMatrix = transformationMatrix.inverse();
          area.state.draggingParams.svgEl = svgEl;
        }
        break;
      case AREA_EVENT.DRAGGING:
        if (currentState === AREA_STATE.DRAGGING_END) {
          d3.select(this).style('fill-opacity', areaProps.hoverCircleOpacity);
          self.highlightArea(area, areaProps);
          d3.select(d.circlRef)
            .transition(100)
            .attr(
              'r',
              areaProps.circleProps.defaultRadius *
                areaProps.circleProps.circleOverlayRadiusMult
            );
        }

        d.dragActive = true;
        area.state.dragActive = true;
        self.draggingActions(area, d, this, areaProps);
        break;
      case AREA_EVENT.DRAGGING_END:
        area.state.dragActive = false;

        d3.select(this).style('fill-opacity', areaProps.defaultCircleOpacity);
        area.state.state = AREA_STATE.DRAGGING_END;

        self.highlightAreaRemove(area, areaProps);

        d.dragActive = false;

        const { clientX, clientY } = d3.event.sourceEvent;
        const currentPoint = self.state.stateQuery.areaPoint(
          d.seriesId,
          d.axisId
        );
        const {
          x: circleX,
          y: circleY,
          width: circleWidth,
          height: circleHeight
        } = currentPoint.circleRef.getBoundingClientRect();
        if (
          circleX > clientX + circleWidth ||
          circleX < clientX - circleWidth ||
          circleY < clientY - circleHeight ||
          circleY > clientY + circleHeight
        ) {
          self.hideVertexLabelForArea(area, areaProps);
          self.hideAllAxisValues(area.props.seriesId);
          self.selectors
            .selectAllCircles()
            .transition(500)
            .attr('r', areaProps.circleProps.defaultRadius);
          self.hideAxisTickLabels(d.axisId);
        }

        if (isFunction(areaProps.onValueFinishChange)) {
          areaProps.onValueFinishChange(area.props.seriesId);
        }
        break;
      case AREA_EVENT.CIRCLE_WHEEL_SCROLL:
        d3.event.stopPropagation();

        const axisDatum = d;

        const currentValue = self.state.stateQuery.currentValueFor(
          area.props.seriesId,
          axisDatum.axisId
        );

        let newValue;
        if (d3.event.deltaY <= 0) {
          newValue = currentValue + axisDatum.range * 0.01;
        } else {
          newValue = currentValue - axisDatum.range * 0.01;
        }

        if (newValue >= axisDatum.maxValue) {
          newValue = axisDatum.maxValue;
        }

        if (newValue <= axisDatum.minValue) {
          newValue = axisDatum.minValue;
        }

        const _currentPoint = self.state.stateQuery.areaPoint(
          area.props.seriesId,
          axisDatum.axisId
        );
        _currentPoint.value = newValue;
        _currentPoint.cords = axisDatum.projectValueOnAxis(newValue);
        area.state.svgStringRep = area.state.points.reduce((acc, p) => {
          return acc + p.cords.x + ',' + p.cords.y + ' ';
        }, '');

        self.showCurrentValueForSeriesAndAxis(
          area.props.seriesId,
          axisDatum.axisId
        );

        self.reRenderArea(area);

        if (isFunction(areaProps.onValueChange)) {
          areaProps.onValueChange(Object.assign({}, _currentPoint));
        }
        break;
      default:
        break;
    }
  };
};

export {
  createAreaEventHandler,
  draggingActions,
  showVertexLabelsForArea,
  hideVertexLabelForArea,
  highlightArea,
  highlightAreaRemove,
  reRenderArea,
  reRenderAllAreas
};
