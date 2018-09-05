import * as d3 from 'd3';
/**
 * Represents the axis, labels and circles
 */

import {RADIANS} from './const.js';
const QUAD_1 = 'QUAD_1';
const QUAD_2 = 'QUAD_2';
const QUAD_3 = 'QUAD_3';
const QUAD_4 = 'QUAD_4';

class Axis {
  /**
   * @param opts {Object}
   * @param axisOptions {Object}
   * @param axisIndex {String or Int}
   *
   */
  constructor (opts, axisOptions, axisIndex) {
    this.opts = opts;
    this.axisIndex = axisIndex;
    this.axisOptions = axisOptions;

    this.dragActive = false;
    this.axisTickTextElements = [];
    this.calculateAxisParameters();

    if (!opts.axis.tickScale) {
      this.tickScale = d3.scaleLinear()
        .domain([100, 1200])
        .range([5, 20]);
    } else {
      this.tickScale = opts.axis.tickScale;
    }

    if (!opts.axis.axisTitleScale) {
      this.axisTitleScale = d3.scaleLinear()
        .domain([100, 1200])
        .range([5, 18]);
    } else {
      this.axisTitleScale = opts.axis.tickScale;
    }

    const {width} = this.opts.dims;

    this.scaledTickSize = this.tickScale(width);
    this.scaledTitleSize = this.axisTitleScale(width);
    this.currentTickSize = this.tickScale(width);

    this.textLineSpacingPx = d3.scaleLinear()
      .domain([100, 1200])
      .range([1, 20]);

    this.setupZoomInterpolators();
  }

  onZoom (k) {
    this.currentTickSize = this.tickFontLop(k);
    this.axisTickTextElements.forEach(e => {
      d3.select(e).style('font-size', this.currentTickSize + 'px');
    });

    let newLabelY, newLabelX, titleSize, labelLineS;
    if (k > 2) {
      newLabelX = this.projectValueOnAxis(this.minValue + this.range * this.axisLabelFactorLop(k)).x;
      newLabelY = this.projectValueOnAxis(this.minValue + this.range * this.axisLabelFactorLop(k)).y;
      titleSize = this.axisTitleSizeLopMin(k) + 'px';
      labelLineS = this.labelLineSpaceLopMin(k);
    } else {
      newLabelX = this.axisLabelCords().x;
      newLabelY = this.axisLabelCords().y;
      titleSize = this.axisTitleSizeLop(k) + 'px';
      labelLineS = this.labelLineSpacingLop(k);
    }

    d3.selectAll(this.labelLines)
      .attr('x', newLabelX)
      .attr('y', newLabelY)
      .attr('dy', (d, i) => labelLineS * i)
      .style('font-size', titleSize);

    d3.select(this.axisLabelEl)
      .attr('transform', () => {
        return 'rotate(' + this.axisLabelRotation() + ',' + newLabelX + ',' + newLabelY + ')';
      });
  }

  calculateAxisParameters () {
    const {opts, axisIndex, axisOptions} = this;
    const {
      innerW,
      innerH,
      optsLeftChartOffset,
      optsTopChartOffset
    } = this.opts.dims;
    const {maxAxisNo} = this.opts.axis;

    const x1 = optsLeftChartOffset + innerW / 2;
    const y1 = optsTopChartOffset + innerH / 2;
    const x2 = optsLeftChartOffset + ((innerW / 2) * (1 - Math.sin(axisIndex * RADIANS / maxAxisNo)));
    const y2 = optsTopChartOffset + ((innerH / 2) * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo)));

    if (x2 < x1 && y2 <= y1) {
      this.quad = QUAD_1;
    } else if (x2 >= x1 && y2 <= y1) {
      this.quad = QUAD_2;
    } else if (x2 <= x1 && y2 >= y1) {
      this.quad = QUAD_3;
    } else if (x2 >= x1 && y2 >= y1) {
      this.quad = QUAD_4;
    }

    const labelX = x2;
    const labelY = y2;

    // Note the gradients are inversed because of the SVG co-ordinate system.
    const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
    const b = gradient === Infinity ? 0 : y2 - gradient * x2;
    this.gradient = gradient;

    const projectCordToAxis = function (x, y) {
      if (gradient === Infinity) {
        return {x: x1, y: y};
      } else {
        if (gradient < -2 || (gradient >= 0 || gradient < 0.145)) {
          return {x: x, y: gradient * x + b};
        } else {
          return {x: (y - b) / gradient, y: y};
        }
      }
    };

    this.maxValue = opts.axis.useGlobalMax ? opts.axis.maxValue : axisOptions.axisValueMax;
    this.minValue = opts.axis.useGlobalMax || isNaN(axisOptions.axisValueMin) ? 0 : axisOptions.axisValueMin;
    this.range = this.maxValue - this.minValue;
    this.axisLength = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    this.angleFromNorth = (180 / Math.PI) * (1 - axisIndex * RADIANS / maxAxisNo) - (180 / Math.PI) - 90 - (180 / Math.PI * 10 / this.axisLength / 2);

    this.axis = axisOptions.axisId;
    this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

    this.labelLines = [];
    this.words = this.label.split(' ');
    this.lines = [this.words[0]];
    this.lines = this.words.slice(1).reduce((acc, word) => {
      if ((acc[acc.length - 1].length + word.length) <= this.opts.axis.textOverflowWidthLimit) {
        acc[acc.length - 1] = acc[acc.length - 1] + ' ' + word;
      } else {
        acc.push(word);
      }
      return acc;
    }, this.lines);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.labelX = labelX;
    this.labelY = labelY;

    const projectValueOnAxisXMultTerm = Math.sin(axisIndex * RADIANS / maxAxisNo);
    const projectValueOnAxisYMultTerm = Math.cos(axisIndex * RADIANS / maxAxisNo);

    this.projectCordToAxis = projectCordToAxis;
    this.projectValueOnAxis = function (value) {
      return {
        x: optsLeftChartOffset + (innerW / 2) * (1 - ((parseFloat(value) - this.minValue) / this.range) * projectValueOnAxisXMultTerm),
        y: optsTopChartOffset + (innerH / 2) * (1 - ((parseFloat(value) - this.minValue) / this.range) * projectValueOnAxisYMultTerm)
      };
    };

    this.cordOnAxisToValue = function (x, y) {
      if (this.gradient === Infinity) {
        let len = Math.abs(this.y2 - y);
        return this.minValue + (this.axisLength - len) * this.range / this.axisLength;
      } else if (this.gradient >= 0 && this.gradient < 0.00000001) {
        let len = Math.abs(this.x2 - x);
        return this.minValue + (this.axisLength - len) * this.range / this.axisLength;
      } else {
        return this.minValue + (2 * (x - optsLeftChartOffset) / innerW - 1) * (this.range / projectValueOnAxisXMultTerm) * -1;
      }
    };
  }

  onRectMouseOver () {
    if (this.dragActive) return false;
    this.axisTickTextElements.forEach(d => {
      d3.select(d)
        .style('opacity', 0.9);
    });
  }

  onRectMouseOut () {
    if (this.dragActive) return false;
    this.axisTickTextElements.forEach(d => {
      d3.select(d)
        .transition(200)
        .style('opacity', 0.0);
    });
  }

  axisLabelRotation () {
    if (this.angleFromNorth > -270.0) {
      return this.angleFromNorth - 180;
    } else {
      return this.angleFromNorth;
    }
  }

  axisLabelCords (zoomK) {
    if (!zoomK) {
      return this.projectValueOnAxis(
        this.axisLabelCordLop(this.opts.zoomProps.scaleExtent.minZoom)
      );
    } else {
      return this.projectValueOnAxis(this.axisLabelCordLop(zoomK));
    }
  }

  setupZoomInterpolators () {
    const { maxZoom, minZoom } = this.opts.zoomProps.scaleExtent;
    const {width} = this.opts.dims;

    this.axisTitleSizeLop = d3.scaleLog()
      .base(5)
      .domain([minZoom, maxZoom])
      .range([this.scaledTitleSize, this.scaledTitleSize * 0.1]);

    this.axisTitleSizeLopMin = d3.scaleLog()
      .base(5)
      .domain([minZoom, maxZoom])
      .range([5, 2]);

    this.tickFontLop = d3.scaleLog()
      .domain([minZoom, maxZoom])
      .range([this.scaledTickSize, this.opts.axis.ticks.maxZoomFont]);

    this.axisLabelCordLop = d3.scaleLog()
      .base(20)
      .domain([minZoom, maxZoom])
      .range([this.maxValue, this.minValue]);

    this.axisLabelFactorLop = d3.scaleLog()
      .domain([minZoom, maxZoom])
      .range([0.2, 0.1]);

    this.labelLineSpacingLop = d3.scaleLinear()
      .domain([minZoom, maxZoom])
      .range([this.textLineSpacingPx(width), this.textLineSpacingPx(width) * 0.1]);

    this.labelLineSpaceLopMin = d3.scaleLinear()
      .domain([minZoom, maxZoom])
      .range([this.textLineSpacingPx(width) * 0.5, this.textLineSpacingPx(width) * 0.3 * 0.5]);
  }
}

export {
  Axis as default,
  QUAD_1,
  QUAD_2,
  QUAD_3,
  QUAD_4
};
