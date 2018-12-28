import { browserVendor } from '../const.js';
import { event } from 'd3';

function zoomHandler (zoom) {
  const self = this;
  return function () {
    const { paddingW, paddingH } = self.state.calculatedDims;

    const zoomProps = self.state.stateQuery.zoomProps();
    // d3 zoom on firefox zooms gradient is too much so constraint and
    // reset every time on zoom.
    const k = event.transform.k;
    if (browserVendor.isFirefox) {
      const minZoom =
        k > zoomProps.scaleExtent.minZoom
          ? k * 0.1
          : zoomProps.scaleExtent.minZoom;
      const maxZoom =
        k < zoomProps.scaleExtent.maxZoom
          ? k * 1.1
          : zoomProps.scaleExtent.maxZoom;
      zoom.scaleExtent([minZoom, maxZoom]);
    }

    self.state.selectors.drawingContext().attr('transform', event.transform);
    self.state.stateSetters.updateSizesOnZoomForAllAreas(k);
    self.state.stateQuery.axisIds().forEach(axisId => {
      self.onZoomForAxis(k, axisId);
    });

    self.reRenderAllAreas();

    if (event.transform.k === 1) {
      self.state.selectors
        .selectRootG()
        .attr('transform', 'translate(' + paddingW + ',' + paddingH + ')');
    }
  };
}

export { zoomHandler };
