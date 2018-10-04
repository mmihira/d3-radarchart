const setAreaCircleRef = function _setAreaCircleRef (seriesId, el) {
  this.__STATE__.components.areas[seriesId].circleRef.push(el);
};

const setAreaCircleOverlayRef = function _setAreaCircleOverlayRef (seriesId, el) {
  this.__STATE__.components.areas[seriesId].circleOverlayRef.push(el);
};

const setAreaPolygonRef = function _setAreaPolygonRef (seriesId, el) {
  this.__STATE__.components.areas[seriesId].polygonRef = el;
};

const setAreaLegendRect = function _setAreaLegendRect (seriesId, el) {
  this.__STATE__.components.areas[seriesId].legendRect = el;
};

const setAreaLegendLabelLines = function _setAreaLegendLabelLines (seriesId, el) {
  this.__STATE__.components.areas[seriesId].legendLabelLines.push(el);
};

const setAreaLegendRectOverlay = function _setAreaLegendRectOverlay (seriesId, el) {
  this.__STATE__.components.areas[seriesId].legendRectOverlay = el;
};

const updateSizesOnZoomForAllAreas = function _updateSizesOnZoomForAllAreas (k) {
  const seriesIds = this.getAreaDatums().map(e => e.props.seriesId);

  seriesIds.forEach((seriesId) => {
    const opts = this.__STATE__.opts.area;
    const area = this.areaForAreaId(seriesId);

    opts.lineProps.strokeWidth = area.props.areaLineLop(k);
    opts.circleProps.defaultRadius = area.props.circleRadiusLop(k);
    opts.labelProps.fontSize = area.props.fontLop(k);
  });
};

export {
  setAreaCircleRef,
  setAreaCircleOverlayRef,
  setAreaPolygonRef,
  setAreaLegendRect,
  setAreaLegendLabelLines,
  setAreaLegendRectOverlay,
  updateSizesOnZoomForAllAreas
};
