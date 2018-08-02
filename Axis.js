class Axis {
  constructor(opts, axisOptions, axisIndex) {
    this.opts = opts;
    const {width, height} = this.opts.dims;
    const {maxAxisNo} = this.opts.axis;
    const {RADIANS} = RadarChart;

    this.tickTexts = [];




    const x1 = width / 2;
    const y1 = height / 2;
    const x2 = width / 2 * (1 - opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo));
    const y2 = height / 2 * (1 - opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo));


    this.maxValue = opts.axis.useGlobalMax ? opts.axis.maxValue : axisOptions.maxValue;
    const label_x = (width / 2) * (1 - opts.factorLegend * Math.sin(axisIndex * RADIANS/maxAxisNo)) - 60 * Math.sin(axisIndex * RADIANS/maxAxisNo);
    const label_y = (height / 2) * (1 - Math.cos(axisIndex * RADIANS/maxAxisNo)) - 20 * Math.cos(axisIndex * RADIANS/maxAxisNo);

    const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
    const b = gradient === Infinity ? 0 : y2 - gradient * x2;

    const projectCordToAxis = function(x, y) {
      if (gradient === Infinity) {
        return {x: x1, y: y};
      } else {
        return {x: x, y: gradient * x + b};
      }
    };

    this.axisLength = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2));
    this.angleFromNorth = (180 / Math.PI) * (1 - axisIndex * RADIANS/maxAxisNo) - (180/Math.PI) - 90 - (180/Math.PI * 10/this.axisLength/2);

    this.axis = axisOptions.axisId,
    this.label = axisOptions.label ? axisOptions.label : axisOptions.axisId;

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.label_x = label_x;
    this.label_y = label_y;

    this.projectCordToAxis = projectCordToAxis;
    this.projectValueOnAxis = function(value) {
      return {
        x: width / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * opts.factor * Math.sin(axisIndex * RADIANS / maxAxisNo)),
        y: height / 2 * (1 - (parseFloat(Math.max(value, 0)) / this.maxValue) * opts.factor * Math.cos(axisIndex * RADIANS / maxAxisNo)),
      };
    }
  }

  onRectMouseOver() {
    this.tickTexts.forEach(d => {
      d3.select(d)
        .style('opacity', 0.9);
    });
  }

  onRectMouseOut() {
    this.tickTexts.forEach(d => {
      d3.select(d)
        .transition(200)
        .style('opacity', 0.0);
    });
  }
}
