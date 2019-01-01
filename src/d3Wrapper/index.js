// d3 transitions is causing some issues when manually bundling d3 packages.
// Go with global import for now
// import selectAll from 'd3-selection/src/selectAll';
// import { event } from 'd3-selection/src/selection/on';
// import { drag } from 'd3-drag';
// import { format} from 'd3-format';
// import { zoom } from 'd3-zoom';
// import { scaleLog, scaleLinear, scaleOrdinal } from 'd3-scale';
// import { schemeAccent } from 'd3-scale-chromatic';
// import { transition } from 'd3-transition';
import * as d3 from 'd3';

export {
  d3
};
