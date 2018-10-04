const isDragActiveForArea = function _isDragActiveForArea (areaId) {
  const area = this.__STATE__.components.areas[areaId];
  return area.state.dragActive;
};

const axisIds = function _axisIds () {
  return this.getAxisDatums().map(e => e.axisId);
};

const areaForAreaId = function _areaForAreaId (areaId) {
  return this.__STATE__.components.areas[areaId];
};

const areaProps = function _areaProps () {
  return this.__STATE__.opts.area;
};

const legendProps = function _legendProps () {
  return this.__STATE__.opts.legend;
};

const zoomProps = function _zoomProps () {
  return this.__STATE__.opts.zoomProps;
};

const areaPoint = function _areaPoint (seriesId, axisId) {
  return this.__STATE__.components.areas[seriesId].state.points.find(p => p.axisId === axisId);
};

const currentValueFor = function _currentValueFor (seriesId, axisId) {
  return this.__STATE__.components.areas[seriesId].state.points.find(p => p.axisId === axisId).value;
};

const wheelLabelAreaId = function _wheelLabelAreaId () {
  return this.__STATE__.opts.axis.wheelLabelAreaId;
};

const onWheelAxisFn = function _onWheelAxisFn () {
  return this.__STATE__.opts.axis.onWheelAxis;
};

const onAxisLabelOutFn = function _onAxisLabelOutFn () {
  return this.__STATE__.opts.axis.onAxisLabelOut;
};

const onAxisLabelOverFn = function _onAxisLabelOverFn () {
  return this.__STATE__.opts.axis.onAxisLabelOverFn;
};

const zoomEnabled = function _zoomEnabled () {
  return this.__STATE__.opts.enableZoom;
};

const shouldRenderLegend = function _shouldRenderLegend () {
  return this.__STATE__.opts.showLegend;
};

export {
  axisIds,
  areaPoint,
  areaForAreaId,
  areaProps,
  currentValueFor,
  isDragActiveForArea,
  onWheelAxisFn,
  onAxisLabelOutFn,
  onAxisLabelOverFn,
  shouldRenderLegend,
  legendProps,
  wheelLabelAreaId,
  zoomEnabled,
  zoomProps
};
