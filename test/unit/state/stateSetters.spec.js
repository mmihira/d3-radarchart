import axisConfig from '../../../test/fixtures/axisOptions.js';
import State from '../../../src/state/state.js';
import {setters} from '../../../src/state/setters/index.js';

test('stateSetters', () => {
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

  let target = new State(options);

  expect(Object.keys(target.stateSetters)).toEqual(
    expect.arrayContaining(Object.keys(setters))
  );
});
