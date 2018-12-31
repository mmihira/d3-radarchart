import React from 'react';
import RadarChart from './radarChart.js';
import PropTypes from 'prop-types';
import merge from 'lodash.merge';

class ReactRadarChart extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    this.chart = new RadarChart(this.constructOptions(this.props));
    this.chart.render();
  }

  shouldComponentUpdate (nextProps) {
    this.chart.delete();
    this.chart = new RadarChart(this.constructOptions(nextProps));
    this.chart.render();
    return false;
  }

  constructOptions (props) {
    return merge(
      {
        enableZoom: props.enableZoom,
        chartRootName: props.chartRootName,
        data: props.data,
        dims: {
          width: props.width,
          height: props.height,
        },
        showLegend: props.showLegend,
        rootElement: this.chartEl,
        axis: {
          config: props.axisConfig
        }
      },
      props.options
    );
  }

  render () {
    const { rootElementProps } = this.props;

    return (
      <div
        {...rootElementProps}
        ref={el => {
          this.chartEl = el;
        }}>
      </div>
    );
  }
}

ReactRadarChart.propTypes = {
  rootElementProps: PropTypes.object,
  chartRootName: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  enableZoom: PropTypes.bool,
  data: PropTypes.array.isRequired,
  axisConfig: PropTypes.array.isRequired,
  options: PropTypes.object
};

ReactRadarChart.defaultProps = {
  enableZoom: false,
  width: 550,
  height: 500,
  showLegend: true,
};
export default ReactRadarChart;
