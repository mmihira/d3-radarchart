import * as d3 from 'd3';
import {AREA_EVENT} from '../const.js';

class Axis {
  constructor (params) {
    for (let key in params) {
      this[key] = params[key];
    }

    this.drawingContext = this.selectors.drawingContext;

    this.circularSegmentClass = d => `${this.chartRootName}${d.axisId}csegline`;
    this.axisOverlayRectClassName = d => `${this.chartRootName}${d.axisId}axisoverlayrect`;
    this.axisLabelParentClassName = d => `${this.chartRootName}${d.axisId}axislabelparent`;
  }

  render (axisRenderProps, datums) {
    const {
      width,
      levels,
      lineProps,
      ticksAttr,
      axisLabelProps,
      rotateTextWithAxis,
      wheelLabelAreaId
    } = axisRenderProps;

    const cEventHandler = this.eventHandlerFactory.createAreaEventHandler;

    // Circular segments
    for (let lvlInx = 0; lvlInx < levels.levelsFractions.length; lvlInx++) {
      const { levelsFractions } = levels;
      this.drawingContext()
        .selectAll('.levels')
        .data(datums)
        .enter()
        .append('svg:line')
        .attr('x1', (d, i) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y1', (d, i) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('x2', (d, i) => {
          let nxtInx = i + 1 === datums.length ? 0 : (i + 1);
          let nAxis = datums[nxtInx];
          let nValue = nAxis.range * levelsFractions[lvlInx] + nAxis.minValue;
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.x;
        })
        .attr('y2', (d, i) => {
          let nxtInx = i + 1 === datums.length ? 0 : (i + 1);
          let nAxis = datums[nxtInx];
          let nValue = nAxis.range * levelsFractions[lvlInx] + nAxis.minValue;
          let nCordAxis = nAxis.projectValueOnAxis(nValue);
          return nCordAxis.y;
        })
        .attr('class', (d) => this.circularSegmentClass(d))
        .style('stroke', '#DCDCDC')
        .style('stroke-opacity', '0.75')
        .style('stroke-width', '0.3px');
    }

    var Format = d3.format('.2%');
    const { setAxisPerecentLevelForAxis } = this.stateSetters;
    // Text indicating at what % each level is
    for (let lvlInx = 0; lvlInx < levels.levelsFractions.length; lvlInx++) {
      const { levelsFractions } = levels;

      this.drawingContext()
        .selectAll('.levels')
        .data(datums)
        .enter()
        .append('svg:text')
        .attr('x', (d) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.x;
        })
        .attr('y', (d) => {
          let tickValue = d.range * levelsFractions[lvlInx] + d.minValue;
          let cordsOnAxis = d.projectValueOnAxis(tickValue);
          return cordsOnAxis.y;
        })
        .attr('class', 'legend')
        .style('font-family', ticksAttr['font-family'])
        .style('font-size', d => d.scaledTickSize + 'px')
        .style('opacity', 0.0)
        .attr('fill', ticksAttr['fill'])
        .text(d => Format(levelsFractions[lvlInx]))
        .each(function (d) {
          setAxisPerecentLevelForAxis(d.axisId, this);
        });
    }

    const axisLineGs = this.drawingContext()
      .selectAll('.axis')
      .data(datums)
      .enter()
      .append('g');

    const { setAxisLineElForAxis } = this.stateSetters;
    axisLineGs
      .append('line')
      .attr('class', 'axisline')
      .attr('x1', d => d.x1)
      .attr('y1', d => d.y1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('pointer-events', 'none')
      .style('stroke', lineProps.fill)
      .style('stroke-opacity', 0.75)
      .style('stroke-width', '0.3px')
      .each(function (d) {
        setAxisLineElForAxis(d.axisId, this);
      });

    const { setAxisOverlayRectForAxis } = this.stateSetters;
    axisLineGs
      .append('rect')
      .attr('class', (d) => this.axisOverlayRectClassName(d))
      .attr('x', d => d.x1)
      .attr('y', d => d.y1)
      .attr('transform', (d, i) => 'rotate(' + d.angleFromNorth + ',' + d.x1 + ',' + d.y1 + ')')
      .attr('width', d => d.axisLength)
      .attr('height', 10)
      .attr('fill-opacity', 0.0)
      // .on('mouseover', d => d.onAxisLineRectOver())
      // .on('mouseout', d => d.onAxisLineRectMouseOut())
      .each(function (d) {
        setAxisOverlayRectForAxis(d.axisId, this);
      });

    const {
      addLabelLineForAxis,
      addZoomedLabelLinesForAxis,
      setAxisLabelParentForAxis,
      setLabelValueForAxis
    } = this.stateSetters;

    axisLineGs
      .append('text')
      .attr('class', d => this.axisLabelParentClassName(d))
      .attr('pointer-events', 'none')
      .attr('transform', (d, i) => {
        if (rotateTextWithAxis) {
          return 'rotate(' + d.axisLabelRotation() + ',' + d.x2 + ',' + d.y2 + ')';
        } else {
          return '';
        }
      })
      .text('')
      .each(function (d) {
        setAxisLabelParentForAxis(d.axisId, this);
        let lines = d.lines;
        for (let i = 0; i < lines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', d => d.axisLabelCords().x)
            .attr('y', d => d.axisLabelCords().y)
            .attr('dy', d => {
              return d.textLineSpacingPx(width) * i;
            })
            .text(lines[i])
            .style('font-family', axisLabelProps['font-family'])
            .style('font-size', d => d.axisTitleScale(width) + 'px')
            .style('fill', axisLabelProps['fill'])
            .attr('text-anchor', 'middle')
            .each(function (d) {
              addLabelLineForAxis(d.axisId, this);
            });
        }

        // Label value
        d3.select(this)
          .append('tspan')
          .attr('x', d => d.axisLabelCords().x)
          .attr('y', d => d.axisLabelCords().y)
          .attr('dy', d => {
            return d.textLineSpacingPx(width) * d.lines.length;
          })
          .text('')
          .style('font-family', axisLabelProps['font-family'])
          .style('font-size', d => d.axisTitleScale(width) + 'px')
          .style('fill', axisLabelProps['value-fill'])
          .attr('text-anchor', 'middle')
          .each(function (d) {
            setLabelValueForAxis(d.axisId, this);
          });

        // Zoom label text
        for (let i = 0; i < d.zoomLines.length; i++) {
          d3.select(this)
            .append('tspan')
            .attr('x', d => d.axisLabelCords().x)
            .attr('y', d => d.axisLabelCords().y)
            .attr('dy', d => {
              return d.textLineSpacingPx(width) * i;
            })
            .text(d.zoomLines[i])
            .style('font-family', axisLabelProps['font-family'])
            .style('font-size', d => d.axisTitleScale(width) + 'px')
            .style('fill', axisLabelProps['fill'])
            .style('fill-opacity', 0.0)
            .attr('text-anchor', 'middle')
            .each(function (d) {
              addZoomedLabelLinesForAxis(d.axisId, this);
            });
        }
      });

    axisLineGs
      .append('rect')
      .attr('class', d => this.selectors.axisTextOverlayClassName(d.axisId))
      .attr('x', d => d.overLayx())
      .attr('y', d => d.overLayy())
      .attr('width', d => d.overLayWidth)
      .attr('height', d => d.overLayHeight())
      .attr('fill-opacity', 0.0)
      .attr('transform', (d, i) => {
        if (rotateTextWithAxis) {
          return 'rotate(' + d.axisLabelRotation() + ',' + d.x2 + ',' + d.y2 + ')';
        } else {
          return '';
        }
      })
      .on('wheel',
        (() => {
          if (wheelLabelAreaId) {
            return cEventHandler(AREA_EVENT.CIRCLE_WHEEL_SCROLL, wheelLabelAreaId);
          }
        })()
      )
      .on('mouseover', this.eventHandlerFactory.onAxisLabelOver())
      .on('mouseout', this.eventHandlerFactory.onAxisLabelOut());
  }

  removeAxis (axisIds) {
    axisIds.forEach(axisId => {
      this.selectors.selectAxisTextForAxis(axisId)
        .on('wheel', null)
        .on('mouseover', null)
        .on('mouseout', null);
    });
  }
}

export default Axis;
