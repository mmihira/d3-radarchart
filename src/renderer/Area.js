import * as d3 from 'd3';
import {AREA_EVENT} from '../const.js';

class Area {
  constructor (params) {
    for (let key in params) {
      this[key] = params[key];
    }

    this.drawingContext = this.selectors.drawingContext;
  }

  render (areaRenderProps, datums) {
    const {
      areaHighlightProps,
      circleProps,
      lineProps,
      labelProps,
      hoverCircleOpacity,
      defaultCircleOpacity
    } = this.areaRenderProps();

    var Format = d3.format('.2');
    const {
      setAreaCircleRef,
      setAreaCircleOverlayRef,
      setAreaPolygonRef
    } = this.stateSetters;

    const cEventHandler = this.eventHandlerFactory.createAreaEventHandler;

    this.drawingContext()
      .selectAll(this.selectors.polygonDefaultName())
      .data(datums)
      .enter()
      .append('polygon')
      .attr('class', d => this.selectors.polygonClassName(d.props.seriesId))
      .style('stroke-width', lineProps.strokeWidth + 'px')
      .style('stroke', d => d.props.fillColor)
      .style('stroke-opacity', areaHighlightProps.defaultStrokeOpacity)
      .attr('points', d => d.state.svgStringRep)
      .style('fill', d => d.props.fillColor)
      .style('fill-opacity', d => d.state.currentAreaOpacity)
      .each(function (d) { setAreaPolygonRef(d.props.seriesId, this); })
      .each(d => {
        this.drawingContext()
          .selectAll('.polygon-labels')
          .data(d.state.points)
          .enter()
          .append('svg:text')
          .text(f => Format(f.value))
          .attr('x', f => f.cords.x)
          .attr('y', f => f.cords.y)
          .attr('class', f => this.selectors.polygonVertextClassNames(d.props.seriesId))
          .style('font-family', labelProps['font-family'])
          .style('font-size', labelProps.fontSize + 'px')
          .style('opacity', f => {
            return this.stateQuery.isDragActiveForArea(f.seriesId) ? 1.0 : areaHighlightProps.defaultLabelOpacity;
          });

        if (d.props.series.showCircle) {
          this.drawingContext()
            .selectAll(this.selectors.circleClassDefaultName())
            .data(d.state.points)
            .enter()
            .append('svg:circle')
            .attr('r', f => {
              return f.dragActive ? circleProps.circleOverlayRadiusMult * circleProps.defaultRadius : circleProps.defaultRadius;
            })
            .attr('alt', function (f) { return Math.max(f.value, 0); })
            .attr('cx', f => f.cords.x)
            .attr('cy', f => f.cords.y)
            .attr('class', f => this.selectors.circleClassName(f.seriesId))
            .style('fill', d.props.fillColor)
            .style('fill-opacity', f => {
              return this.stateQuery.isDragActiveForArea(f.seriesId) ? hoverCircleOpacity : defaultCircleOpacity;
            })
            .each(function (f) {
              setAreaCircleRef(d.props.seriesId, this);
              f.circleRef = this;
            });

          let circleOverlays = this.drawingContext()
            .selectAll('circle-overlays')
            .data(d.state.points)
            .enter()
            .append('svg:circle')
            .attr('r', circleProps.defaultRadius * circleProps.circleOverlayRadiusMult)
            .attr('cx', f => f.cords.x)
            .attr('cy', f => f.cords.y)
            .attr('opacity', 0.0)
            .attr('class', f => this.selectors.circleOverlayClassName(f.seriesId))
            .attr('pointer-events', 'all')
            .each(function () { setAreaCircleOverlayRef(d.props.seriesId, this); });

          if (d.props.series.circleHighlight) {
            circleOverlays
              .on('mouseover', cEventHandler(AREA_EVENT.CIRCLE_ENTER, d.props.seriesId))
              .on('mouseout', cEventHandler(AREA_EVENT.CIRCLE_LEAVE, d.props.seriesId));
          }

          if (d.props.series.dragEnabled) {
            circleOverlays
              .call(d3.drag()
                .subject(function (d) { return this; })
                .on('start', cEventHandler(AREA_EVENT.DRAGGING_START, d.props.seriesId))
                .on('drag', cEventHandler(AREA_EVENT.DRAGGING, d.props.seriesId))
                .on('end', cEventHandler(AREA_EVENT.DRAGGING_END, d.props.seriesId))
              );
          }
        }
      });
  }

  removeAreaForSeries (seriesId) {
    this.selectors
      .selectPolygonForSeries(seriesId)
      .data([])
      .exit()
      .remove();

    this.selectors
      .selectAllCirclesForSeries(seriesId)
      .data([])
      .exit()
      .remove();

    this.selectors
      .selectAllCircleOverlaysForSeries(seriesId)
      .on('mouseover', null)
      .on('mouseout', null)
      .on('start', null)
      .on('drag', null)
      .on('end', null);

    this.selectors
      .selectAllCircleOverlaysForSeries(seriesId)
      .data([])
      .exit()
      .remove();

    this.selectors
      .selectPolyVertexLabelForSeries(seriesId)
      .data([])
      .exit()
      .remove();
  }

  removeArea (seriesIds) {
    seriesIds.forEach(seriesId => { this.removeAreaForSeries(seriesId); });
  }
}

export default Area;
