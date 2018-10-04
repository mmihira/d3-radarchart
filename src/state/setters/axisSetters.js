const setRootElements = function _setRootElements (elements) {
  this.__STATE__.components.root.rootSvg = elements.rootSvg;
  this.__STATE__.components.root.rootG = elements.rootG;
  this.__STATE__.components.root.legendSvg = elements.legendSvg;
  this.__STATE__.components.root.legendG = elements.legendG;
};

const setAxisPerecentLevelForAxis = function _setAxisPerecentLevelForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].percLabels.push(el);
};

const setAxisLineElForAxis = function _setAxisLineElForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].axisLine = el;
};

const setAxisOverlayRectForAxis = function setAxisOverlayRectForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].overLayRect = el;
};

const setAxisLabelParentForAxis = function _setAxisLabelParentForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].axisLabelEl = el;
};

const addLabelLineForAxis = function _addLabelLineForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].labelLines.push(el);
};

const setLabelValueForAxis = function _setAxisLabelParentForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].labelValue = el;
};

const addZoomedLabelLinesForAxis = function _addZoomedLabelLinesForAxis (axisId, el) {
  this.__STATE__.components.axis[axisId].zoomedLabelLines.push(el);
};

export {
  setRootElements,
  setAxisPerecentLevelForAxis,
  setAxisLineElForAxis,
  setAxisOverlayRectForAxis,
  setAxisLabelParentForAxis,
  setLabelValueForAxis,
  addLabelLineForAxis,
  addZoomedLabelLinesForAxis
};
