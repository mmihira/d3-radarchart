import merge from 'lodash.merge';

function createProps ({data, axisConfig, toMerge = {}}) {
  const props = {
    chartRootName: 'test1',
    width: 550,
    height: 500,
    showLegend: false,
    enableZoom: false,
    rootElementId: 'chart',
    data,
    axisConfig,
    options: {
      levels: {
        levelsNo: 3
      },
      legend: {
        title: 'Big 5'
      },
      axis: {
        onAxisLabelOver: null
      },
    }
  };

  return merge({}, props, toMerge);
}

export default createProps;
