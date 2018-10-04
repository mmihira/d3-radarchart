import State from './state/state.js';
import Renderer from './renderer/index.js';
import EventHandlerFactory from './eventHandlers/handlerFactory.js';

class RadarChart {
  constructor (options) {
    this.__construct(options);
  }

  __construct (options) {
    this.state = new State(options);
    this.eventHandlerFactory = new EventHandlerFactory(this.state);
    this.renderEngine = new Renderer(
      Object.assign(
        {},
        this.state.renderConstructProps(),
        {eventHandlerFactory: this.eventHandlerFactory})
    );
  }

  render () {
    this.renderEngine.init(this.state.renderInitProps());
    this.renderEngine
      .renderAxis(this.state.axisRenderProps(), this.state.getAxisDatums())
      .renderArea(this.state.areaRenderProps(), this.state.getAreaDatums())
      .renderLegend();
  }

  /**
   * Rerender the chart with new options
   * @param options {Object}
   */
  reRenderWithNewOptions (options) {
    this.delete();
    this.__construct(options);
    this.render();
  }

  /**
   * Completely remove the current chart
   */
  delete () {
    const seriesIds = this.state.getAreaDatums().map(e => e.props.seriesId);
    this.renderEngine.areaRender.removeArea(seriesIds);
    this.renderEngine.legendRender.removeLegend(seriesIds);

    const axisIds = this.state.getAxisDatums().map(e => e.axisId);
    this.renderEngine.axisRender.removeAxis(axisIds);

    this.state.selectors.selectRootSvg().remove();
  }

  /**
   * Show axis value label values for a given series
   */
  showAxisLabelValues (seriesId) {
    this.eventHandlerFactory.showCurrentValuesForSeries(seriesId);
  }

  /**
   * Hide all axis label values
   */
  hideAxisLabelValues () {
    this.eventHandlerFactory.hideAllAxisValues();
  }
};

export default RadarChart;
