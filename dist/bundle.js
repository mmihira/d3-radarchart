(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3'), require('lodash')) :
typeof define === 'function' && define.amd ? define(['d3', 'lodash'], factory) :
(global.RadarChart = factory(global.d3,global._));
}(this, (function (d3,_) { 'use strict';

var RADIANS = 2 * Math.PI;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var QUAD_1 = 'QUAD_1';
var QUAD_2 = 'QUAD_2';
var QUAD_3 = 'QUAD_3';
var QUAD_4 = 'QUAD_4';

var Axis = function () {
  function Axis(opts, axisOptions, axisIndex) {
    classCallCheck(this, Axis);

    this.opts = opts;
    this.axisIndex = axisIndex;
    this.axisOptions = axisOptions;

    this.dragActive = false;
    this.axisTickTextElements = [];
    this.calculateAxisParameters();
  }

  createClass(Axis, [{
    key: 'calculateAxisParameters',
    value: function calculateAxisParameters() {
      var opts = this.opts,
          axisIndex = this.axisIndex,
          axisOptions = this.axisOptions;
      var _opts$dims = this.opts.dims,
          width = _opts$dims.width,
          height = _opts$dims.height;
      var maxAxisNo = this.opts.axis.maxAxisNo;


      var x1 = width / 2;
      var y1 = height / 2;
      var x2 = width / 2 * (1 - Math.sin(axisIndex * RADIANS / maxAxisNo));
      var y2 = height / 2 * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo));

      if (x2 < x1 && y2 <= y1) {
        this.quad = QUAD_1;
      } else if (x2 >= x1 && y2 <= y1) {
        this.quad = QUAD_2;
      } else if (x2 <= x1 && y2 >= y1) {
        this.quad = QUAD_3;
      } else if (x2 >= x1 && y2 >= y1) {
        this.quad = QUAD_4;
      }

      var labelX = width / 2 * (1 - opts.legend.factor * Math.sin(axisIndex * RADIANS / maxAxisNo)) - 60 * Math.sin(axisIndex * RADIANS / maxAxisNo);
      var labelY = height / 2 * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo)) - 20 * Math.cos(axisIndex * RADIANS / maxAxisNo);

      // Note the gradients are inversed because of the SVG co-ordinate system.
      var gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
      var b = gradient === Infinity ? 0 : y2 - gradient * x2;
      this.gradient = gradient;

      var projectCordToAxis = function projectCordToAxis(x, y) {
        if (gradient === Infinity) {
          return { x: x1, y: y };
        } else {
          if (gradient < -2 || gradient >= 0 || gradient < 0.145) {
            return { x: x, y: gradient * x + b };
          } else {
            return { x: (y - b) / gradient, y: y };
          }
        }
      };

      this.maxValue = opts.axis.useGlobalMax ? opts.axis.maxValue : axisOptions.axisValueMax;
      this.axisLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      this.angleFromNorth = 180 / Math.PI * (1 - axisIndex * RADIANS / maxAxisNo) - 180 / Math.PI - 90 - 180 / Math.PI * 10 / this.axisLength / 2;

      this.axis = axisOptions.axisId;
      this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;

      this.labelX = labelX;
      this.labelY = labelY;

      var projectValueOnAxisXMultTerm = Math.sin(axisIndex * RADIANS / maxAxisNo);
      var projectValueOnAxisYMultTerm = Math.cos(axisIndex * RADIANS / maxAxisNo);

      this.projectCordToAxis = projectCordToAxis;
      this.projectValueOnAxis = function (value) {
        return {
          x: width / 2 * (1 - parseFloat(Math.max(value, 0)) / this.maxValue * projectValueOnAxisXMultTerm),
          y: height / 2 * (1 - parseFloat(Math.max(value, 0)) / this.maxValue * projectValueOnAxisYMultTerm)
        };
      };

      this.cordOnAxisToValue = function (x, y) {
        if (this.gradient === Infinity) {
          var len = Math.abs(this.y2 - y);
          return (this.axisLength - len) * this.maxValue / this.axisLength;
        } else if (this.gradient >= 0 && this.gradient < 0.00000001) {
          var _len = Math.abs(this.x2 - x);
          return (this.axisLength - _len) * this.maxValue / this.axisLength;
        } else {
          return (2 * x / width - 1) * (this.maxValue / projectValueOnAxisXMultTerm) * -1;
        }
      };
    }
  }, {
    key: 'onRectMouseOver',
    value: function onRectMouseOver() {
      if (this.dragActive) return false;
      this.axisTickTextElements.forEach(function (d) {
        d3.select(d).style('opacity', 0.9);
      });
    }
  }, {
    key: 'onRectMouseOut',
    value: function onRectMouseOut() {
      if (this.dragActive) return false;
      this.axisTickTextElements.forEach(function (d) {
        d3.select(d).transition(200).style('opacity', 0.0);
      });
    }
  }]);
  return Axis;
}();

/**
 * The area represents the radar chat area for a particular series.
 * It includes the polygon and circles on the apex.
 */

var Area = function () {
  /**
   * @param axisMap {Object} A map of axisId to axis Objects
   * @param series {Array} Number of areas
   * @param drawingContext {Object} A svg g-element for drawing on
   * @param seriesIdent {String} The identity of the series must be unique
   * @param areaOptions {Object} Options for this area
   */
  function Area(args) {
    var _this = this;

    classCallCheck(this, Area);

    this.axisMap = args.axisMap;
    this.data = _.cloneDeep(args.series);
    this.drawingContext = args.drawingContext;
    this.color = d3.scaleOrdinal(d3.schemeAccent);
    this.seriesIdent = args.seriesIdent;
    this.seriesIndex = args.seriesIndex;
    this.opts = _.cloneDeep(args.areaOptions);
    this.opts.colorScale = args.areaOptions.colorScale;
    this.circleRadius = 5;

    // For each axisId calculate the apex points for this area
    this.points = this.data.map(function (spoke) {
      return {
        cords: _this.axisMap[spoke.axis].projectValueOnAxis(spoke.value),
        datum: _.cloneDeep(spoke)
      };
    });

    this.polygonWrapper = {
      points: this.points,
      svgStringRep: this.points.reduce(function (acc, p) {
        return acc + p.cords.x + ',' + p.cords.y + ' ';
      }, '')
    };
  }

  /**
   * Render the nodes and the area
   */


  createClass(Area, [{
    key: 'render',
    value: function render() {
      this.renderArea();
      this.renderCircles();
    }
  }, {
    key: 'updatePositions',
    value: function updatePositions() {
      this.polygonWrapper.svgStringRep = this.points.reduce(function (acc, p) {
        return acc + p.cords.x + ',' + p.cords.y + ' ';
      }, '');

      this.area.remove();
      this.renderArea();
    }
  }, {
    key: 'createOnMouseOverCircle',
    value: function createOnMouseOverCircle() {
      var self = this;

      return function (d) {
        var thisPolygon = 'polygon.' + d3.select(this).attr('class');
        d3.select(this).style('fill-opacity', self.opts.hoverCircleOpacity);
        self.drawingContext.selectAll('polygon').transition(200).style('fill-opacity', self.opts.hiddenAreaOpacity);
        self.drawingContext.selectAll(thisPolygon).transition(200).style('fill-opacity', self.opts.highlightedAreaOpacity);

        d3.select(d.circleRef).transition(100).attr('r', self.circleRadius * self.opts.circleOverlayRadiusMult);
      };
    }
  }, {
    key: 'createMouseOutCirlce',
    value: function createMouseOutCirlce() {
      var self = this;
      return function (d) {
        d3.select(this).style('fill-opacity', self.opts.defaultCircleOpacity);
        self.drawingContext.selectAll('polygon').transition(200).style('fill-opacity', self.opts.defaultAreaOpacity);

        d3.select(d.circleRef).transition(100).attr('r', self.circleRadius);
      };
    }
  }, {
    key: 'createOnDragEndCircle',
    value: function createOnDragEndCircle() {
      var self = this;
      return function (d) {
        self.axisMap[d.datum.axis].dragActive = false;
        self.axisMap[d.datum.axis].onRectMouseOut();
      };
    }
  }, {
    key: 'createOnDraggingCircle',
    value: function createOnDraggingCircle() {
      var self = this;
      return function (d) {
        var axis = self.axisMap[d.datum.axis];
        self.axisMap[d.datum.axis].onRectMouseOver();
        self.axisMap[d.datum.axis].dragActive = true;

        var _d3$event = d3.event,
            mouseX = _d3$event.x,
            mouseY = _d3$event.y;


        var newX = axis.projectCordToAxis(mouseX, mouseY).x;
        var newY = axis.projectCordToAxis(mouseX, mouseY).y;

        if (axis.quad === QUAD_1 || axis.quad === QUAD_2) {
          if (newY < axis.y2 || newY > axis.y1) return;
        } else {
          if (newY < axis.y1 || newY > axis.y2) return;
        }

        var newValue = axis.cordOnAxisToValue(newX, newY);

        d.datum.value = newValue;
        d.cords = self.axisMap[d.datum.axis].projectValueOnAxis(newValue);

        d3.select(d.circleRef).attr('cx', newX).attr('cy', newY);

        d3.select(d.overlayRef).attr('cx', newX).attr('cy', newY);

        self.updatePositions();
      };
    }
  }, {
    key: 'createOnMouseOverPolygon',
    value: function createOnMouseOverPolygon() {
      var self = this;

      return function (el) {
        var thisPoly = 'polygon.' + d3.select(this).attr('class');
        self.drawingContext.selectAll('polygon').transition(200).style('fill-opacity', self.opts.hiddenAreaOpacity);

        self.drawingContext.selectAll(thisPoly).transition(200).style('fill-opacity', self.opts.highlightedAreaOpacity);
      };
    }
  }, {
    key: 'createOnMouseOutPolygon',
    value: function createOnMouseOutPolygon() {
      var self = this;
      return function (el) {
        d3.select(this).transition(200).style('fill-opacity', self.opts.defaultAreaOpacity);
      };
    }
  }, {
    key: 'renderArea',
    value: function renderArea() {
      var _this2 = this;

      this.area = this.drawingContext.selectAll('.area').data([this.polygonWrapper]).enter().append('polygon').attr('class', 'radar-chart-serie' + this.seriesIdent).style('stroke-width', '2px').style('stroke', function () {
        if (_this2.opts.useColorScale) {
          return _this2.opts.lineColorScale(_this2.seriesIndex);
        }
      }).attr('points', function (d) {
        return d.svgStringRep;
      }).attr('z-index', -1).style('fill', function () {
        if (_this2.opts.useColorScale) {
          return _this2.opts.areaColorScale(_this2.seriesIndex);
        }
      }).style('fill-opacity', this.opts.defaultAreaOpacity).on('mouseover', this.createOnMouseOverPolygon()).on('mouseout', this.createOnMouseOutPolygon());
    }
  }, {
    key: 'renderCircles',
    value: function renderCircles() {
      var _this3 = this;

      this.circles = this.drawingContext.selectAll('.nodes').data(this.points).enter().append('svg:circle').attr('class', 'radar-chart-series' + this.seriesIdent).attr('r', this.circleRadius).attr('alt', function (j) {
        return Math.max(j.value, 0);
      }).attr('cx', function (d) {
        return d.cords.x;
      }).attr('cy', function (d) {
        return d.cords.y;
      }).style('fill', function () {
        if (_this3.opts.useColorScale) {
          return _this3.opts.lineColorScale(_this3.seriesIndex);
        }
      }).style('fill-opacity', this.opts.defaultCircleOpacity).each(function (d) {
        d.circleRef = this;
      });

      this.circleOverylays = this.drawingContext.selectAll('.nodes-overlay').data(this.points).enter().append('svg:circle').call(d3.drag().subject(function (d) {
        return this;
      }).on('drag', this.createOnDraggingCircle()).on('end', this.createOnDragEndCircle())).attr('r', this.circleRadius * this.opts.circleOverlayRadiusMult).attr('cx', function (d) {
        return d.cords.x;
      }).attr('cy', function (d) {
        return d.cords.y;
      }).attr('opacity', 0.0).on('mouseover', this.createOnMouseOverCircle()).on('mouseout', this.createMouseOutCirlce()).each(function (d) {
        d.overlayRef = this;
      });

      this.circles.append('svg:title').text(function (d) {
        return d.datum.value;
      });
    }

    /**
     * Remove this area. Also handles removing any event handlers.
     */

  }, {
    key: 'remove',
    value: function remove() {
      this.area.on('mouseover', null).on('mouseout', null);

      this.circles.each(function (d) {
        d3.select(d.circleRef).on('mouseover', null).on('mouseout', null).remove();
      });

      this.circleOverylays.each(function (d) {
        d3.select(d.circleRef).on('mouseover', null).on('mouseout', null).remove();
      });

      this.area.remove();
    }
  }]);
  return Area;
}();

/**
 * Based of
 *  - https://github.com/alangrafu/radar-chart-d3
 *  - http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
 */

/**
 * Default options
 */
var DEFAULTS_OPTS = {
  data: [],
  dims: {
    width: 500,
    height: 500,
    extraWidthP: 0.6,
    extraHeightP: 0.25,
    translateXp: 0.1,
    translateYp: 0.05
  },
  showLegend: true,
  legend: {
    height: 100,
    width: 200,
    factor: 0.85,
    translateX: -75,
    translateY: 10,
    textTranslateX: -52,
    textSpacing: 20,
    textYOffset: 9,
    colorScale: d3.scaleOrdinal(d3.schemeAccent),
    iconHeight: 10,
    iconWidth: 10,
    iconSpacing: 20,
    title: 'Test title',
    titleProperties: {
      'font-size': '12px',
      'fill': '#404040'
    },
    labelTextProperties: {
      'font-size': '11px',
      'fill': '#737373'
    }
  },
  levels: {
    levelsNo: 2,
    noTicks: 3,
    levelsColor: null,
    ticks: {
      fill: '#737373',
      'font-size': '10px',
      'font-family': 'sans-serif'
    }
  },
  point: {
    radius: 5
  },
  axis: {
    config: [],
    colorScale: null,
    useGlobalMax: false,
    maxValue: 0.6
  },
  area: {
    defaultAreaOpacity: 0.4,
    highlightedAreaOpacity: 0.7,
    hiddenAreaOpacity: 0.1,
    defaultCircleOpacity: 0.3,
    hoverCircleOpacity: 1.0,
    circleOverlayRadiusMult: 1.2,
    useColorScale: true,
    areaColorScale: d3.scaleOrdinal(d3.schemeAccent),
    lineColorScale: d3.scaleOrdinal(d3.schemeAccent)
  },
  rootElement: null
};

var RadarChart = function () {
  /**
   * @param args {Object}
   */
  function RadarChart(opts) {
    var _this = this;

    classCallCheck(this, RadarChart);

    this.rootElement = d3.select(opts.rootElement);
    this.opts = _.merge(DEFAULTS_OPTS, opts);

    this.opts.axis.maxAxisNo = this.opts.axis.config.length;

    this.opts.dims.extraWidth = this.opts.dims.width * (1 + this.opts.dims.extraWidthP);
    this.opts.dims.extraHeight = this.opts.dims.height * (1 + this.opts.dims.extraHeightP);

    this.opts.dims.translateX = (this.opts.dims.width + this.opts.dims.extraWidth) * this.opts.dims.translateXp;
    this.opts.dims.translateY = (this.opts.dims.height + this.opts.dims.extraHeight) * this.opts.dims.translateYp;

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    this.axisParameters = this.axisConfig.map(function (axis, inx) {
      return new Axis(_this.opts, axis, inx);
    });
    this.axisMap = this.axisParameters.reduce(function (map, ix) {
      map[ix.axis] = ix;
      return map;
    }, {});

    // To store the area components
    this.areas = [];
  }

  createClass(RadarChart, [{
    key: 'render',
    value: function render() {
      this.renderAxis();
      this.renderArea();
      if (this.opts.showLegend) {
        this.renderLegend();
      }
    }
  }, {
    key: 'renderAxis',
    value: function renderAxis() {
      var _this2 = this;

      var opts = this.opts;
      var _opts$dims = this.opts.dims,
          width = _opts$dims.width,
          height = _opts$dims.height,
          extraWidth = _opts$dims.extraWidth,
          extraHeight = _opts$dims.extraHeight,
          translateX = _opts$dims.translateX,
          translateY = _opts$dims.translateY;


      this.rootSvg = this.rootElement.append('svg').attr('width', width + extraWidth).attr('height', height + extraHeight);

      this.drawingContext = this.rootSvg.append('g').attr('transform', 'translate(' + translateX + ',' + translateY + ')');

      // Circular segments

      var _loop = function _loop(lvlInx) {
        var tickNos = opts.levels.levelsNo;

        _this2.drawingContext.selectAll('.levels').data(_this2.axisParameters).enter().append('svg:line').attr('x1', function (d, i) {
          var tickValue = d.maxValue / tickNos * (lvlInx + 1);
          var cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        }).attr('y1', function (d, i) {
          var tickValue = d.maxValue / tickNos * (lvlInx + 1);
          var cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        }).attr('x2', function (d, i) {
          var nxtInx = i + 1 === _this2.axisParameters.length ? 0 : i + 1;
          var nAxis = _this2.axisParameters[nxtInx];
          var nValue = nAxis.maxValue / tickNos * (lvlInx + 1);
          var nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.x;
        }).attr('y2', function (d, i) {
          var nxtInx = i + 1 === _this2.axisParameters.length ? 0 : i + 1;
          var nAxis = _this2.axisParameters[nxtInx];
          var nValue = nAxis.maxValue / tickNos * (lvlInx + 1);
          var nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.y;
        }).attr('class', 'line').style('stroke', 'grey').style('stroke-opacity', '0.75').style('stroke-width', '0.3px');
      };

      for (var lvlInx = 0; lvlInx < opts.levels.levelsNo - 1; lvlInx++) {
        _loop(lvlInx);
      }

      var Format = d3.format('.2%');

      var ticksAttr = opts.levels.ticks;

      // Text indicating at what % each level is

      var _loop2 = function _loop2(lvlInx) {
        var tickNos = opts.levels.levelsNo;

        _this2.drawingContext.selectAll('.levels').data(_this2.axisParameters).enter().append('svg:text').attr('x', function (d) {
          var tickValue = d.maxValue / tickNos * (lvlInx + 1);
          var cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        }).attr('y', function (d) {
          var tickValue = d.maxValue / tickNos * (lvlInx + 1);
          var cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        }).attr('class', 'legend').style('font-family', ticksAttr['font-family']).style('font-size', ticksAttr['font-size']).style('opacity', 0.0).attr('fill', ticksAttr['fill']).text(function (d) {
          return Format(d.maxValue / tickNos * (lvlInx + 1) / d.maxValue);
        }).each(function (d) {
          d.axisTickTextElements.push(this);
        });
      };

      for (var lvlInx = 0; lvlInx < opts.levels.levelsNo; lvlInx++) {
        _loop2(lvlInx);
      }

      this.axisG = this.drawingContext.selectAll('.axis').data(this.axisParameters).enter().append('g');

      this.axisLines = this.axisG.attr('class', 'axis').append('line').attr('x1', function (d) {
        return d.x1;
      }).attr('y1', function (d) {
        return d.y1;
      }).attr('x2', function (d) {
        return d.x2;
      }).attr('y2', function (d) {
        return d.y2;
      }).attr('class', 'line').attr('pointer-events', 'none').style('stroke', 'grey').style('stroke-width', '1px');

      this.rects = this.axisG.append('rect').attr('class', 'overlay').attr('x', function (d) {
        return d.x1;
      }).attr('y', function (d) {
        return d.y1;
      }).attr('transform', function (d, i) {
        return 'rotate(' + d.angleFromNorth + ',' + d.x1 + ',' + d.y1 + ')';
      }).attr('width', function (d) {
        return d.axisLength;
      }).attr('height', 10).attr('fill-opacity', 0.0).on('mouseover', function (d) {
        return d.onRectMouseOver();
      }).on('mouseout', function (d) {
        return d.onRectMouseOut();
      }).each(function (datum) {
        datum.axisRect = this;
      });

      this.axisText = this.axisG.append('text').attr('class', 'legend').text(function (d) {
        return d.label;
      }).style('font-family', 'sans-serif').style('font-size', '11px').attr('text-anchor', 'middle').attr('dy', '1.5em').attr('transform', function () {
        return 'translate(0, -10)';
      }).attr('x', function (d) {
        return d.labelX;
      }).attr('y', function (d) {
        return d.labelY;
      }).attr('pointer-events', 'none');
    }
  }, {
    key: 'renderArea',
    value: function renderArea() {
      var _this3 = this;

      this.areas = this.data.map(function (series, inx) {
        return new Area({
          axisMap: _this3.axisMap,
          series: series,
          drawingContext: _this3.drawingContext,
          seriesIdent: inx,
          seriesIndex: inx,
          areaOptions: _this3.opts.area
        });
      });
      this.areas.forEach(function (area) {
        return area.render();
      });
    }
  }, {
    key: 'renderLegend',
    value: function renderLegend() {
      var _opts$dims2 = this.opts.dims,
          width = _opts$dims2.width,
          height = _opts$dims2.height,
          extraWidth = _opts$dims2.extraWidth;

      var legendOpts = this.opts.legend;

      var LegendOptions = ['Smartphone', 'Tablet'];

      var svg = this.rootSvg.append('svg').attr('width', width + extraWidth).attr('height', height);

      // Create the title for the legend
      svg.append('text').attr('class', 'title').attr('transform', 'translate(90,0)').attr('x', width + legendOpts.translateX).attr('y', legendOpts.translateY).text(legendOpts.title).attr('font-size', legendOpts.titleProperties['font-size']).attr('fill', legendOpts.titleProperties['fill']);

      // Initiate Legend
      var legend = svg.append('g').attr('class', 'legend').attr('height', legendOpts.height).attr('width', legendOpts.width).attr('transform', 'translate(90,20)');

      // Create colour squares
      legend.selectAll('rect').data(LegendOptions).enter().append('rect').attr('x', width + legendOpts.translateX).attr('y', function (d, i) {
        return i * legendOpts.iconSpacing;
      }).attr('width', legendOpts.iconWidth).attr('height', legendOpts.iconHeight).style('fill', function (d, i) {
        return legendOpts.colorScale(i);
      });

      // Create text next to squares
      legend.selectAll('text').data(LegendOptions).enter().append('text').attr('x', width + legendOpts.textTranslateX).attr('y', function (d, i) {
        return i * legendOpts.textSpacing + legendOpts.textYOffset;
      }).attr('font-size', legendOpts.labelTextProperties['font-size']).attr('fill', legendOpts.labelTextProperties['fill']).text(function (d) {
        return d;
      });
    }

    /**
     * Remove the chart
     */

  }, {
    key: 'remove',
    value: function remove() {
      this.areas.forEach(function (area) {
        return area.remove();
      });
    }
  }]);
  return RadarChart;
}();

return RadarChart;

})));
