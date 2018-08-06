(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3'), require('lodash')) :
typeof define === 'function' && define.amd ? define(['d3', 'lodash'], factory) :
(global.RadarChart = factory(global.d3,global.lodash));
}(this, (function (d3,_$1) { 'use strict';

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
      var x2 = width / 2 * (1 - opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo));
      var y2 = height / 2 * (1 - opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo));

      if (x2 < x1 && y2 <= y1) {
        this.quad = QUAD_1;
      } else if (x2 >= x2 && y2 <= y1) {
        this.quad = QUAD_2;
      } else if (x2 <= x2 && y2 >= y1) {
        this.quad = QUAD_3;
      } else if (x2 >= x2 && y2 >= y1) {
        this.quad = QUAD_4;
      }

      var label_x = width / 2 * (1 - opts.factorLegend * Math.sin(axisIndex * RADIANS / maxAxisNo)) - 60 * Math.sin(axisIndex * RADIANS / maxAxisNo);
      var label_y = height / 2 * (1 - Math.cos(axisIndex * RADIANS / maxAxisNo)) - 20 * Math.cos(axisIndex * RADIANS / maxAxisNo);

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

      this.axis = axisOptions.axisId, this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;

      this.label_x = label_x;
      this.label_y = label_y;

      var projectValueOnAxisXMultTerm = opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo);
      var projectValueOnAxisYMultTerm = opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo);

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
        return acc + p.cords.x + "," + p.cords.y + " ";
      }, "")
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
        return acc + p.cords.x + "," + p.cords.y + " ";
      }, "");

      this.area.remove();
      this.renderArea();
    }
  }, {
    key: 'createOnMouseOverCircle',
    value: function createOnMouseOverCircle() {
      var self = this;

      return function (d) {
        var thisPolygon = "polygon." + d3.select(this).attr("class");
        d3.select(this).style('fill-opacity', self.opts.hoverCircleOpacity);
        self.drawingContext.selectAll("polygon").transition(200).style("fill-opacity", self.opts.hiddenAreaOpacity);
        self.drawingContext.selectAll(thisPolygon).transition(200).style("fill-opacity", self.opts.highlightedAreaOpacity);

        d3.select(d.circleRef).transition(100).attr('r', self.circleRadius * self.opts.circleOverlayRadiusMult);
      };
    }
  }, {
    key: 'createMouseOutCirlce',
    value: function createMouseOutCirlce() {
      var self = this;
      return function (d) {
        d3.select(this).style('fill-opacity', self.opts.defaultCircleOpacity);
        self.drawingContext.selectAll("polygon").transition(200).style("fill-opacity", self.opts.defaultAreaOpacity);

        d3.select(d.circleRef).transition(100).attr('r', self.circleRadius);
      };
    }
  }, {
    key: 'createOnDragEndCircle',
    value: function createOnDragEndCircle() {
      var self = this;
      return function (d) {
        var axis = self.axisMap[d.datum.axis];
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

        d3.select(d.circleRef).attr("cx", newX).attr("cy", newY);

        d3.select(d.overlayRef).attr("cx", newX).attr("cy", newY);

        self.updatePositions();
      };
    }
  }, {
    key: 'createOnMouseOverPolygon',
    value: function createOnMouseOverPolygon() {
      var self = this;

      return function (el) {
        var thisPoly = "polygon." + d3.select(this).attr("class");
        self.drawingContext.selectAll("polygon").transition(200).style("fill-opacity", self.opts.hiddenAreaOpacity);

        self.drawingContext.selectAll(thisPoly).transition(200).style("fill-opacity", self.opts.highlightedAreaOpacity);
      };
    }
  }, {
    key: 'createOnMouseOutPolygon',
    value: function createOnMouseOutPolygon() {
      var self = this;
      return function (el) {
        d3.select(this).transition(200).style("fill-opacity", self.opts.defaultAreaOpacity);
      };
    }
  }, {
    key: 'renderArea',
    value: function renderArea() {
      var _this2 = this;

      this.area = this.drawingContext.selectAll(".area").data([this.polygonWrapper]).enter().append("polygon").attr("class", "radar-chart-serie" + this.seriesIdent).style("stroke-width", "2px").style("stroke", function () {
        if (_this2.opts.useColorScale) {
          return _this2.opts.lineColorScale(_this2.seriesIndex);
        }
      }).attr("points", function (d) {
        return d.svgStringRep;
      }).attr('z-index', -1).style("fill", function () {
        if (_this2.opts.useColorScale) {
          return _this2.opts.areaColorScale(_this2.seriesIndex);
        }
      }).style("fill-opacity", this.opts.defaultAreaOpacity).on('mouseover', this.createOnMouseOverPolygon()).on('mouseout', this.createOnMouseOutPolygon());
    }
  }, {
    key: 'renderCircles',
    value: function renderCircles() {
      var _this3 = this;

      this.circles = this.drawingContext.selectAll(".nodes").data(this.points).enter().append("svg:circle").attr("class", "radar-chart-series" + this.seriesIdent).attr('r', this.circleRadius).attr("alt", function (j) {
        return Math.max(j.value, 0);
      }).attr("cx", function (d) {
        return d.cords.x;
      }).attr("cy", function (d) {
        return d.cords.y;
      }).style("fill", function () {
        if (_this3.opts.useColorScale) {
          return _this3.opts.lineColorScale(_this3.seriesIndex);
        }
      }).style("fill-opacity", this.opts.defaultCircleOpacity).each(function (d) {
        d.circleRef = this;
      });

      this.circleOverylays = this.drawingContext.selectAll('.nodes-overlay').data(this.points).enter().append("svg:circle").call(d3.drag().subject(function (d) {
        return this;
      }).on('drag', this.createOnDraggingCircle()).on('end', this.createOnDragEndCircle())).attr('r', this.circleRadius * this.opts.circleOverlayRadiusMult).attr("cx", function (d) {
        return d.cords.x;
      }).attr("cy", function (d) {
        return d.cords.y;
      }).attr('opacity', 0.0).on('mouseover', this.createOnMouseOverCircle()).on('mouseout', this.createMouseOutCirlce()).each(function (d) {
        d.overlayRef = this;
      });

      this.circles.append("svg:title").text(function (d) {
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

var RadarChart = function () {
  /**
   * @param args {Object}
   */
  function RadarChart(args) {
    var _this = this;

    classCallCheck(this, RadarChart);

    this.rootElement = d3.select(args.rootElement);
    this.opts = _$1.omit(args, ['rootElement']);
    this.opts = _$1.cloneDeep(this.opts);

    this.opts.axis.maxAxisNo = this.opts.axis.config.length;
    this.opts.levels.levelRadius = this.opts.factor * Math.min(this.opts.dims.width / 2, this.opts.dims.height / 2);

    this.data = this.opts.data;
    this.axisConfig = this.opts.axis.config;

    // Calculate the maximum value for the chart only used if
    // opts.axis.useGlobalMax is true
    var maxFromData = d3.max(this.data, function (dataSet) {
      return d3.max(dataSet.map(function (o) {
        return o.value;
      }));
    });
    this.opts.maxValue = Math.max(this.opts.maxValue, maxFromData);

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
      this.renderLegend();
    }
  }, {
    key: 'renderAxis',
    value: function renderAxis() {
      var opts = this.opts;
      var maxAxisNo = this.opts.axis.maxAxisNo;
      var _opts$dims = this.opts.dims,
          width = _opts$dims.width,
          height = _opts$dims.height,
          extraWidthX = _opts$dims.extraWidthX,
          extraWidthY = _opts$dims.extraWidthY,
          translateX = _opts$dims.translateX,
          translateY = _opts$dims.translateY;


      this.rootSvg = this.rootElement.append("svg").attr("width", width + extraWidthX).attr("height", height + extraWidthY);

      this.drawingContext = this.rootSvg.append("g").attr("transform", "translate(" + translateX + "," + translateY + ")");

      // Circular segments
      for (var lvlInx = 0; lvlInx < opts.levels.levelsNo - 1; lvlInx++) {
        var levelFactor = opts.factor * opts.levels.levelRadius * ((lvlInx + 1) / opts.levels.levelsNo);

        this.drawingContext.selectAll(".levels").data(this.axisParameters).enter().append("svg:line").attr("x1", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.sin(i * RADIANS / maxAxisNo));
        }).attr("y1", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.cos(i * RADIANS / maxAxisNo));
        }).attr("x2", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.sin((i + 1) * RADIANS / maxAxisNo));
        }).attr("y2", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.cos((i + 1) * RADIANS / maxAxisNo));
        }).attr("class", "line").style("stroke", "grey").style("stroke-opacity", "0.75").style("stroke-width", "0.3px").attr("transform", "translate(" + (width / 2 - levelFactor) + ", " + (height / 2 - levelFactor) + ")");
      }

      var Format = d3.format('.2%');
      // Text indicating at what % each level is
      for (var lvlInx = 0; lvlInx < opts.levels.levelsNo; lvlInx++) {
        var levelFactor = opts.factor * opts.levels.levelRadius * ((lvlInx + 1) / opts.levels.levelsNo);

        var z = this.drawingContext.selectAll(".levels").data(this.axisParameters).enter().append("svg:text").attr("x", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.sin(i * RADIANS / maxAxisNo));
        }).attr("y", function (d, i) {
          return levelFactor * (1 - opts.factor * Math.cos(i * RADIANS / maxAxisNo));
        }).attr("class", "legend").style("font-family", "sans-serif").style("font-size", "10px").style("opacity", 0.0).attr("transform", "translate(" + (width / 2 - levelFactor + opts.ToRight) + ", " + (height / 2 - levelFactor) + ")").attr("fill", "#737373").text(function (d) {
          return Format((lvlInx + 1) * d.maxValue / opts.levels.levelsNo);
        }).each(function (d) {
          d.axisTickTextElements.push(this);
        });
      }

      this.axisG = this.drawingContext.selectAll(".axis").data(this.axisParameters).enter().append("g");

      this.axisLines = this.axisG.attr("class", "axis").append("line").attr("x1", function (d) {
        return d.x1;
      }).attr("y1", function (d) {
        return d.y1;
      }).attr("x2", function (d) {
        return d.x2;
      }).attr("y2", function (d) {
        return d.y2;
      }).attr("class", "line").attr('pointer-events', 'none').style("stroke", "grey").style("stroke-width", "1px");

      this.rects = this.axisG.append('rect').attr('class', 'overlay').attr("x", function (d) {
        return d.x1;
      }).attr("y", function (d) {
        return d.y1;
      }).attr("transform", function (d, i) {
        return "rotate(" + d.angleFromNorth + "," + d.x1 + "," + d.y1 + ")";
      }).attr('width', function (d) {
        return d.axisLength;
      }).attr('height', 10).attr('fill-opacity', 0.0).on('mouseover', function (d) {
        return d.onRectMouseOver();
      }).on('mouseout', function (d) {
        return d.onRectMouseOut();
      }).each(function (datum) {
        datum.axisRect = this;
      });

      this.axisText = this.axisG.append("text").attr("class", "legend").text(function (d) {
        return d.label;
      }).style("font-family", "sans-serif").style("font-size", "11px").attr("text-anchor", "middle").attr("dy", "1.5em").attr("transform", function () {
        return "translate(0, -10)";
      }).attr("x", function (d) {
        return d.label_x;
      }).attr("y", function (d) {
        return d.label_y;
      }).attr('pointer-events', 'none');
    }
  }, {
    key: 'renderArea',
    value: function renderArea() {
      var _this2 = this;
      this.areas = this.data.map(function (series, inx) {
        return new Area({
          axisMap: _this2.axisMap,
          series: series,
          drawingContext: _this2.drawingContext,
          seriesIdent: inx,
          seriesIndex: inx,
          areaOptions: _this2.opts.area
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
          extraWidthX = _opts$dims2.extraWidthX,
          extraWidthY = _opts$dims2.extraWidthY,
          translateX = _opts$dims2.translateX,
          translateY = _opts$dims2.translateY;
      var _opts$dims3 = this.opts.dims,
          legendWidth = _opts$dims3.width,
          legendHeight = _opts$dims3.height,
          marginTop = _opts$dims3.marginTop;
      var opts = this.opts;


      var LegendOptions = ['Smartphone', 'Tablet'];
      var colorscale = d3.scaleOrdinal(d3.schemeAccent);

      var svg = this.rootSvg.append('svg').attr("width", width + extraWidthX).attr("height", height);

      // MAKE THESE CONFIGURABLE !!

      //Create the title for the legend
      var text = svg.append("text").attr("class", "title").attr('transform', 'translate(90,0)').attr("x", width - 70).attr("y", 10).attr("font-size", "12px").attr("fill", "#404040").text("What % of owners use a specific service in a week");

      //Initiate Legend
      var legend = svg.append("g").attr("class", "legend").attr("height", legendHeight).attr("width", legendWidth).attr('transform', 'translate(90,20)');

      //Create colour squares
      legend.selectAll('rect').data(LegendOptions).enter().append("rect").attr("x", width - 65).attr("y", function (d, i) {
        return i * 20;
      }).attr("width", 10).attr("height", 10).style("fill", function (d, i) {
        return colorscale(i);
      });

      //Create text next to squares
      legend.selectAll('text').data(LegendOptions).enter().append("text").attr("x", width - 52).attr("y", function (d, i) {
        return i * 20 + 9;
      }).attr("font-size", "11px").attr("fill", "#737373").text(function (d) {
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
