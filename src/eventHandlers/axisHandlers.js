import * as d3 from 'd3';

function showCurrentValuesForSeries (seriesId) {
  const valuesForSeries = this.state
    .areaForAreaId(seriesId)
    .state.points.reduce((acc, point) => {
      acc[point.axisId] = point.value;
      return acc;
    }, {});

  const Format = d3.format('.3');
  Object.keys(valuesForSeries).forEach(axisId => {
    this.selectors
      .labelValueForAxis(axisId)
      .text(Format(valuesForSeries[axisId]));
  });
}

function hideAllAxisValues () {
  this.state.getAxisDatums().forEach(axis => {
    this.selectors.labelValueForAxis(axis.axisId).text('');
  });
}

function showCurrentValueForSeriesAndAxis (seriesId, axisId) {
  const Format = d3.format('.3');
  const valuesForSeries = this.state
    .areaForAreaId(seriesId)
    .state.points.reduce((acc, point) => {
      acc[point.axisId] = point.value;
      return acc;
    }, {});

  this.selectors
    .labelValueForAxis(axisId)
    .text(Format(valuesForSeries[axisId]));
}

function showAxisTickLabels (axisId) {
  const axis = this.state.axisById(axisId);
  d3.selectAll(axis.percLabels)
    .transition(200)
    .style('opacity', 0.9);
}

function hideAxisTickLabels (axisId) {
  const axis = this.state.axisById(axisId);
  d3.selectAll(axis.percLabels)
    .transition(200)
    .style('opacity', 0.0);
}

function onAxisLabelOut () {
  const self = this;
  return function (d) {
    self.hideAllAxisValues();
    self.hideAxisTickLabels(d.axisId);

    const axis = self.state.axisById(d.axisId);
    const axisProps = self.state.axisProps;

    d3.select(axis.axisLine)
      .transition(200)
      .style('stroke-width', '0.8px')
      .style('stroke', axisProps.lineProps.fill);

    d3.selectAll(axis.labelLines).style('fill', axisProps.axisLabelProps.fill);

    if (self.state.stateQuery.onAxisLabelOutFn) {
      self.state.stateQuery.onAxisLabelOutFn(d.axisId);
    }
  };
}

function onAxisLabelOver () {
  const self = this;
  return function (d) {
    const wheelLabelAreaId = self.state.stateQuery.wheelLabelAreaId();
    if (wheelLabelAreaId) {
      self.showCurrentValueForSeriesAndAxis(wheelLabelAreaId, d.axisId);
    }

    if (self.state.stateQuery.onWheelAxisFn) {
      self.state.stateQuery.onWheelAxisFn();
    }

    self.showAxisTickLabels(d.axisId);
    const axis = self.state.axisById(d.axisId);
    const axisProps = self.state.axisProps;

    d3.select(axis.axisLine)
      .transition(200)
      .style('stroke-width', '0.8px')
      .style('stroke', axisProps.lineProps['hover-fill']);

    d3.selectAll(axis.labelLines).style(
      'fill',
      axisProps.axisLabelProps['hover-fill']
    );

    if (self.state.onAxisLabelOverFn()) {
      self.state.onAxisLabelOverFn(d.axisId);
    }
  };
}

/**
 * Called by the zoom handler when the user zoom
 * @param k {Float} Zoom amount
 */
function onZoomForAxis (k, axisId) {
  const axis = this.state.axisById(axisId);
  const currentTickSize = axis.props.tickFontLop(k);

  this.selectors
    .selectAxisTicksForAxis(axis.props.axisId)
    .style('font-size', currentTickSize + 'px');

  let newLabelY;
  let newLabelX;
  let titleSize;
  let labelLineS;
  if (k > 2) {
    newLabelX = axis.props.projectValueOnAxis(
      axis.props.minValue + axis.props.range * axis.props.axisLabelFactorLop(k)
    ).x;
    newLabelY = axis.props.projectValueOnAxis(
      axis.props.minValue + axis.props.range * axis.props.axisLabelFactorLop(k)
    ).y;
    titleSize = axis.props.axisTitleSizeLopMin(k) + 'px';
    labelLineS = axis.props.labelLineSpaceLopMin(k);

    d3.selectAll(axis.zoomedLabelLines)
      .attr('x', newLabelX)
      .attr('y', newLabelY)
      .attr('dy', (d, i) => labelLineS * i)
      .style('font-size', titleSize)
      .style('fill-opacity', 1.0);

    d3.select(axis.labelValue).style('fill-opacity', 0.0);

    d3.selectAll(axis.labelLines).style('fill-opacity', 0.0);
  } else {
    newLabelX = axis.props.axisLabelCords().x;
    newLabelY = axis.props.axisLabelCords().y;
    titleSize = axis.props.axisTitleSizeLop(k) + 'px';
    labelLineS = axis.props.labelLineSpacingLop(k);

    d3.selectAll(axis.zoomedLabelLines).style('fill-opacity', 0.0);

    d3.select(axis.labelValue)
      .style('fill-opacity', 1.0)
      .attr('dy', () => labelLineS * axis.labelLines.length)
      .style('font-size', titleSize);

    d3.selectAll(axis.labelLines)
      .attr('x', newLabelX)
      .attr('y', newLabelY)
      .attr('dy', (d, i) => labelLineS * i)
      .style('font-size', titleSize)
      .style('fill-opacity', 1.0);
  }

  d3.select(axis.axisLabelEl).attr('transform', () => {
    return (
      'rotate(' +
      axis.props.axisLabelRotation() +
      ',' +
      newLabelX +
      ',' +
      newLabelY +
      ')'
    );
  });
}

export {
  hideAxisTickLabels,
  hideAllAxisValues,
  onAxisLabelOver,
  onAxisLabelOut,
  showCurrentValuesForSeries,
  showAxisTickLabels,
  showCurrentValueForSeriesAndAxis,
  onZoomForAxis
};
