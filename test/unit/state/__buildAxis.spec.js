import DEFAULTS_OPTS from '../../fixtures/opts.js';
import axisConfig from '../../../test/fixtures/axisOptions.js';
import State from '../../../src/state/state.js';
import {STATE_DEFAULTS_OPTS} from '../../../src/state/state.js';
import * as _ from 'lodash';

const opts = DEFAULTS_OPTS();

test('__buildAxis', () => {
  const options = {
    data: [],
    dims: {
      width: 550,
      height: 500,
    },
    axis: {
      config: axisConfig,
    }
  };

  class MockedState extends State {
    __construct () {
      this.__calculateDimensions();
      this.__associateData();
      this.__buildAxis();
    }
  }

  let target = new MockedState(options)
  let state = target.__STATE__;

  const toOmit = [
    'axisLabelRotation',
    'projectValueOnAxis',
    'projectCordToAxis',
    'cordOnAxisToValue',
    'axisLabelCords',
    'axisTitleScale',
    'overLayx',
    'overLayy',
    'overLayHeight',
    'textlineSpacingPx',
    'tickScale',
    ///
    'axisLabelCordLop',
    'axisLabelFactorLop',
    'axisTitleSizeLop',
    'axisTitleSizeLopMin',
    'labelLineSpaceLopMin',
    'labelLineSpacingLop',
    'textLineSpacingPx',
    'tickFontLop'
  ];

  // Don't test the functions
  const propsToTest = _.omit(
    state.components.axis.con_1.props,
    toOmit
  );

  expect(propsToTest).toEqual({
    angleFromNorth: -91.51576136277995,
    axisId: 'con_1',
    axisLength: 189,
    currentTickSize: 11.136363636363637,
    overLayWidth: 111.36363636363637,
    scaledTickSize: 11.136363636363637,
    scaledTitleSize: 11.136363636363637,
    gradient: Infinity,
    label: 'Conscientiousness',
    labelX: 240.625,
    labelY: 47.25,
    lines: ['Conscientiousness'],
    maxValue: 4,
    minValue: 2,
    quad: 'QUAD_2',
    range: 2,
    words: [ 'Conscientiousness' ],
    x1: 240.625,
    x2: 240.625,
    y1: 236.25,
    y2: 47.25,
    zoomLines: [ 'Conscientiousness' ]
  });

  // Test projectCordToAxis
  const projectCordToAxis = state.components.axis.con_1.props.projectCordToAxis;
  const {x1, y1, x2, y2} = state.components.axis.con_1.props;
  expect(projectCordToAxis(x1, y1)).toEqual({x: x1, y: y1});

  // Test projectValueOnAxis
  const projectValueOnAxis = state.components.axis.con_1.props.projectValueOnAxis;
  const {minValue, maxValue} = state.components.axis.con_1.props;
  expect(projectValueOnAxis(minValue)).toEqual({x: x1, y: y1});
  expect(projectValueOnAxis(maxValue)).toEqual({x: x2, y: y2});

  // Test cordOnAxisToValue
  const cordOnAxisToValue = state.components.axis.con_1.props.cordOnAxisToValue;
  expect(cordOnAxisToValue(x1, y1)).toEqual(minValue);
  expect(cordOnAxisToValue(x2, y2)).toEqual(maxValue);

  // Test axisLabelCords
  const axisLabelCordLop = state.components.axis.con_1.props.axisLabelCordLop;
  // 1 is minZoom and 12 is maxZoom from the default options in state
  expect(axisLabelCordLop(1)).toEqual(4);
  expect(axisLabelCordLop(12)).toEqual(2);

  // Test axisLabelCords
  const axisLabelCords = state.components.axis.con_1.props.axisLabelCords;
  expect(axisLabelCords()).toEqual({x: x2, y: y2});
  expect(axisLabelCords(12)).toEqual({x: x1, y: y1});

  const stateDefaultOpts = STATE_DEFAULTS_OPTS();

  // Test axisTitleScale
  const axisTitleScale = state.components.axis.con_1.props.axisTitleScale;
  expect(axisTitleScale(100)).toEqual(stateDefaultOpts.axis.axisScaleProps.minTitleSize);
  expect(axisTitleScale(1200)).toEqual(stateDefaultOpts.axis.axisScaleProps.maxTitleSize);

  // Test overLayX
  const overLayx = state.components.axis.con_1.props.overLayx;
  const overLayWidth = state.components.axis.con_1.props.overLayWidth;
  expect(overLayx()).toEqual(axisLabelCords().x - overLayWidth / 2);

  // Test overLayX
  const overLayHeight = state.components.axis.con_1.props.overLayHeight;
  const lines = state.components.axis.con_1.props.lines;
  const width = state.calculatedDims.width;
  expect(overLayHeight()).toEqual(
   (1 + lines.length) * axisTitleScale(width) * 2
  );

  // Test textLineSpacingPx
  const textLineSpacingPx = state.components.axis.con_1.props.textLineSpacingPx;
  const axisScaleProps = state.opts.axis.axisScaleProps;
  expect(textLineSpacingPx(100)).toEqual(axisScaleProps.minTextLineSpacing);
  expect(textLineSpacingPx(1200)).toEqual(axisScaleProps.maxTextLineSpacing);

  const axisDatums = target.getAxisDatums();
  expect(axisDatums.length).toEqual(axisConfig.length);
});
