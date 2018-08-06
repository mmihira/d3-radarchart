(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('d3')) :
typeof define === 'function' && define.amd ? define(['d3'], factory) :
(global.RadarChart = factory(global.d3));
}(this, (function (d3) { 'use strict';

d3 = d3 && d3.hasOwnProperty('default') ? d3['default'] : d3;

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

/**
 * Represents the axis, labels and circles
 */

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
      var _RadarChart = RadarChart,
          RADIANS = _RadarChart.RADIANS;


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

var RadarChart$1 = function () {
  /**
   * @param args {Object}
   */
  function RadarChart(args) {
    var _this = this;

    classCallCheck(this, RadarChart);

    this.rootElement = d3.select(args.rootElement);
    this.opts = _.omit(args, ['rootElement']);
    this.opts = _.cloneDeep(this.opts);

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
      var RADIANS = RadarChart.RADIANS;


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

RadarChart$1.RADIANS = 2 * Math.PI;

return RadarChart$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvQXhpcy5qcyIsIi4uL3NyYy9BcmVhLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkMyBmcm9tICdkMyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgYXhpcywgbGFiZWxzIGFuZCBjaXJjbGVzXG4gKi9cblxuY29uc3QgUVVBRF8xID0gJ1FVQURfMSc7XG5jb25zdCBRVUFEXzIgPSAnUVVBRF8yJztcbmNvbnN0IFFVQURfMyA9ICdRVUFEXzMnO1xuY29uc3QgUVVBRF80ID0gJ1FVQURfNCc7XG5cbmNsYXNzIEF4aXMge1xuICBjb25zdHJ1Y3RvcihvcHRzLCBheGlzT3B0aW9ucywgYXhpc0luZGV4KSB7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLmF4aXNJbmRleCA9IGF4aXNJbmRleDtcbiAgICB0aGlzLmF4aXNPcHRpb25zID0gYXhpc09wdGlvbnM7XG5cbiAgICB0aGlzLmRyYWdBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmF4aXNUaWNrVGV4dEVsZW1lbnRzID0gW107XG4gICAgdGhpcy5jYWxjdWxhdGVBeGlzUGFyYW1ldGVycygpO1xuICB9XG5cbiAgY2FsY3VsYXRlQXhpc1BhcmFtZXRlcnMoKSB7XG4gICAgY29uc3Qge29wdHMsIGF4aXNJbmRleCwgYXhpc09wdGlvbnN9ID0gdGhpcztcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLm9wdHMuZGltcztcbiAgICBjb25zdCB7bWF4QXhpc05vfSA9IHRoaXMub3B0cy5heGlzO1xuICAgIGNvbnN0IHtSQURJQU5TfSA9IFJhZGFyQ2hhcnQ7XG5cbiAgICBjb25zdCB4MSA9IHdpZHRoIC8gMjtcbiAgICBjb25zdCB5MSA9IGhlaWdodCAvIDI7XG4gICAgY29uc3QgeDIgPSB3aWR0aCAvIDIgKiAoMSAtIG9wdHMuZmFjdG9yICogTWF0aC5zaW4oYXhpc0luZGV4ICogUkFESUFOUyAvIG1heEF4aXNObykpO1xuICAgIGNvbnN0IHkyID0gaGVpZ2h0IC8gMiAqICgxIC0gb3B0cy5mYWN0b3IgKiBNYXRoLmNvcyhheGlzSW5kZXggKiBSQURJQU5TIC8gbWF4QXhpc05vKSk7XG5cbiAgICBpZiAoeDIgPCB4MSAmJiB5MiA8PSB5MSkge1xuICAgICAgdGhpcy5xdWFkID0gUVVBRF8xO1xuICAgIH0gZWxzZSBpZiAoeDIgPj0geDIgJiYgeTIgPD0geTEpIHtcbiAgICAgIHRoaXMucXVhZCA9IFFVQURfMjtcbiAgICB9IGVsc2UgaWYgKHgyIDw9IHgyICYmIHkyID49IHkxKSB7XG4gICAgICB0aGlzLnF1YWQgPSBRVUFEXzM7XG4gICAgfSBlbHNlIGlmICh4MiA+PSB4MiAmJiB5MiA+PSB5MSkge1xuICAgICAgdGhpcy5xdWFkID0gUVVBRF80O1xuICAgIH1cblxuICAgIGNvbnN0IGxhYmVsX3ggPSAod2lkdGggLyAyKSAqICgxIC0gb3B0cy5mYWN0b3JMZWdlbmQgKiBNYXRoLnNpbihheGlzSW5kZXggKiBSQURJQU5TIC8gbWF4QXhpc05vKSkgLSA2MCAqIE1hdGguc2luKGF4aXNJbmRleCAqIFJBRElBTlMvbWF4QXhpc05vKTtcbiAgICBjb25zdCBsYWJlbF95ID0gKGhlaWdodCAvIDIpICogKDEgLSBNYXRoLmNvcyhheGlzSW5kZXggKiBSQURJQU5TIC8gbWF4QXhpc05vKSkgLSAyMCAqIE1hdGguY29zKGF4aXNJbmRleCAqIFJBRElBTlMgLyBtYXhBeGlzTm8pO1xuXG4gICAgLy8gTm90ZSB0aGUgZ3JhZGllbnRzIGFyZSBpbnZlcnNlZCBiZWNhdXNlIG9mIHRoZSBTVkcgY28tb3JkaW5hdGUgc3lzdGVtLlxuICAgIGNvbnN0IGdyYWRpZW50ID0gTWF0aC5hYnMoeDIgLSB4MSkgPCAwLjAwMDAwMDAwMSA/IEluZmluaXR5IDogKHkyIC0geTEpIC8gKHgyIC0geDEpO1xuICAgIGNvbnN0IGIgPSBncmFkaWVudCA9PT0gSW5maW5pdHkgPyAwIDogeTIgLSBncmFkaWVudCAqIHgyO1xuICAgIHRoaXMuZ3JhZGllbnQgPSAgZ3JhZGllbnQ7XG5cbiAgICBjb25zdCBwcm9qZWN0Q29yZFRvQXhpcyA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGlmIChncmFkaWVudCA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgcmV0dXJuIHt4OiB4MSwgeTogeX07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihncmFkaWVudCA8IC0yIHx8IChncmFkaWVudCA+PSAwIHx8IGdyYWRpZW50IDwgMC4xNDUpKSB7XG4gICAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiBncmFkaWVudCAqIHggKyBifTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4ge3g6ICh5LWIpL2dyYWRpZW50LCB5OiB5fTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm1heFZhbHVlID0gb3B0cy5heGlzLnVzZUdsb2JhbE1heCA/IG9wdHMuYXhpcy5tYXhWYWx1ZSA6IGF4aXNPcHRpb25zLmF4aXNWYWx1ZU1heDtcbiAgICB0aGlzLmF4aXNMZW5ndGggPSBNYXRoLnNxcnQoTWF0aC5wb3coKHgyIC0geDEpLCAyKSArIE1hdGgucG93KCh5MiAtIHkxKSwgMikpO1xuICAgIHRoaXMuYW5nbGVGcm9tTm9ydGggPSAoMTgwIC8gTWF0aC5QSSkgKiAoMSAtIGF4aXNJbmRleCAqIFJBRElBTlMgLyBtYXhBeGlzTm8pIC0gKDE4MCAvIE1hdGguUEkpIC0gOTAgLSAoMTgwIC8gTWF0aC5QSSAqIDEwIC8gdGhpcy5heGlzTGVuZ3RoIC8gMik7XG5cbiAgICB0aGlzLmF4aXMgPSBheGlzT3B0aW9ucy5heGlzSWQsXG4gICAgdGhpcy5sYWJlbCA9IGF4aXNPcHRpb25zLmxhYmVsID8gYXhpc09wdGlvbnMubGFiZWwgOiBheGlzT3B0aW9ucy5heGlzSWQ7XG5cbiAgICB0aGlzLngxID0geDE7XG4gICAgdGhpcy55MSA9IHkxO1xuICAgIHRoaXMueDIgPSB4MjtcbiAgICB0aGlzLnkyID0geTI7XG5cbiAgICB0aGlzLmxhYmVsX3ggPSBsYWJlbF94O1xuICAgIHRoaXMubGFiZWxfeSA9IGxhYmVsX3k7XG5cbiAgICBjb25zdCBwcm9qZWN0VmFsdWVPbkF4aXNYTXVsdFRlcm0gPSBvcHRzLmZhY3RvciAqIE1hdGguc2luKGF4aXNJbmRleCAqIFJBRElBTlMgLyBtYXhBeGlzTm8pO1xuICAgIGNvbnN0IHByb2plY3RWYWx1ZU9uQXhpc1lNdWx0VGVybSA9IG9wdHMuZmFjdG9yICogTWF0aC5jb3MoYXhpc0luZGV4ICogUkFESUFOUyAvIG1heEF4aXNObyk7XG5cbiAgICB0aGlzLnByb2plY3RDb3JkVG9BeGlzID0gcHJvamVjdENvcmRUb0F4aXM7XG4gICAgdGhpcy5wcm9qZWN0VmFsdWVPbkF4aXMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogd2lkdGggLyAyICogKDEgLSAocGFyc2VGbG9hdChNYXRoLm1heCh2YWx1ZSwgMCkpIC8gdGhpcy5tYXhWYWx1ZSkgKiBwcm9qZWN0VmFsdWVPbkF4aXNYTXVsdFRlcm0pLFxuICAgICAgICB5OiBoZWlnaHQgLyAyICogKDEgLSAocGFyc2VGbG9hdChNYXRoLm1heCh2YWx1ZSwgMCkpIC8gdGhpcy5tYXhWYWx1ZSkgKiBwcm9qZWN0VmFsdWVPbkF4aXNZTXVsdFRlcm0pLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLmNvcmRPbkF4aXNUb1ZhbHVlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgIGlmICh0aGlzLmdyYWRpZW50ID09PSBJbmZpbml0eSkge1xuICAgICAgICBsZXQgbGVuID0gTWF0aC5hYnModGhpcy55MiAtIHkpO1xuICAgICAgICByZXR1cm4gKHRoaXMuYXhpc0xlbmd0aCAtIGxlbikgKiB0aGlzLm1heFZhbHVlLyB0aGlzLmF4aXNMZW5ndGg7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZ3JhZGllbnQgPj0gMCAmJiB0aGlzLmdyYWRpZW50IDwgMC4wMDAwMDAwMSkge1xuICAgICAgICBsZXQgbGVuID0gTWF0aC5hYnModGhpcy54MiAtIHgpO1xuICAgICAgICByZXR1cm4gKHRoaXMuYXhpc0xlbmd0aCAtIGxlbikgKiB0aGlzLm1heFZhbHVlLyB0aGlzLmF4aXNMZW5ndGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKDIqeC93aWR0aCAtIDEpICogKHRoaXMubWF4VmFsdWUvcHJvamVjdFZhbHVlT25BeGlzWE11bHRUZXJtKSAqIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uUmVjdE1vdXNlT3ZlcigpIHtcbiAgICBpZiAodGhpcy5kcmFnQWN0aXZlKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5heGlzVGlja1RleHRFbGVtZW50cy5mb3JFYWNoKGQgPT4ge1xuICAgICAgZDMuc2VsZWN0KGQpXG4gICAgICAgIC5zdHlsZSgnb3BhY2l0eScsIDAuOSk7XG4gICAgfSk7XG4gIH1cblxuICBvblJlY3RNb3VzZU91dCgpIHtcbiAgICBpZiAodGhpcy5kcmFnQWN0aXZlKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5heGlzVGlja1RleHRFbGVtZW50cy5mb3JFYWNoKGQgPT4ge1xuICAgICAgZDMuc2VsZWN0KGQpXG4gICAgICAgIC50cmFuc2l0aW9uKDIwMClcbiAgICAgICAgLnN0eWxlKCdvcGFjaXR5JywgMC4wKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQge1xuICBBeGlzIGFzIGRlZmF1bHQsXG4gIFFVQURfMSxcbiAgUVVBRF8yLFxuICBRVUFEXzMsXG4gIFFVQURfNFxufVxuIiwiaW1wb3J0IGQzIGZyb20gJ2QzJztcbmltcG9ydCB7XG4gIFFVQURfMSxcbiAgUVVBRF8yXG59IGZyb20gJy4vQXhpcy5qcyc7XG5cbi8qKlxuICogVGhlIGFyZWEgcmVwcmVzZW50cyB0aGUgcmFkYXIgY2hhdCBhcmVhIGZvciBhIHBhcnRpY3VsYXIgc2VyaWVzLlxuICogSXQgaW5jbHVkZXMgdGhlIHBvbHlnb24gYW5kIGNpcmNsZXMgb24gdGhlIGFwZXguXG4gKi9cbmNsYXNzIEFyZWEge1xuICAvKipcbiAgICogQHBhcmFtIGF4aXNNYXAge09iamVjdH0gQSBtYXAgb2YgYXhpc0lkIHRvIGF4aXMgT2JqZWN0c1xuICAgKiBAcGFyYW0gc2VyaWVzIHtBcnJheX0gTnVtYmVyIG9mIGFyZWFzXG4gICAqIEBwYXJhbSBkcmF3aW5nQ29udGV4dCB7T2JqZWN0fSBBIHN2ZyBnLWVsZW1lbnQgZm9yIGRyYXdpbmcgb25cbiAgICogQHBhcmFtIHNlcmllc0lkZW50IHtTdHJpbmd9IFRoZSBpZGVudGl0eSBvZiB0aGUgc2VyaWVzIG11c3QgYmUgdW5pcXVlXG4gICAqIEBwYXJhbSBhcmVhT3B0aW9ucyB7T2JqZWN0fSBPcHRpb25zIGZvciB0aGlzIGFyZWFcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFyZ3MpIHtcbiAgICB0aGlzLmF4aXNNYXAgPSBhcmdzLmF4aXNNYXA7XG4gICAgdGhpcy5kYXRhID0gXy5jbG9uZURlZXAoYXJncy5zZXJpZXMpO1xuICAgIHRoaXMuZHJhd2luZ0NvbnRleHQgPSBhcmdzLmRyYXdpbmdDb250ZXh0O1xuXHQgIHRoaXMuY29sb3IgPSBkMy5zY2FsZU9yZGluYWwoZDMuc2NoZW1lQWNjZW50KTtcbiAgICB0aGlzLnNlcmllc0lkZW50ID0gYXJncy5zZXJpZXNJZGVudDtcbiAgICB0aGlzLnNlcmllc0luZGV4ID0gYXJncy5zZXJpZXNJbmRleDtcbiAgICB0aGlzLm9wdHMgPSBfLmNsb25lRGVlcChhcmdzLmFyZWFPcHRpb25zKTtcbiAgICB0aGlzLm9wdHMuY29sb3JTY2FsZSA9IGFyZ3MuYXJlYU9wdGlvbnMuY29sb3JTY2FsZTtcbiAgICB0aGlzLmNpcmNsZVJhZGl1cyA9IDU7XG5cbiAgICAvLyBGb3IgZWFjaCBheGlzSWQgY2FsY3VsYXRlIHRoZSBhcGV4IHBvaW50cyBmb3IgdGhpcyBhcmVhXG4gICAgdGhpcy5wb2ludHMgPSAgdGhpcy5kYXRhLm1hcChzcG9rZSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb3JkczogdGhpcy5heGlzTWFwW3Nwb2tlLmF4aXNdLnByb2plY3RWYWx1ZU9uQXhpcyhzcG9rZS52YWx1ZSksXG4gICAgICAgIGRhdHVtOiBfLmNsb25lRGVlcChzcG9rZSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucG9seWdvbldyYXBwZXIgPSB7XG4gICAgICBwb2ludHM6IHRoaXMucG9pbnRzLFxuICAgICAgc3ZnU3RyaW5nUmVwOiB0aGlzLnBvaW50cy5yZWR1Y2UoKGFjYywgcCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICsgcC5jb3Jkcy54ICsgXCIsXCIgKyBwLmNvcmRzLnkgKyBcIiBcIjtcbiAgICAgIH0sIFwiXCIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgbm9kZXMgYW5kIHRoZSBhcmVhXG4gICAqL1xuICByZW5kZXIoKSB7XG4gICAgdGhpcy5yZW5kZXJBcmVhKCk7XG4gICAgdGhpcy5yZW5kZXJDaXJjbGVzKCk7XG4gIH1cblxuICB1cGRhdGVQb3NpdGlvbnMoKSB7XG4gICAgdGhpcy5wb2x5Z29uV3JhcHBlci5zdmdTdHJpbmdSZXAgPSB0aGlzLnBvaW50cy5yZWR1Y2UoKGFjYywgcCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICsgcC5jb3Jkcy54ICsgXCIsXCIgKyBwLmNvcmRzLnkgKyBcIiBcIjtcbiAgICAgIH0sIFwiXCIpO1xuXG4gICAgdGhpcy5hcmVhLnJlbW92ZSgpO1xuICAgIHRoaXMucmVuZGVyQXJlYSgpO1xuICB9XG5cbiAgY3JlYXRlT25Nb3VzZU92ZXJDaXJjbGUoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAgY29uc3QgdGhpc1BvbHlnb24gPSBcInBvbHlnb24uXCIgKyBkMy5zZWxlY3QodGhpcykuYXR0cihcImNsYXNzXCIpO1xuICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgIC5zdHlsZSgnZmlsbC1vcGFjaXR5Jywgc2VsZi5vcHRzLmhvdmVyQ2lyY2xlT3BhY2l0eSk7XG4gICAgICBzZWxmLmRyYXdpbmdDb250ZXh0LnNlbGVjdEFsbChcInBvbHlnb25cIilcbiAgICAgICAgLnRyYW5zaXRpb24oMjAwKVxuICAgICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgc2VsZi5vcHRzLmhpZGRlbkFyZWFPcGFjaXR5KTtcbiAgICAgIHNlbGYuZHJhd2luZ0NvbnRleHQuc2VsZWN0QWxsKHRoaXNQb2x5Z29uKVxuICAgICAgICAudHJhbnNpdGlvbigyMDApXG4gICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCBzZWxmLm9wdHMuaGlnaGxpZ2h0ZWRBcmVhT3BhY2l0eSk7XG5cbiAgICAgIGQzLnNlbGVjdChkLmNpcmNsZVJlZilcbiAgICAgICAgLnRyYW5zaXRpb24oMTAwKVxuICAgICAgICAuYXR0cigncicsIHNlbGYuY2lyY2xlUmFkaXVzICogc2VsZi5vcHRzLmNpcmNsZU92ZXJsYXlSYWRpdXNNdWx0KVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZU1vdXNlT3V0Q2lybGNlKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7XG4gICAgICBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgLnN0eWxlKCdmaWxsLW9wYWNpdHknLCBzZWxmLm9wdHMuZGVmYXVsdENpcmNsZU9wYWNpdHkpO1xuICAgICAgc2VsZi5kcmF3aW5nQ29udGV4dC5zZWxlY3RBbGwoXCJwb2x5Z29uXCIpXG4gICAgICAgIC50cmFuc2l0aW9uKDIwMClcbiAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIHNlbGYub3B0cy5kZWZhdWx0QXJlYU9wYWNpdHkpO1xuXG4gICAgICBkMy5zZWxlY3QoZC5jaXJjbGVSZWYpXG4gICAgICAgIC50cmFuc2l0aW9uKDEwMClcbiAgICAgICAgLmF0dHIoJ3InLCBzZWxmLmNpcmNsZVJhZGl1cylcbiAgICB9XG4gIH1cblxuICBjcmVhdGVPbkRyYWdFbmRDaXJjbGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7XG4gICAgICB2YXIgYXhpcyA9IHNlbGYuYXhpc01hcFtkLmRhdHVtLmF4aXNdO1xuICAgICAgc2VsZi5heGlzTWFwW2QuZGF0dW0uYXhpc10uZHJhZ0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgc2VsZi5heGlzTWFwW2QuZGF0dW0uYXhpc10ub25SZWN0TW91c2VPdXQoKTtcbiAgICB9XG4gIH1cblxuICBjcmVhdGVPbkRyYWdnaW5nQ2lyY2xlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAgdmFyIGF4aXMgPSBzZWxmLmF4aXNNYXBbZC5kYXR1bS5heGlzXTtcbiAgICAgIHNlbGYuYXhpc01hcFtkLmRhdHVtLmF4aXNdLm9uUmVjdE1vdXNlT3ZlcigpO1xuICAgICAgc2VsZi5heGlzTWFwW2QuZGF0dW0uYXhpc10uZHJhZ0FjdGl2ZSA9IHRydWU7XG5cbiAgICAgIGxldCB7eDogbW91c2VYLCB5OiBtb3VzZVl9ID0gZDMuZXZlbnQ7XG5cbiAgICAgIHZhciBuZXdYID0gYXhpcy5wcm9qZWN0Q29yZFRvQXhpcyhtb3VzZVgsIG1vdXNlWSkueDtcbiAgICAgIHZhciBuZXdZID0gYXhpcy5wcm9qZWN0Q29yZFRvQXhpcyhtb3VzZVgsIG1vdXNlWSkueTtcblxuICAgICAgaWYgKGF4aXMucXVhZCA9PT0gUVVBRF8xIHx8IGF4aXMucXVhZCA9PT0gUVVBRF8yKSB7XG4gICAgICAgIGlmIChuZXdZIDwgYXhpcy55MiB8fCBuZXdZID4gYXhpcy55MSApIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChuZXdZIDwgYXhpcy55MSB8fCBuZXdZID4gYXhpcy55MiApIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG5ld1ZhbHVlID0gYXhpcy5jb3JkT25BeGlzVG9WYWx1ZShuZXdYLCBuZXdZKTtcblxuICAgICAgZC5kYXR1bS52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgZC5jb3JkcyA9IHNlbGYuYXhpc01hcFtkLmRhdHVtLmF4aXNdLnByb2plY3RWYWx1ZU9uQXhpcyhuZXdWYWx1ZSlcblxuICAgICAgZDMuc2VsZWN0KGQuY2lyY2xlUmVmKVxuICAgICAgICAuYXR0cihcImN4XCIsIG5ld1gpXG4gICAgICAgIC5hdHRyKFwiY3lcIiwgbmV3WSlcblxuICAgICAgZDMuc2VsZWN0KGQub3ZlcmxheVJlZilcbiAgICAgICAgLmF0dHIoXCJjeFwiLCBuZXdYKVxuICAgICAgICAuYXR0cihcImN5XCIsIG5ld1kpXG5cbiAgICAgIHNlbGYudXBkYXRlUG9zaXRpb25zKCk7XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlT25Nb3VzZU92ZXJQb2x5Z29uKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBjb25zdCB0aGlzUG9seSA9IFwicG9seWdvbi5cIiArIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiY2xhc3NcIik7XG4gICAgICBzZWxmLmRyYXdpbmdDb250ZXh0LnNlbGVjdEFsbChcInBvbHlnb25cIilcbiAgICAgICAudHJhbnNpdGlvbigyMDApXG4gICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIHNlbGYub3B0cy5oaWRkZW5BcmVhT3BhY2l0eSk7XG5cbiAgICAgIHNlbGYuZHJhd2luZ0NvbnRleHQuc2VsZWN0QWxsKHRoaXNQb2x5KVxuICAgICAgIC50cmFuc2l0aW9uKDIwMClcbiAgICAgICAuc3R5bGUoXCJmaWxsLW9wYWNpdHlcIiwgc2VsZi5vcHRzLmhpZ2hsaWdodGVkQXJlYU9wYWNpdHkpO1xuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZU9uTW91c2VPdXRQb2x5Z29uKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbihlbCkge1xuICAgICAgZDMuc2VsZWN0KHRoaXMpXG4gICAgICAgLnRyYW5zaXRpb24oMjAwKVxuICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCBzZWxmLm9wdHMuZGVmYXVsdEFyZWFPcGFjaXR5KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJBcmVhKCkge1xuICAgIHRoaXMuYXJlYSA9IHRoaXMuZHJhd2luZ0NvbnRleHQuc2VsZWN0QWxsKFwiLmFyZWFcIilcbiAgICAgIC5kYXRhKFt0aGlzLnBvbHlnb25XcmFwcGVyXSlcbiAgICAgIC5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwicG9seWdvblwiKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInJhZGFyLWNoYXJ0LXNlcmllXCIrIHRoaXMuc2VyaWVzSWRlbnQpXG4gICAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgXCIycHhcIilcbiAgICAgIC5zdHlsZShcInN0cm9rZVwiLCAoKSA9PiB7XG4gICAgICAgIGlmKHRoaXMub3B0cy51c2VDb2xvclNjYWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5saW5lQ29sb3JTY2FsZSh0aGlzLnNlcmllc0luZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5hdHRyKFwicG9pbnRzXCIsZCA9PiBkLnN2Z1N0cmluZ1JlcClcbiAgICAgIC5hdHRyKCd6LWluZGV4JywgLTEpXG4gICAgICAuc3R5bGUoXCJmaWxsXCIsICgpID0+IHtcbiAgICAgICAgaWYodGhpcy5vcHRzLnVzZUNvbG9yU2NhbGUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5vcHRzLmFyZWFDb2xvclNjYWxlKHRoaXMuc2VyaWVzSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIHRoaXMub3B0cy5kZWZhdWx0QXJlYU9wYWNpdHkpXG4gICAgICAub24oJ21vdXNlb3ZlcicsIHRoaXMuY3JlYXRlT25Nb3VzZU92ZXJQb2x5Z29uKCkpXG4gICAgICAub24oJ21vdXNlb3V0JywgdGhpcy5jcmVhdGVPbk1vdXNlT3V0UG9seWdvbigpKVxuICB9XG5cbiAgcmVuZGVyQ2lyY2xlcygpIHtcbiAgICB0aGlzLmNpcmNsZXMgPSB0aGlzLmRyYXdpbmdDb250ZXh0LnNlbGVjdEFsbChcIi5ub2Rlc1wiKVxuICAgICAgLmRhdGEodGhpcy5wb2ludHMpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpjaXJjbGVcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJyYWRhci1jaGFydC1zZXJpZXNcIiArIHRoaXMuc2VyaWVzSWRlbnQpXG4gICAgICAuYXR0cigncicsIHRoaXMuY2lyY2xlUmFkaXVzKVxuICAgICAgLmF0dHIoXCJhbHRcIiwgZnVuY3Rpb24oail7cmV0dXJuIE1hdGgubWF4KGoudmFsdWUsIDApfSlcbiAgICAgIC5hdHRyKFwiY3hcIiwgZCA9PiBkLmNvcmRzLngpXG4gICAgICAuYXR0cihcImN5XCIsIGQgPT4gZC5jb3Jkcy55KVxuICAgICAgLnN0eWxlKFwiZmlsbFwiLCAoKSA9PiB7XG4gICAgICAgIGlmKHRoaXMub3B0cy51c2VDb2xvclNjYWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5saW5lQ29sb3JTY2FsZSh0aGlzLnNlcmllc0luZGV4KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCB0aGlzLm9wdHMuZGVmYXVsdENpcmNsZU9wYWNpdHkpXG4gICAgICAuZWFjaChmdW5jdGlvbihkKSB7IGQuY2lyY2xlUmVmID0gdGhpczsgfSlcblxuICAgIHRoaXMuY2lyY2xlT3ZlcnlsYXlzID0gdGhpcy5kcmF3aW5nQ29udGV4dFxuICAgICAgLnNlbGVjdEFsbCgnLm5vZGVzLW92ZXJsYXknKVxuICAgICAgLmRhdGEodGhpcy5wb2ludHMpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZChcInN2ZzpjaXJjbGVcIilcbiAgICAgIC5jYWxsKGQzLmRyYWcoKVxuICAgICAgICAuc3ViamVjdChmdW5jdGlvbihkKSB7IHJldHVybiB0aGlzOyB9KVxuICAgICAgICAub24oJ2RyYWcnLCB0aGlzLmNyZWF0ZU9uRHJhZ2dpbmdDaXJjbGUoKSlcbiAgICAgICAgLm9uKCdlbmQnLCB0aGlzLmNyZWF0ZU9uRHJhZ0VuZENpcmNsZSgpKVxuICAgICAgKVxuICAgICAgLmF0dHIoJ3InLCB0aGlzLmNpcmNsZVJhZGl1cyAqIHRoaXMub3B0cy5jaXJjbGVPdmVybGF5UmFkaXVzTXVsdClcbiAgICAgIC5hdHRyKFwiY3hcIiwgZCA9PiBkLmNvcmRzLngpXG4gICAgICAuYXR0cihcImN5XCIsIGQgPT4gZC5jb3Jkcy55KVxuICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjApXG4gICAgICAub24oJ21vdXNlb3ZlcicsIHRoaXMuY3JlYXRlT25Nb3VzZU92ZXJDaXJjbGUoKSlcbiAgICAgIC5vbignbW91c2VvdXQnLCB0aGlzLmNyZWF0ZU1vdXNlT3V0Q2lybGNlKCkpXG4gICAgICAuZWFjaChmdW5jdGlvbihkKSB7IGQub3ZlcmxheVJlZiA9IHRoaXM7IH0pXG5cbiAgICB0aGlzLmNpcmNsZXNcbiAgICAgIC5hcHBlbmQoXCJzdmc6dGl0bGVcIilcbiAgICAgIC50ZXh0KGQgPT4gZC5kYXR1bS52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoaXMgYXJlYS4gQWxzbyBoYW5kbGVzIHJlbW92aW5nIGFueSBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICB0aGlzLmFyZWFcbiAgICAgLm9uKCdtb3VzZW92ZXInLCBudWxsKVxuICAgICAub24oJ21vdXNlb3V0JywgbnVsbCk7XG5cbiAgICB0aGlzLmNpcmNsZXMuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgICBkMy5zZWxlY3QoZC5jaXJjbGVSZWYpXG4gICAgICAgIC5vbignbW91c2VvdmVyJywgbnVsbClcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIG51bGwpXG4gICAgICAgIC5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY2lyY2xlT3ZlcnlsYXlzLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgZDMuc2VsZWN0KGQuY2lyY2xlUmVmKVxuICAgICAgICAub24oJ21vdXNlb3ZlcicsIG51bGwpXG4gICAgICAgIC5vbignbW91c2VvdXQnLCBudWxsKVxuICAgICAgICAucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFyZWEucmVtb3ZlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXJlYTtcbiIsImltcG9ydCBBcmVhIGZyb20gJy4vQXJlYS5qcyc7XG5pbXBvcnQgQXhpcyBmcm9tICcuL0F4aXMuanMnO1xuaW1wb3J0IGQzIGZyb20gJ2QzJztcblxuLyoqXG4gKiBCYXNlZCBvZlxuICogIC0gaHR0cHM6Ly9naXRodWIuY29tL2FsYW5ncmFmdS9yYWRhci1jaGFydC1kM1xuICogIC0gaHR0cDovL2JsLm9ja3Mub3JnL25icmVtZXIvMjE3NDZhOTY2OGZmZGY2ZDgyNDJcbiAqL1xuY2xhc3MgUmFkYXJDaGFydCB7XG4gIC8qKlxuICAgKiBAcGFyYW0gYXJncyB7T2JqZWN0fVxuICAgKi9cbiAgY29uc3RydWN0b3IoYXJncykge1xuICAgIHRoaXMucm9vdEVsZW1lbnQgPSBkMy5zZWxlY3QoYXJncy5yb290RWxlbWVudCk7XG4gICAgdGhpcy5vcHRzID0gXy5vbWl0KGFyZ3MsIFsncm9vdEVsZW1lbnQnXSk7XG4gICAgdGhpcy5vcHRzID0gXy5jbG9uZURlZXAodGhpcy5vcHRzKTtcblxuICAgIHRoaXMub3B0cy5heGlzLm1heEF4aXNObyA9IHRoaXMub3B0cy5heGlzLmNvbmZpZy5sZW5ndGg7XG5cdCAgdGhpcy5vcHRzLmxldmVscy5sZXZlbFJhZGl1cyA9IHRoaXMub3B0cy5mYWN0b3IgKiBNYXRoLm1pbih0aGlzLm9wdHMuZGltcy53aWR0aCAvIDIsIHRoaXMub3B0cy5kaW1zLmhlaWdodCAvIDIpO1xuXG4gICAgdGhpcy5kYXRhID0gdGhpcy5vcHRzLmRhdGE7XG4gICAgdGhpcy5heGlzQ29uZmlnID0gdGhpcy5vcHRzLmF4aXMuY29uZmlnO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBtYXhpbXVtIHZhbHVlIGZvciB0aGUgY2hhcnQgb25seSB1c2VkIGlmXG4gICAgLy8gb3B0cy5heGlzLnVzZUdsb2JhbE1heCBpcyB0cnVlXG4gICAgY29uc3QgbWF4RnJvbURhdGEgPSBkMy5tYXgodGhpcy5kYXRhLCAoZGF0YVNldCkgPT4gZDMubWF4KGRhdGFTZXQubWFwKG8gPT4gby52YWx1ZSkpKTtcblx0ICB0aGlzLm9wdHMubWF4VmFsdWUgPSBNYXRoLm1heCh0aGlzLm9wdHMubWF4VmFsdWUsIG1heEZyb21EYXRhKTtcblxuXHQgIHRoaXMuYXhpc1BhcmFtZXRlcnMgPSB0aGlzLmF4aXNDb25maWcubWFwKChheGlzLCBpbngpID0+IG5ldyBBeGlzKHRoaXMub3B0cywgYXhpcywgaW54KSk7XG4gICAgdGhpcy5heGlzTWFwID0gdGhpcy5heGlzUGFyYW1ldGVyc1xuICAgICAgLnJlZHVjZSgobWFwLCBpeCkgPT4ge1xuICAgICAgICBtYXBbaXguYXhpc10gPSBpeDtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgIH0sIHt9KTtcblxuICAgIC8vIFRvIHN0b3JlIHRoZSBhcmVhIGNvbXBvbmVudHNcbiAgICB0aGlzLmFyZWFzID0gW107XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5yZW5kZXJBeGlzKCk7XG4gICAgdGhpcy5yZW5kZXJBcmVhKCk7XG4gICAgdGhpcy5yZW5kZXJMZWdlbmQoKTtcbiAgfVxuXG4gIHJlbmRlckF4aXMoKSB7XG4gICAgY29uc3Qgb3B0cyA9IHRoaXMub3B0cztcbiAgICBjb25zdCB7bWF4QXhpc05vfSA9IHRoaXMub3B0cy5heGlzO1xuICAgIGNvbnN0IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgZXh0cmFXaWR0aFgsXG4gICAgICBleHRyYVdpZHRoWSxcbiAgICAgIHRyYW5zbGF0ZVgsXG4gICAgICB0cmFuc2xhdGVZXG4gICAgfSA9IHRoaXMub3B0cy5kaW1zO1xuICAgIGNvbnN0IHtSQURJQU5TfSA9IFJhZGFyQ2hhcnQ7XG5cbiAgICB0aGlzLnJvb3RTdmcgPSB0aGlzLnJvb3RFbGVtZW50XG4gICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIGV4dHJhV2lkdGhYKVxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQgKyBleHRyYVdpZHRoWSk7XG5cbiAgICB0aGlzLmRyYXdpbmdDb250ZXh0ID0gdGhpcy5yb290U3ZnXG4gICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0cmFuc2xhdGVYICsgXCIsXCIgKyB0cmFuc2xhdGVZICsgXCIpXCIpO1xuXG4gICAgLy8gQ2lyY3VsYXIgc2VnbWVudHNcbiAgICBmb3IodmFyIGx2bElueCA9IDA7IGx2bElueCA8IG9wdHMubGV2ZWxzLmxldmVsc05vIC0gMTsgbHZsSW54KyspIHtcbiAgICAgIHZhciBsZXZlbEZhY3RvciA9IG9wdHMuZmFjdG9yICogb3B0cy5sZXZlbHMubGV2ZWxSYWRpdXMgKiAoKGx2bElueCArIDEpIC8gb3B0cy5sZXZlbHMubGV2ZWxzTm8pO1xuXG4gICAgICB0aGlzLmRyYXdpbmdDb250ZXh0LnNlbGVjdEFsbChcIi5sZXZlbHNcIilcbiAgICAgICAuZGF0YSh0aGlzLmF4aXNQYXJhbWV0ZXJzKVxuICAgICAgIC5lbnRlcigpXG4gICAgICAgLmFwcGVuZChcInN2ZzpsaW5lXCIpXG4gICAgICAgLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbihkLCBpKXtyZXR1cm4gbGV2ZWxGYWN0b3IqKDEgLSBvcHRzLmZhY3RvcipNYXRoLnNpbihpKlJBRElBTlMvbWF4QXhpc05vKSk7fSlcbiAgICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQsIGkpe3JldHVybiBsZXZlbEZhY3RvciooMSAtIG9wdHMuZmFjdG9yKk1hdGguY29zKGkqUkFESUFOUy9tYXhBeGlzTm8pKTt9KVxuICAgICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24oZCwgaSl7cmV0dXJuIGxldmVsRmFjdG9yKigxIC0gb3B0cy5mYWN0b3IqTWF0aC5zaW4oKGkrMSkqUkFESUFOUy9tYXhBeGlzTm8pKTt9KVxuICAgICAgIC5hdHRyKFwieTJcIiwgZnVuY3Rpb24oZCwgaSl7cmV0dXJuIGxldmVsRmFjdG9yKigxIC0gb3B0cy5mYWN0b3IqTWF0aC5jb3MoKGkrMSkqUkFESUFOUy9tYXhBeGlzTm8pKTt9KVxuICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5lXCIpXG4gICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiZ3JleVwiKVxuICAgICAgIC5zdHlsZShcInN0cm9rZS1vcGFjaXR5XCIsIFwiMC43NVwiKVxuICAgICAgIC5zdHlsZShcInN0cm9rZS13aWR0aFwiLCBcIjAuM3B4XCIpXG4gICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAod2lkdGggLyAyIC0gbGV2ZWxGYWN0b3IpICsgXCIsIFwiICsgKGhlaWdodCAvIDIgLSBsZXZlbEZhY3RvcikgKyBcIilcIik7XG4gICAgfVxuXG5cdCAgdmFyIEZvcm1hdCA9IGQzLmZvcm1hdCgnLjIlJyk7XG4gICAgLy8gVGV4dCBpbmRpY2F0aW5nIGF0IHdoYXQgJSBlYWNoIGxldmVsIGlzXG4gICAgZm9yKHZhciBsdmxJbnggPSAwOyBsdmxJbnggPCBvcHRzLmxldmVscy5sZXZlbHNObzsgbHZsSW54KyspIHtcbiAgICAgIHZhciBsZXZlbEZhY3RvciA9IG9wdHMuZmFjdG9yICogb3B0cy5sZXZlbHMubGV2ZWxSYWRpdXMgKiAoKGx2bElueCArIDEpIC8gb3B0cy5sZXZlbHMubGV2ZWxzTm8pO1xuXG4gICAgICB2YXIgeiA9IHRoaXMuZHJhd2luZ0NvbnRleHRcbiAgICAgICAuc2VsZWN0QWxsKFwiLmxldmVsc1wiKVxuICAgICAgIC5kYXRhKHRoaXMuYXhpc1BhcmFtZXRlcnMpXG4gICAgICAgLmVudGVyKClcbiAgICAgICAuYXBwZW5kKFwic3ZnOnRleHRcIilcbiAgICAgICAuYXR0cihcInhcIiwgZnVuY3Rpb24oZCwgaSkge3JldHVybiBsZXZlbEZhY3RvciAqICgxIC0gb3B0cy5mYWN0b3IgKiBNYXRoLnNpbihpICogUkFESUFOUy9tYXhBeGlzTm8pKTt9KVxuICAgICAgIC5hdHRyKFwieVwiLCBmdW5jdGlvbihkLCBpKSB7cmV0dXJuIGxldmVsRmFjdG9yICogKDEgLSBvcHRzLmZhY3RvciAqIE1hdGguY29zKGkgKiBSQURJQU5TL21heEF4aXNObykpO30pXG4gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxlZ2VuZFwiKVxuICAgICAgIC5zdHlsZShcImZvbnQtZmFtaWx5XCIsIFwic2Fucy1zZXJpZlwiKVxuICAgICAgIC5zdHlsZShcImZvbnQtc2l6ZVwiLCBcIjEwcHhcIilcbiAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDAuMClcbiAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArICh3aWR0aCAvIDIgLSBsZXZlbEZhY3RvciArIG9wdHMuVG9SaWdodCkgKyBcIiwgXCIgKyAoaGVpZ2h0IC8gMiAtIGxldmVsRmFjdG9yKSArIFwiKVwiKVxuICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM3MzczNzNcIilcbiAgICAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBGb3JtYXQoKGx2bElueCArIDEpICogZC5tYXhWYWx1ZSAvIG9wdHMubGV2ZWxzLmxldmVsc05vKTsgfSlcbiAgICAgICAuZWFjaChmdW5jdGlvbihkKSB7IGQuYXhpc1RpY2tUZXh0RWxlbWVudHMucHVzaCh0aGlzKTsgfSlcbiAgICB9XG5cbiAgICB0aGlzLmF4aXNHID0gdGhpcy5kcmF3aW5nQ29udGV4dFxuICAgICAgLnNlbGVjdEFsbChcIi5heGlzXCIpXG4gICAgICAuZGF0YSh0aGlzLmF4aXNQYXJhbWV0ZXJzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoXCJnXCIpXG5cbiAgICB0aGlzLmF4aXNMaW5lcyA9IHRoaXMuYXhpc0dcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJheGlzXCIpXG4gICAgICAuYXBwZW5kKFwibGluZVwiKVxuICAgICAgLmF0dHIoXCJ4MVwiLCBkID0+IGQueDEpXG4gICAgICAuYXR0cihcInkxXCIsIGQgPT4gZC55MSlcbiAgICAgIC5hdHRyKFwieDJcIiwgZCA9PiBkLngyKVxuICAgICAgLmF0dHIoXCJ5MlwiLCBkID0+IGQueTIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGluZVwiKVxuICAgICAgLmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ25vbmUnKVxuICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiZ3JleVwiKVxuICAgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB4XCIpXG5cbiAgICB0aGlzLnJlY3RzID0gIHRoaXMuYXhpc0dcbiAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAuYXR0cignY2xhc3MnLCAnb3ZlcmxheScpXG4gICAgICAgLmF0dHIoXCJ4XCIsIGQgPT4gZC54MSlcbiAgICAgICAuYXR0cihcInlcIiwgZCA9PiBkLnkxKVxuICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIChkLCBpKSA9PiBcInJvdGF0ZShcIiArIGQuYW5nbGVGcm9tTm9ydGggKyBcIixcIiArIGQueDEgKyBcIixcIiArIGQueTEgK1wiKVwiKVxuICAgICAgIC5hdHRyKCd3aWR0aCcsIGQgPT4gZC5heGlzTGVuZ3RoKVxuICAgICAgIC5hdHRyKCdoZWlnaHQnLCAxMClcbiAgICAgICAuYXR0cignZmlsbC1vcGFjaXR5JywgMC4wKVxuICAgICAgIC5vbignbW91c2VvdmVyJywgZCA9PiBkLm9uUmVjdE1vdXNlT3ZlcigpKVxuICAgICAgIC5vbignbW91c2VvdXQnLCBkID0+IGQub25SZWN0TW91c2VPdXQoKSlcbiAgICAgICAuZWFjaChmdW5jdGlvbihkYXR1bSkgeyBkYXR1bS5heGlzUmVjdCA9IHRoaXM7IH0pXG5cbiAgICB0aGlzLmF4aXNUZXh0ID0gdGhpcy5heGlzR1xuICAgICAgLmFwcGVuZChcInRleHRcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmRcIilcbiAgICAgIC50ZXh0KGQgPT4gZC5sYWJlbClcbiAgICAgIC5zdHlsZShcImZvbnQtZmFtaWx5XCIsIFwic2Fucy1zZXJpZlwiKVxuICAgICAgLnN0eWxlKFwiZm9udC1zaXplXCIsIFwiMTFweFwiKVxuICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgICAgLmF0dHIoXCJkeVwiLCBcIjEuNWVtXCIpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCAoKSA9PiBcInRyYW5zbGF0ZSgwLCAtMTApXCIpXG4gICAgICAuYXR0cihcInhcIiwgZCAgPT4gZC5sYWJlbF94KVxuICAgICAgLmF0dHIoXCJ5XCIsIGQgID0+IGQubGFiZWxfeSlcbiAgICAgIC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdub25lJylcbiAgfVxuXG4gIHJlbmRlckFyZWEoKSB7XG4gICAgbGV0IHNlcmllcyA9IDA7XG4gICAgdGhpcy5hcmVhcyA9IHRoaXMuZGF0YS5tYXAoKHNlcmllcywgaW54KSA9PiBuZXcgQXJlYSh7XG4gICAgICBheGlzTWFwOiB0aGlzLmF4aXNNYXAsXG4gICAgICBzZXJpZXM6IHNlcmllcyxcbiAgICAgIGRyYXdpbmdDb250ZXh0OiB0aGlzLmRyYXdpbmdDb250ZXh0LFxuICAgICAgc2VyaWVzSWRlbnQ6IGlueCxcbiAgICAgIHNlcmllc0luZGV4OiBpbngsXG4gICAgICBhcmVhT3B0aW9uczogdGhpcy5vcHRzLmFyZWFcbiAgICAgIH0pKTtcbiAgICB0aGlzLmFyZWFzLmZvckVhY2goYXJlYSA9PiBhcmVhLnJlbmRlcigpKTtcbiAgfVxuXG4gIHJlbmRlckxlZ2VuZCgpIHtcbiAgICBjb25zdCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIGV4dHJhV2lkdGhYLFxuICAgICAgZXh0cmFXaWR0aFksXG4gICAgICB0cmFuc2xhdGVYLFxuICAgICAgdHJhbnNsYXRlWVxuICAgIH0gPSB0aGlzLm9wdHMuZGltcztcbiAgICBjb25zdCB7XG4gICAgICB3aWR0aDogbGVnZW5kV2lkdGgsXG4gICAgICBoZWlnaHQ6IGxlZ2VuZEhlaWdodCxcbiAgICAgIG1hcmdpblRvcFxuICAgIH0gPSB0aGlzLm9wdHMuZGltcztcbiAgICBjb25zdCB7b3B0c30gPSB0aGlzO1xuXG4gICAgdmFyIExlZ2VuZE9wdGlvbnMgPSBbJ1NtYXJ0cGhvbmUnLCdUYWJsZXQnXTtcbiAgICB2YXIgY29sb3JzY2FsZSA9IGQzLnNjYWxlT3JkaW5hbChkMy5zY2hlbWVBY2NlbnQpO1xuXG4gICAgdmFyIHN2ZyA9XG4gICAgICB0aGlzLnJvb3RTdmdcbiAgICAgIC5hcHBlbmQoJ3N2ZycpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoICsgZXh0cmFXaWR0aFgpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpXG5cbiAgICAvLyBNQUtFIFRIRVNFIENPTkZJR1VSQUJMRSAhIVxuXG4gICAgLy9DcmVhdGUgdGhlIHRpdGxlIGZvciB0aGUgbGVnZW5kXG4gICAgdmFyIHRleHQgPSBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRpdGxlXCIpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSg5MCwwKScpXG4gICAgICAuYXR0cihcInhcIiwgd2lkdGggIC0gNzApXG4gICAgICAuYXR0cihcInlcIiwgMTApXG4gICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjEycHhcIilcbiAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM0MDQwNDBcIilcbiAgICAgIC50ZXh0KFwiV2hhdCAlIG9mIG93bmVycyB1c2UgYSBzcGVjaWZpYyBzZXJ2aWNlIGluIGEgd2Vla1wiKTtcblxuICAgIC8vSW5pdGlhdGUgTGVnZW5kXG4gICAgdmFyIGxlZ2VuZCA9IHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGVnZW5kXCIpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBsZWdlbmRIZWlnaHQpXG4gICAgICAuYXR0cihcIndpZHRoXCIsIGxlZ2VuZFdpZHRoKVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoOTAsMjApJylcbiAgICAgIDtcblxuICAgIC8vQ3JlYXRlIGNvbG91ciBzcXVhcmVzXG4gICAgbGVnZW5kLnNlbGVjdEFsbCgncmVjdCcpXG4gICAgICAuZGF0YShMZWdlbmRPcHRpb25zKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInhcIiwgd2lkdGggIC0gNjUpXG4gICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24oZCwgaSl7IHJldHVybiBpICogMjA7fSlcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTApXG4gICAgICAuYXR0cihcImhlaWdodFwiLCAxMClcbiAgICAgIC5zdHlsZShcImZpbGxcIiwgZnVuY3Rpb24oZCwgaSl7IHJldHVybiBjb2xvcnNjYWxlKGkpO30pXG4gICAgICA7XG5cbiAgICAvL0NyZWF0ZSB0ZXh0IG5leHQgdG8gc3F1YXJlc1xuICAgIGxlZ2VuZC5zZWxlY3RBbGwoJ3RleHQnKVxuICAgICAgLmRhdGEoTGVnZW5kT3B0aW9ucylcbiAgICAgIC5lbnRlcigpXG4gICAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgLmF0dHIoXCJ4XCIsIHdpZHRoIC0gNTIpXG4gICAgICAuYXR0cihcInlcIiwgZnVuY3Rpb24oZCwgaSl7IHJldHVybiBpICogMjAgKyA5O30pXG4gICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjExcHhcIilcbiAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiM3MzczNzNcIilcbiAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0pXG4gICAgICA7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBjaGFydFxuICAgKi9cbiAgcmVtb3ZlKCkge1xuICAgIHRoaXMuYXJlYXMuZm9yRWFjaChhcmVhID0+IGFyZWEucmVtb3ZlKCkpO1xuICB9XG59XG5cblJhZGFyQ2hhcnQuUkFESUFOUyA9IDIgKiBNYXRoLlBJO1xuXG5leHBvcnQgZGVmYXVsdCBSYWRhckNoYXJ0O1xuIl0sIm5hbWVzIjpbIlFVQURfMSIsIlFVQURfMiIsIlFVQURfMyIsIlFVQURfNCIsIkF4aXMiLCJvcHRzIiwiYXhpc09wdGlvbnMiLCJheGlzSW5kZXgiLCJkcmFnQWN0aXZlIiwiYXhpc1RpY2tUZXh0RWxlbWVudHMiLCJjYWxjdWxhdGVBeGlzUGFyYW1ldGVycyIsImRpbXMiLCJ3aWR0aCIsImhlaWdodCIsIm1heEF4aXNObyIsImF4aXMiLCJSYWRhckNoYXJ0IiwiUkFESUFOUyIsIngxIiwieTEiLCJ4MiIsImZhY3RvciIsIk1hdGgiLCJzaW4iLCJ5MiIsImNvcyIsInF1YWQiLCJsYWJlbF94IiwiZmFjdG9yTGVnZW5kIiwibGFiZWxfeSIsImdyYWRpZW50IiwiYWJzIiwiSW5maW5pdHkiLCJiIiwicHJvamVjdENvcmRUb0F4aXMiLCJ4IiwieSIsIm1heFZhbHVlIiwidXNlR2xvYmFsTWF4IiwiYXhpc1ZhbHVlTWF4IiwiYXhpc0xlbmd0aCIsInNxcnQiLCJwb3ciLCJhbmdsZUZyb21Ob3J0aCIsIlBJIiwiYXhpc0lkIiwibGFiZWwiLCJwcm9qZWN0VmFsdWVPbkF4aXNYTXVsdFRlcm0iLCJwcm9qZWN0VmFsdWVPbkF4aXNZTXVsdFRlcm0iLCJwcm9qZWN0VmFsdWVPbkF4aXMiLCJ2YWx1ZSIsInBhcnNlRmxvYXQiLCJtYXgiLCJjb3JkT25BeGlzVG9WYWx1ZSIsImxlbiIsImZvckVhY2giLCJzZWxlY3QiLCJkIiwic3R5bGUiLCJ0cmFuc2l0aW9uIiwiQXJlYSIsImFyZ3MiLCJheGlzTWFwIiwiZGF0YSIsIl8iLCJjbG9uZURlZXAiLCJzZXJpZXMiLCJkcmF3aW5nQ29udGV4dCIsImNvbG9yIiwiZDMiLCJzY2FsZU9yZGluYWwiLCJzY2hlbWVBY2NlbnQiLCJzZXJpZXNJZGVudCIsInNlcmllc0luZGV4IiwiYXJlYU9wdGlvbnMiLCJjb2xvclNjYWxlIiwiY2lyY2xlUmFkaXVzIiwicG9pbnRzIiwibWFwIiwic3Bva2UiLCJwb2x5Z29uV3JhcHBlciIsInJlZHVjZSIsImFjYyIsInAiLCJjb3JkcyIsInJlbmRlckFyZWEiLCJyZW5kZXJDaXJjbGVzIiwic3ZnU3RyaW5nUmVwIiwiYXJlYSIsInJlbW92ZSIsInNlbGYiLCJ0aGlzUG9seWdvbiIsImF0dHIiLCJob3ZlckNpcmNsZU9wYWNpdHkiLCJzZWxlY3RBbGwiLCJoaWRkZW5BcmVhT3BhY2l0eSIsImhpZ2hsaWdodGVkQXJlYU9wYWNpdHkiLCJjaXJjbGVSZWYiLCJjaXJjbGVPdmVybGF5UmFkaXVzTXVsdCIsImRlZmF1bHRDaXJjbGVPcGFjaXR5IiwiZGVmYXVsdEFyZWFPcGFjaXR5IiwiZGF0dW0iLCJvblJlY3RNb3VzZU91dCIsIm9uUmVjdE1vdXNlT3ZlciIsImV2ZW50IiwibW91c2VYIiwibW91c2VZIiwibmV3WCIsIm5ld1kiLCJuZXdWYWx1ZSIsIm92ZXJsYXlSZWYiLCJ1cGRhdGVQb3NpdGlvbnMiLCJlbCIsInRoaXNQb2x5IiwiZW50ZXIiLCJhcHBlbmQiLCJ1c2VDb2xvclNjYWxlIiwibGluZUNvbG9yU2NhbGUiLCJhcmVhQ29sb3JTY2FsZSIsIm9uIiwiY3JlYXRlT25Nb3VzZU92ZXJQb2x5Z29uIiwiY3JlYXRlT25Nb3VzZU91dFBvbHlnb24iLCJjaXJjbGVzIiwiaiIsImVhY2giLCJjaXJjbGVPdmVyeWxheXMiLCJjYWxsIiwiZHJhZyIsInN1YmplY3QiLCJjcmVhdGVPbkRyYWdnaW5nQ2lyY2xlIiwiY3JlYXRlT25EcmFnRW5kQ2lyY2xlIiwiY3JlYXRlT25Nb3VzZU92ZXJDaXJjbGUiLCJjcmVhdGVNb3VzZU91dENpcmxjZSIsInRleHQiLCJyb290RWxlbWVudCIsIm9taXQiLCJjb25maWciLCJsZW5ndGgiLCJsZXZlbHMiLCJsZXZlbFJhZGl1cyIsIm1pbiIsImF4aXNDb25maWciLCJtYXhGcm9tRGF0YSIsImRhdGFTZXQiLCJvIiwiYXhpc1BhcmFtZXRlcnMiLCJpbngiLCJpeCIsImFyZWFzIiwicmVuZGVyQXhpcyIsInJlbmRlckxlZ2VuZCIsImV4dHJhV2lkdGhYIiwiZXh0cmFXaWR0aFkiLCJ0cmFuc2xhdGVYIiwidHJhbnNsYXRlWSIsInJvb3RTdmciLCJsdmxJbngiLCJsZXZlbHNObyIsImxldmVsRmFjdG9yIiwiaSIsIkZvcm1hdCIsImZvcm1hdCIsInoiLCJUb1JpZ2h0IiwicHVzaCIsImF4aXNHIiwiYXhpc0xpbmVzIiwicmVjdHMiLCJheGlzUmVjdCIsImF4aXNUZXh0IiwicmVuZGVyIiwibGVnZW5kV2lkdGgiLCJsZWdlbmRIZWlnaHQiLCJtYXJnaW5Ub3AiLCJMZWdlbmRPcHRpb25zIiwiY29sb3JzY2FsZSIsInN2ZyIsImxlZ2VuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7OztBQUlBLElBQU1BLFNBQVMsUUFBZjtBQUNBLElBQU1DLFNBQVMsUUFBZjtBQUNBLElBQU1DLFNBQVMsUUFBZjtBQUNBLElBQU1DLFNBQVMsUUFBZjs7SUFFTUM7Z0JBQ1FDLElBQVosRUFBa0JDLFdBQWxCLEVBQStCQyxTQUEvQixFQUEwQzs7O1NBQ25DRixJQUFMLEdBQVlBLElBQVo7U0FDS0UsU0FBTCxHQUFpQkEsU0FBakI7U0FDS0QsV0FBTCxHQUFtQkEsV0FBbkI7O1NBRUtFLFVBQUwsR0FBa0IsS0FBbEI7U0FDS0Msb0JBQUwsR0FBNEIsRUFBNUI7U0FDS0MsdUJBQUw7Ozs7OzhDQUd3QjtVQUNqQkwsSUFEaUIsR0FDZSxJQURmLENBQ2pCQSxJQURpQjtVQUNYRSxTQURXLEdBQ2UsSUFEZixDQUNYQSxTQURXO1VBQ0FELFdBREEsR0FDZSxJQURmLENBQ0FBLFdBREE7dUJBRUEsS0FBS0QsSUFBTCxDQUFVTSxJQUZWO1VBRWpCQyxLQUZpQixjQUVqQkEsS0FGaUI7VUFFVkMsTUFGVSxjQUVWQSxNQUZVO1VBR2pCQyxTQUhpQixHQUdKLEtBQUtULElBQUwsQ0FBVVUsSUFITixDQUdqQkQsU0FIaUI7d0JB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
