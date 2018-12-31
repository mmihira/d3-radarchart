import React from 'react';
import { ReactRadarChart } from '../../src/index.js';
import createProps from './data.js';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './app.scss';
import merge from 'lodash.merge';

class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      width: 550,
      height: 500,
      showLegend: false,
      options: {
        dims: {
          translateXp: 0.05,
          translateYp: 0.05,
          legendSpaceP: 0.1,
          innerPaddingP: 0.1
        },
        legend: {
          legendWidthP: 0.9,
          legendHeightP: 0.2,
          legendWOverlap: 1.1,
          legendTopOffsetP: 0.03,
          textYOffset: 9,
          textOffsetP: 0.75,
          iconHeightP: 0.02,
          iconWidthP: 0.02,
          iconSpacingP: 0.05,
          scaleTextWithSize: true
        },
        axis: {
          textOverflowWidthLimit: 10,
          rotateTextWithAxis: true,
        },
        area: {
          areaHighlight: false
        }
      }
    };
  }

  propContainerArea ({ key, name, min, max, step = 1 }) {
    return this.propContainerSlider({
      acc: () => this.state.options.area[key],
      onChange: val => {
        this.setState({
          options: merge(this.state.options, {
            area: merge(this.state.options.area, { [key]: val })
          })
        });
      },
      def: this.state.options.legend[key],
      name,
      min,
      max,
      step
    });
  }

  propContainerAxis ({ key, name, min, max, step = 1 }) {
    return this.propContainerSlider({
      acc: () => this.state.options.axis[key],
      onChange: val => {
        this.setState({
          options: merge(this.state.options, {
            axis: merge(this.state.options.axis, { [key]: val })
          })
        });
      },
      def: this.state.options.legend[key],
      name,
      min,
      max,
      step
    });
  }

  propContainerLegend ({ key, name, min, max, step = 1 }) {
    return this.propContainerSlider({
      acc: () => this.state.options.legend[key],
      onChange: val => {
        this.setState({
          options: merge(this.state.options, {
            legend: merge(this.state.options.legend, { [key]: val })
          })
        });
      },
      def: this.state.options.legend[key],
      name,
      min,
      max,
      step
    });
  }

  propContainerDims ({ key, name, min, max, step = 1 }) {
    return this.propContainerSlider({
      acc: () => this.state.options.dims[key],
      onChange: val => {
        this.setState({
          options: merge(this.state.options, {
            dims: merge(this.state.options.dims, { [key]: val })
          })
        });
      },
      def: this.state.options.dims[key],
      name,
      min,
      max,
      step
    });
  }

  propContainerSlider ({ acc, onChange, name, min, max, def, step = 1 }) {
    return (
      <div className="prop-container">
        <div className="description">{name}</div>
        <div className="current-val">{acc()}</div>
        <div className="slider-parent">
          <Slider
            min={min}
            max={max}
            onChange={onChange}
            step={step}
            defaultValue={def}
          />
        </div>
      </div>
    );
  }

  propContainerCheckBox ({ name, checked, onChange }) {
    return (
      <div className="prop-container">
        <div className="description">{name}</div>
        <div className="current-val" />
        <div className="slider-parent">
          <input type="checkbox" onChange={onChange} defaultChecked={checked} />
        </div>
      </div>
    );
  }

  render () {
    const options = createProps(this.state);
    return (
      <div className="container">
        <div className="left">
          {this.propContainerSlider({
            acc: () => this.state.width,
            onChange: val => this.setState({ width: val }),
            name: 'Width',
            min: 200,
            max: 800,
            def: this.state.width
          })}
          {this.propContainerSlider({
            acc: () => this.state.height,
            onChange: val => this.setState({ height: val }),
            name: 'Height',
            min: 200,
            max: 800,
            def: this.state.height
          })}
          {this.propContainerDims({
            key: 'translateXp',
            name: 'dims.translateXp',
            step: 0.001,
            min: 0,
            max: 0.5
          })}
          {this.propContainerDims({
            key: 'translateYp',
            name: 'dims.translateYp',
            step: 0.001,
            min: 0,
            max: 0.5
          })}
          {this.propContainerDims({
            key: 'legendSpaceP',
            name: 'dims.legendSpaceP',
            step: 0.001,
            min: 0,
            max: 0.5
          })}
          {this.propContainerDims({
            key: 'innerPaddingP',
            name: 'dims.innerPaddingP',
            step: 0.001,
            min: 0,
            max: 0.5
          })}
          {this.propContainerCheckBox({
            name: 'showLegend',
            checked: this.state.options.showLegend,
            onChange: () =>
              this.setState({
                showLegend: !this.state.showLegend
              })
          })}

          {this.propContainerCheckBox({
            name: 'legend.scaleTextWithSize',
            checked: this.state.options.legend.scaleTextWithSize,
            onChange: () => {
              this.setState({
                options: merge(this.state.options, {
                  legend: merge(this.state.options.legend, {
                    scaleTextWithSize: !this.state.options.legend
                      .scaleTextWithSize
                  })
                })
              });
            }
          })}
          {this.propContainerLegend({
            key: 'legendWidthP',
            name: 'legend.legendWidthP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerLegend({
            key: 'legendHeightP',
            name: 'legend.legendHeightP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerLegend({
            key: 'legendWOverlap',
            name: 'legend.legendWOverlap',
            step: 0.001,
            min: 0,
            max: 5
          })}
          {this.propContainerLegend({
            key: 'legendTopOffsetP',
            name: 'legend.legendTopOffsetP',
            step: 0.001,
            min: 0,
            max: 5
          })}
          {this.propContainerLegend({
            key: 'textYOffset',
            name: 'legend.textYOffset',
            step: 0.001,
            min: 0,
            max: 50
          })}
          {this.propContainerLegend({
            key: 'textOffsetP',
            name: 'legend.textOffsetP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerLegend({
            key: 'iconHeightP',
            name: 'legend.iconHeightP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerLegend({
            key: 'iconWidthP',
            name: 'legend.iconWidthP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerLegend({
            key: 'iconSpacingP',
            name: 'legend.iconSpacingP',
            step: 0.001,
            min: 0,
            max: 1
          })}
          {this.propContainerCheckBox({
            name: 'axis.rotateTextWithAxis',
            checked: this.state.options.axis.rotateTextWithAxis,
            onChange: () => {
              this.setState({
                options: merge(this.state.options, {
                  axis: merge(this.state.options.axis, {
                    rotateTextWithAxis: !this.state.options.axis
                      .rotateTextWithAxis
                  })
                })
              });
            }
          })}
          {this.propContainerAxis({
            key: 'textOverflowWidthLimit',
            name: 'legend.textOverflowWidthLimit',
            step: 0.1,
            min: 0,
            max: 30
          })}
          {this.propContainerAxis({
            key: 'textLineSpacingPx',
            name: 'legend.textLineSpacingPx',
            step: 0.1,
            min: 0,
            max: 20
          })}
          {this.propContainerCheckBox({
            name: 'area.areaHighlight',
            checked: this.state.options.area.areaHighlight,
            onChange: () => {
              this.setState({
                options: merge(this.state.options, {
                  area: merge(this.state.options.area, {
                    areaHighlight: !this.state.options.area
                      .areaHighlight
                  })
                })
              });
            }
          })}
        </div>
        <div className="right">
          <ReactRadarChart
            rootElementProps={{ className: 'chartRootClass' }}
            {...options}
          />
        </div>
      </div>
    );
  }
}

export default App;
