import DEFAULTS_OPTS from '../../fixtures/opts.js';
import series from '../../fixtures/series.js';
import axisConfig from '../../../test/fixtures/axisOptions.js';
import State from '../../../src/state/state.js';
import omit from 'lodash.omit';

const opts = DEFAULTS_OPTS();

test('__buildArea - props', () => {
  const options = {
    data: series,
    dims: {
      width: 550,
      height: 500
    },
    axis: {
      config: axisConfig
    }
  };

  class MockedState extends State {
    __construct () {
      this.__calculateDimensions();
      this.__associateData();
      this.__buildAxis();
      this.__buildArea();
    }
  }

  const target = new MockedState(options);
  const state = target.__STATE__;
  const toOmit = ['areaLineLop', 'circleRadiusLop', 'fontLop'];

  // Don't test the functions
  const propsToTest = omit(state.components.areas.nor_1.props, toOmit);

  expect(propsToTest).toEqual({
    fillColor: 'royalblue',
    seriesId: 'nor_1',
    series: series.find(e => e.seriesId === 'nor_1'),
    seriesInx: 0,
    legendLabelLines: ['Normie']
  });
});

test('__buildArea - state', () => {
  const options = {
    data: series,
    dims: {
      width: 550,
      height: 500
    },
    axis: {
      config: axisConfig
    }
  };

  class MockedState extends State {
    __construct () {
      this.__calculateDimensions();
      this.__associateData();
      this.__buildAxis();
      this.__buildArea();
    }
  }

  const target = new MockedState(options);
  const state = target.__STATE__;
  const toOmit = [];

  // Don't test the functions
  const stateToTest = omit(state.components.areas.nor_1.state, toOmit);

  // Point Axis id order
  expect(stateToTest.points.map(e => e.axisId)).toEqual(
    axisConfig.map(e => e.axisId)
  );

  // Point cords
  expect(stateToTest.points.map(e => e.cords)).toEqual([
    {
      x: 240.625,
      y: 66.50000000000001
    },
    {
      x: 222.25772102904986,
      y: 231.62867710687598,
    },
    {
      x: 161.16378120571125,
      y: 345.099260251868,
    },
    {
      x: 308.73461610939034,
      y: 329.727937358744,
    },
    {
      x: 332.4613948547508,
      y: 208.14338553438
    }
  ]);

  // Point values
  expect(stateToTest.points.map(e => e.value)).toEqual([
    3.8,
    0.1,
    0.7,
    0.6,
    0.5
  ]);

  // areaLineLop
  const areaLineLop = state.components.areas.nor_1.props.areaLineLop;
  expect(areaLineLop(1)).toEqual(opts.area.lineProps.strokeWidth);
  expect(areaLineLop(opts.zoomProps.scaleExtent.maxZoom)).toEqual(
    opts.area.lineProps.maxZoomStroke
  );

  // circleRadiusLop
  const circleRadiusLop = state.components.areas.nor_1.props.circleRadiusLop;
  expect(circleRadiusLop(1)).toEqual(opts.area.circleProps.defaultRadius);
  expect(circleRadiusLop(opts.zoomProps.scaleExtent.maxZoom)).toEqual(
    opts.area.circleProps.maxZoomRadius
  );

  // fontLop
  const fontLop = state.components.areas.nor_1.props.fontLop;
  expect(fontLop(1)).toEqual(opts.area.labelProps.fontSize);
  expect(fontLop(opts.zoomProps.scaleExtent.maxZoom)).toEqual(
    opts.area.labelProps.maxFontSize
  );

  const areaDatums = target.getAreaDatums();
  expect(areaDatums.length).toEqual(series.length);
});
