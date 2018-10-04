import State from '../../../src/state/state.js';

test('__calculateDimensions', () => {
  const options = {
    dims: {
      width: 550,
      height: 500,
    }
  };

  class MockedState extends State {
    __construct () {
      this.__calculateDimensions();
    }
  }

  let target = new MockedState(options)
  let state = target.__STATE__;

  expect(state.calculatedDims).toEqual({
    chartContainerH: 472.5,
    chartContainerW: 481.25,
    height: 500,
    innerH: 378,
    innerPadding: 47.25,
    innerPaddingP: 0.1,
    innerW: 386.75,
    legendSpaceP: 0.1,
    legendW: 55,
    optsLeftChartOffset: 47.25,
    optsTopChartOffset: 47.25,
    paddingH: 13.75,
    paddingW: 13.75,
    translateXp: 0.05,
    translateYp: 0.05,
    width: 550,
    legendDims: {
      height: 100,
      iconHeight: 10,
      iconHeightP: 0.02,
      iconSpacing: 25,
      iconSpacingP: 0.05,
      iconWidth: 10,
      iconWidthP: 0.02,
      legendHeightP: 0.2,
      legendWidthP: 0.9,
      width: 49.5
    }
  });
});
