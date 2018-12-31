const renderInitProps = function () {
  const {
    width,
    height,
    paddingH,
    paddingW,
    legendW,
    legendDims
  } = this.calculatedDims;

  return {
    width,
    height,
    paddingH,
    paddingW,
    legendW,
    legendDims,
    legendOpts: this.__STATE__.opts.legend,
    backgroundColor: this.__STATE__.opts
  };
};

const areaRenderProps = function () {
  return {
    areaHighlightProps: this.__STATE__.opts.area.areaHighlightProps,
    circleProps: this.__STATE__.opts.area.circleProps,
    hoverCircleOpacity: this.__STATE__.opts.area.hoverCircleOpacity,
    defaultCircleOpacity: this.__STATE__.opts.area.defaultCircleOpacity,
    lineProps: this.__STATE__.opts.area.lineProps,
    labelProps: this.__STATE__.opts.area.labelProps
  };
};

const axisRenderProps = function () {
  return {
    width: this.calculatedDims.width,
    levels: this.__STATE__.opts.levels,
    ticksAttr: this.__STATE__.opts.axis.ticks,
    lineProps: this.__STATE__.opts.axis.lineProps,
    axisLabelProps: this.__STATE__.opts.axis.axisLabelProps,
    rotateTextWithAxis: this.__STATE__.opts.axis.rotateTextWithAxis,
    wheelLabelAreaId: this.__STATE__.opts.axis.wheelLabelAreaId
  };
};

const renderConstructProps = function () {
  return {
    chartRootName: this.__STATE__.opts.chartRootName,
    stateSetters: this.stateSetters,
    stateQuery: this.stateQuery,
    selectors: this.selectors,
    rootElementId: this.__STATE__.opts.rootElementId,
    rootElement: this.__STATE__.opts.rootElement,
    rootElPropsFn: this.rootEls,
    legendRenderProps: this.renderProps.legendRenderProps,
    areaRenderProps: this.renderProps.areaRenderProps
  };
};

const legendRenderProps = function () {
  return {
    height: this.calculatedDims.height,
    width: this.calculatedDims.width,
    legendW: this.calculatedDims.legendW,
    legendOpts: this.__STATE__.opts.legend,
    legendDims: this.legendDims,
    getAreaDatums: this.getAreaDatums.bind(this)
  };
};

const rootEls = function () {
  return this.__STATE__.components.root;
};

export {
  areaRenderProps,
  axisRenderProps,
  renderInitProps,
  renderConstructProps,
  legendRenderProps,
  rootEls
};
