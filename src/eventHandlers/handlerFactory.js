import * as _ from 'lodash';
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
    _.each(areaHandlers, (val, key) => { this[key] = this[key].bind(this); });
    _.each(axisHandlers, (val, key) => { this[key] = this[key].bind(this); });
    _.each(legendHandlers, (val, key) => { this[key] = this[key].bind(this); });
    _.each(zoomHandlers, (val, key) => { this[key] = this[key].bind(this); });
  }
}

Object.assign(EventHandlerFactory.prototype, areaHandlers);
Object.assign(EventHandlerFactory.prototype, axisHandlers);
Object.assign(EventHandlerFactory.prototype, legendHandlers);
Object.assign(EventHandlerFactory.prototype, zoomHandlers);

export default EventHandlerFactory;
