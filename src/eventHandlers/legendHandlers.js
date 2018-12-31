import * as d3 from '../d3Wrapper/index';

function onLegendOver () {
  const self = this;
  return function (d) {
    const area = self.state.seriesById(d.props.seriesId);

    d3.select(area.legendRect).attr('opacity', 1.0);

    area.legendLabelLines
      .map(e => d3.select(e))
      .forEach(e => {
        e.attr('fill', area.props.fillColor);
        e.attr('font-weight', 'bold');
      });

    const areaProps = self.state.areaProps();
    self.highlightArea(area, areaProps);
    self.showCurrentValuesForSeries(area.props.seriesId);
  };
}

function onLegendOut () {
  const self = this;
  return function (d) {
    const area = self.state.seriesById(d.props.seriesId);

    area.legendLabelLines
      .map(e => d3.select(e))
      .forEach(e => {
        e.attr('fill', area.props.fillColor);
        e.attr('font-weight', 'bold');
      });

    d3.select(area.legendRect).attr('opacity', 0.7);

    const areaProps = self.state.areaProps();
    self.highlightAreaRemove(area, areaProps);
    self.hideAllAxisValues();

    const legendProps = self.state.legendProps();

    area.legendLabelLines
      .map(e => d3.select(e))
      .forEach(e => {
        e.attr('fill', legendProps.labelTextProperties.fill);
        e.attr('font-weight', 'normal');
      });
  };
}

export { onLegendOver, onLegendOut };
