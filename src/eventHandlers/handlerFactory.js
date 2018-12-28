import * as areaHandlers from './areaHandlers.js';
import * as axisHandlers from './axisHandlers.js';
import * as legendHandlers from './legendHandlers.js';
import * as zoomHandlers from './zoomHandler.js';

class EventHandlerFactory {
  /**
   * @param state {Object} A state object which this factory interfaces with
   */
  constructor (state) {
    this.state = state;
    this.selectors = this.state.selectors;

    // Bind the mixins
    Object.keys(areaHandlers).forEach(key => {
      this[key] = this[key].bind(this);
    });
    Object.keys(axisHandlers).forEach(key => {
      this[key] = this[key].bind(this);
    });
    Object.keys(legendHandlers).forEach(key => {
      this[key] = this[key].bind(this);
    });
    Object.keys(zoomHandlers).forEach(key => {
      this[key] = this[key].bind(this);
    });
  }
}

Object.assign(EventHandlerFactory.prototype, areaHandlers);
Object.assign(EventHandlerFactory.prototype, axisHandlers);
Object.assign(EventHandlerFactory.prototype, legendHandlers);
Object.assign(EventHandlerFactory.prototype, zoomHandlers);

export default EventHandlerFactory;
