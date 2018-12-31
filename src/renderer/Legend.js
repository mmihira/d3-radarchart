import * as d3 from '../d3Wrapper/index';

class Legend {
  constructor (params) {
    Object.keys(params).forEach(key => {
      this[key] = params[key];
    });

    this.legendSvg = this.selectors.selectLegendSvg;
  }

  render () {
    if (!this.stateQuery.shouldRenderLegend()) {
      return 0;
    }

    const {
      height,
      width,
      legendW,
      legendOpts,
      legendDims,
      getAreaDatums
    } = this.legendRenderProps();

    const areaDatums = getAreaDatums();

    this.legendSvg()
      .append('text')
      .attr('class', 'legend-title')
      .attr('x', width - legendW * (1 + legendOpts.legendWOverlap))
      .attr('y', legendOpts.legendTopOffsetP * height)
      .text(legendOpts.title)
      .style('font-size', () => {
        if (legendOpts.scaleTextWithSize) {
          return legendOpts.titleScale(width) + 'px';
        }
        return legendOpts.titleProperties.fontSize + 'px';
      })
      .style('font-family', legendOpts.titleProperties['font-family'])
      .attr('fill', legendOpts.titleProperties.fill);

    const {
      setAreaLegendRect,
      setAreaLegendLabelLines,
      setAreaLegendRectOverlay
    } = this.stateSetters;

    this.selectors
      .selectLegendG()
      .selectAll('legend-rect')
      .data(areaDatums)
      .enter()
      .append('rect')
      .attr('class', d =>
        this.selectors.legendRectNameForSeries(d.props.seriesId)
      )
      .attr('x', width - legendW * (1 + legendOpts.legendWOverlap))
      .attr('y', (d, i) => i * legendDims.iconSpacing)
      .attr('width', legendDims.iconWidth)
      .attr('height', legendDims.iconHeight)
      .attr('opacity', 0.7)
      .style('fill', d => d.props.fillColor)
      .each(function (d) {
        setAreaLegendRect(d.props.seriesId, this);
      });

    // Create text next to squares
    this.selectors
      .selectLegendG()
      .selectAll('text')
      .data(areaDatums)
      .enter()
      .append('text')
      .text('')
      .each(function (d, z) {
        const lines = d.props.legendLabelLines;
        for (let i = 0; i < lines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr(
              'x',
              width -
                legendW *
                  (1 + legendOpts.legendWOverlap) *
                  legendOpts.textOffsetP
            )
            .attr('y', () => z * legendDims.iconSpacing + legendOpts.textYOffset)
            .attr('dy', () => legendOpts.labelTextLineSpacing(width) * i)
            .text(dd => dd.props.legendLabelLines[i])
            .style('font-size', () => {
              if (legendOpts.scaleTextWithSize) {
                return legendOpts.labelScale(width) + 'px';
              }
              return legendOpts.labelTextProperties.fontSize + 'px';
            })
            .style('font-family', legendOpts.labelTextProperties['font-family'])
            .attr('fill', legendOpts.labelTextProperties.fill)
            .attr('original-fill', legendOpts.labelTextProperties.fill)
            .each((dd) => {
              setAreaLegendLabelLines(dd.props.seriesId, this);
            });
        }
      });

    this.selectors
      .selectLegendG()
      .selectAll('legend-rect-overlays')
      .data(areaDatums)
      .enter()
      .append('rect')
      .attr('class', d =>
        this.selectors.legendRectOverlayClassName(d.props.seriesId)
      )
      .attr('x', width - legendW * (1 + legendOpts.legendWOverlap))
      .attr('y', (d, i) => i * legendDims.iconSpacing)
      .attr('width', legendW * (1 + legendOpts.legendWOverlap))
      .attr('height', legendDims.iconSpacing)
      .attr('opacity', 0.0)
      .on('mouseover', this.eventHandlerFactory.onLegendOver())
      .on('mouseout', this.eventHandlerFactory.onLegendOut())
      .each(function (d) {
        setAreaLegendRectOverlay(d.props.seriesId, this);
      });
    return 0;
  }

  removeLegend (seriesIds) {
    seriesIds.forEach(seriesId => {
      this.selectors
        .selectLegendOverlaysForSeries(seriesId)
        .on('mouseover', null)
        .on('mouseout', null);
    });

    this.selectors.selectLegendSvg().remove();
  }
}

export default Legend;
