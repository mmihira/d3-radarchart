import * as d3 from '../../d3Wrapper/index';

const polygonDefaultName = function () {
  return `${this.chartRootName}-polygon`;
};

const polygonClassForSeriesName = function (seriesId) {
  return `${this.chartRootName}chart-poly-${seriesId}`;
};

const polygonClassName = function (seriesId) {
  return `${this.polygonClassForSeriesName(
    seriesId
  )} ${this.polygonDefaultName()}`;
};

const polygonVertexClassForSeries = function (seriesId) {
  return `${this.chartRootName}poly-vertex${seriesId}`;
};

const polygonVertexDefault = function () {
  return `${this.chartRootName}poly-vertex`;
};

const polygonVertextClassNames = function (seriesId) {
  return `${this.polygonVertexDefault()} ${this.polygonVertexClassForSeries(
    seriesId
  )}`;
};

const circleClassDefaultName = function () {
  return `${this.chartRootName}circle-class`;
};

const circleClassForSeriesName = function (seriesId) {
  return `${this.chartRootName}poly-circle-${seriesId}`;
};

const circleClassName = function (seriesId) {
  return `${this.circleClassDefaultName()} ${this.circleClassForSeriesName(
    seriesId
  )}`;
};

const circleOverlayDefaultName = function () {
  return `${this.chartRootName}circle-overlay`;
};

const circleOverlayForSeriesName = function (seriesId) {
  return `${this.chartRootName}circle-overlay-${seriesId}`;
};

const circleOverlayClassName = function (seriesId) {
  return `${this.circleOverlayDefaultName()} ${this.circleOverlayForSeriesName(
    seriesId
  )}`;
};

const selectAllPolygons = function () {
  return this.drawingContext().selectAll('.' + this.polygonDefaultName());
};

const selectAllCircles = function () {
  return this.drawingContext().selectAll('.' + this.circleClassDefaultName());
};

const selectAllCirclesForSeries = function (seriesId) {
  return this.drawingContext().selectAll(
    '.' + this.circleClassForSeriesName(seriesId)
  );
};

const selectAllCircleOverlaysForSeries = function (seriesId) {
  return this.drawingContext().selectAll(
    '.' + this.circleOverlayForSeriesName(seriesId)
  );
};

const selectAllCircleOverlays = function () {
  return this.drawingContext().selectAll('.' + this.circleOverlayDefaultName());
};

const selectPolygonForSeries = function (seriesId) {
  return this.drawingContext().select(
    '.' + this.polygonClassForSeriesName(seriesId)
  );
};

const selectPolyVertexLabelForSeries = function (seriesId) {
  return this.drawingContext().selectAll(
    '.' + this.polygonVertexClassForSeries(seriesId)
  );
};

const rootIdent = function () {
  const id = `radarchartroot${this.chartRootName}`;
  return {
    aStr: id,
    fSel: '.' + id
  };
};

const labelValueForAxis = function (axisId) {
  return d3.select(this.axisById(axisId).labelValue);
};

const drawingContext = function () {
  return this.__STATE__.components.root.rootSvg.select(this.rootIdent().fSel);
};

const legendSvgId = function () {
  return `${this.chartRootName}-legend-svg`;
};

const legendGId = function () {
  return `${this.chartRootName}-legend-g`;
};

const selectLegendSvg = function () {
  return this.__STATE__.components.root.rootSvg.select(
    '.' + this.legendSvgId()
  );
};

const selectLegendG = function () {
  return this.__STATE__.components.root.rootSvg.select('.' + this.legendGId());
};

const legendRectDefaultName = function () {
  return `${this.chartRootName}-legend-rect`;
};

const legendRectNameForSeries = function (seriesId) {
  return `${seriesId}-legend-rect`;
};

const legendRectClassName = function (seriesId) {
  return `${this.legendRectDefaultName()} ${this.legendRectNameForSeries(
    seriesId
  )}`;
};

const legendRectOverlayDefault = function () {
  return `${this.chartRootName}-legend-rect-overlay`;
};

const legendRectOverlaySeries = function (seriesId) {
  return `legend-rect-overlay-${seriesId}`;
};

const legendRectOverlayClassName = function (seriesId) {
  return `${this.legendRectOverlayDefault()} ${this.legendRectOverlaySeries(
    seriesId
  )}`;
};

const selectLegendOverlaysForSeries = function (seriesId) {
  return this.__STATE__.components.root.rootSvg.select(
    '.' + this.legendRectOverlaySeries(seriesId)
  );
};

const axisTextOverlayClassName = function (axisId) {
  return `${this.chartRootName}-axis-text-overlay-${axisId}`;
};

const selectAxisTextForAxis = function (axisId) {
  return this.__STATE__.components.root.rootSvg.select(
    '.' + this.axisTextOverlayClassName(axisId)
  );
};

const selectRootSvg = function _selectRootSvg () {
  return this.__STATE__.components.root.rootSvg;
};

const selectRootG = function _selectRootG () {
  return this.__STATE__.components.root.rootG;
};

const selectAxisTicksForAxis = function _selectAxisTicksForAxis (axisId) {
  const axis = this.axisById(axisId);
  return d3.selectAll(axis.percLabels);
};

export {
  polygonClassName,
  polygonClassForSeriesName,
  polygonDefaultName,
  polygonVertextClassNames,
  polygonVertexDefault,
  polygonVertexClassForSeries,
  labelValueForAxis,
  selectPolyVertexLabelForSeries,
  circleOverlayClassName,
  circleOverlayForSeriesName,
  circleOverlayDefaultName,
  circleClassName,
  circleClassForSeriesName,
  circleClassDefaultName,
  rootIdent,
  drawingContext,
  selectAllPolygons,
  selectPolygonForSeries,
  selectAllCircles,
  selectAllCirclesForSeries,
  selectAllCircleOverlaysForSeries,
  selectAllCircleOverlays,
  selectRootSvg,
  selectLegendSvg,
  selectLegendG,
  legendRectDefaultName,
  legendRectNameForSeries,
  legendRectClassName,
  legendSvgId,
  legendGId,
  legendRectOverlayDefault,
  legendRectOverlaySeries,
  legendRectOverlayClassName,
  selectLegendOverlaysForSeries,
  axisTextOverlayClassName,
  selectAxisTextForAxis,
  selectAxisTicksForAxis,
  selectRootG
};
