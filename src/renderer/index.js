import * as d3 from '../d3Wrapper/index';
import Axis from './Axis.js';
import Area from './Area.js';
import Legend from './Legend.js';

class Renderer {
  constructor (props) {
    Object.keys(props).forEach(key => {
      this[key] = props[key];
    });

    this.rootElement = props.rootElement || document.getElementById(props.rootElementId);
    this.axisRender = new Axis(Object.assign({}, props));
    this.areaRender = new Area(Object.assign({}, props));
    this.legendRender = new Legend(Object.assign({}, props));
  }

  renderAxis (props, datums) {
    this.axisRender.render(props, datums);
    return this;
  }

  renderArea (props, datums) {
    this.areaRender.render(props, datums);
    return this;
  }

  renderLegend () {
    this.legendRender.render();
    return this;
  }

  /**
   * Initaliase the radar chart with the root svg
   * Only call this function once.
   * @param initProperties
   */
  init (initProperties) {
    const {
      width,
      height,
      paddingH,
      paddingW,
      backgroundColor,
      legendDims,
      legendOpts
    } = initProperties;

    const rootSvg = d3
      .select(this.rootElement)
      .append('svg')
      .style('background', backgroundColor)
      .attr('width', width)
      .attr('height', height);

    const rootG = rootSvg
      .append('g')
      .attr('class', this.selectors.rootIdent().aStr)
      .attr('transform', 'translate(' + paddingW + ',' + paddingH + ')');

    const legendSvg = rootSvg
      .append('svg')
      .attr('class', this.selectors.legendSvgId())
      .attr('width', width)
      .attr('height', height);

    const legendG = legendSvg
      .append('g')
      .attr('class', this.selectors.legendGId())
      .attr('height', legendDims.height)
      .attr('width', legendDims.width)
      .attr(
        'transform',
        'translate(0,' + legendOpts.legendTopOffsetP * height * 2 + ')'
      );

    if (this.stateQuery.zoomEnabled()) {
      const zoomProps = this.stateQuery.zoomProps();

      const zoom = d3.zoom();
      zoom
        .on('zoom', this.eventHandlerFactory.zoomHandler(zoom))
        .translateExtent([[0, 0], [width, height]])
        .scaleExtent([
          zoomProps.scaleExtent.minZoom,
          zoomProps.scaleExtent.maxZoom
        ]);

      rootSvg.call(zoom);
    }

    this.stateSetters.setRootElements({
      rootSvg: rootSvg,
      rootG: rootG,
      legendSvg: legendSvg,
      legendG: legendG
    });

    return this;
  }
}

export default Renderer;
