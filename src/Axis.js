/**
 * Represents the axis, labels and circles
 */

import {RADIANS} from './const.js';
const QUAD_1 = 'QUAD_1';
const QUAD_2 = 'QUAD_2';
const QUAD_3 = 'QUAD_3';
const QUAD_4 = 'QUAD_4';

class Axis {
  constructor(opts, axisOptions, axisIndex) {
    this.opts = opts;
    this.axisIndex = axisIndex;
    this.axisOptions = axisOptions;

    this.dragActive = false;
    this.axisTickTextElements = [];
    this.calculateAxisParameters();
  }

  calculateAxisParameters() {
    const {opts, axisIndex, axisOptions} = this;
    const {width, height} = this.opts.dims;
    const {maxAxisNo} = this.opts.axis;

    const x1 = width / 2;
    const y1 = height / 2;
    const x2 = width / 2 * (1 - opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo));
    const y2 = height / 2 * (1 - opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo));

    if (x2 < x1 && y2 <= y1) {
      this.quad = QUAD_1;
    } else if (x2 >= x2 && y2 <= y1) {
      this.quad = QUAD_2;
    } else if (x2 <= x2 && y2 >= y1) {
      this.quad = QUAD_3;
    } else if (x2 >= x2 && y2 >= y1) {
      this.quad = QUAD_4;
    }

    const label_x = (width / 2) * (1 - opts.factorLegend * Math.sin(axisIndex * RADIANS / maxAxisNo)) - 60 * Math.sin(axisIndex * RADIANS/maxAxisNo);
    const label_y = (height / 2) * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo)) - 20 * Math.cos(axisIndex * RADIANS / maxAxisNo);

    // Note the gradients are inversed because of the SVG co-ordinate system.
    const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
    const b = gradient === Infinity ? 0 : y2 - gradient * x2;
    this.gradient =  gradient;

    const projectCordToAxis = function(x, y) {
      if (gradient === Infinity) {
        return {x: x1, y: y};
      } else {
        if(gradient < -2 || (gradient >= 0 || gradient < 0.145)) {
          return {x: x, y: gradient * x + b};
        } else {
          return {x: (y-b)/gradient, y: y};
        }
      }
    };

    this.maxValue = opts.axis.useGlobalMax ? opts.axis.maxValue : axisOptions.axisValueMax;
    this.axisLength = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    this.angleFromNorth = (180 / Math.PI) * (1 - axisIndex * RADIANS / maxAxisNo) - (180 / Math.PI) - 90 - (180 / Math.PI * 10 / this.axisLength / 2);

    this.axis = axisOptions.axisId,
    this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.label_x = label_x;
    this.label_y = label_y;

    const projectValueOnAxisXMultTerm = opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo);
    const projectValueOnAxisYMultTerm = opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo);

    this.projectCordToAxis = projectCordToAxis;
    this.projectValueOnAxis = function(value) {
      return {
        x: width / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * projectValueOnAxisXMultTerm),
        y: height / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * projectValueOnAxisYMultTerm),
      };
    }

    this.cordOnAxisToValue = function (x, y) {
      if (this.gradient === Infinity) {
        let len = Math.abs(this.y2 - y);
        return (this.axisLength - len) * this.maxValue/ this.axisLength;
      } else if (this.gradient >= 0 && this.gradient < 0.00000001) {
        let len = Math.abs(this.x2 - x);
        return (this.axisLength - len) * this.maxValue/ this.axisLength;
      } else {
        return (2*x/width - 1) * (this.maxValue/projectValueOnAxisXMultTerm) * -1;
      }
    }
  }

  onRectMouseOver() {
    if (this.dragActive) return false;
    this.axisTickTextElements.forEach(d => {
      d3.select(d)
        .style('opacity', 0.9);
    });
  }

  onRectMouseOut() {
    if (this.dragActive) return false;
    this.axisTickTextElements.forEach(d => {
      d3.select(d)
        .transition(200)
        .style('opacity', 0.0);
    });
  }
}

export {
  Axis as default,
  QUAD_1,
  QUAD_2,
  QUAD_3,
  QUAD_4
}
