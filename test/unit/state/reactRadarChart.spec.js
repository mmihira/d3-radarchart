import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from 'enzyme';

import ReactRadarChart from 'reactRadarChart.js';

describe('<ReactRadarChart />', () => {
  const wrapper = props => shallow(<ReactRadarChart {...props} />);

  it('renders', () => {
    expect(
      wrapper({ data: [], axisConfig: [] }).find('.radarChartParentElement')
        .length
    ).toBe(1);
  });
});
