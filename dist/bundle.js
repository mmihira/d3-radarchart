!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("d3"),require("lodash")):"function"==typeof define&&define.amd?define(["d3","lodash"],e):t.RadarChart=e(t.d3,t._)}(this,function(h,u){"use strict";var t,e,i,a,s,p="DRAGGING",r="CIRCLE_LEAVE_WHILE_DRAGGING",o="CIRCLE_HOVER",l="NEUTRAL",c="CIRCLE_ENTER",d="CIRCLE_LEAVE",f="DRAGGING_START",g="DRAGGING",x="DRAGGING_END",m=(t=!!window.opr&&!!window.opr.addons||!!window.opera||0<=navigator.userAgent.indexOf(" OPR/"),e="undefined"!=typeof InstallTrigger,i=!!document.documentMode,a=!i&&!!window.StyleMedia,s=!!window.chrome&&!!window.chrome.webstore,{isOpera:t,isFirefox:e,isIE:i,isEdge:a,isChrome:s,isBlink:(s||t)&&!!window.CSS}),O=2*Math.PI,n=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},y=function(){function a(t,e){for(var i=0;i<e.length;i++){var a=e[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}return function(t,e,i){return e&&a(t.prototype,e),i&&a(t,i),t}}(),P="QUAD_1",A="QUAD_2",v=function(){function a(t,e,i){n(this,a),this.opts=t,this.axisIndex=i,this.axisOptions=e,this.dragActive=!1,this.axisTickTextElements=[],this.calculateAxisParameters(),t.axis.tickScale?this.tickScale=t.axis.tickScale:this.tickScale=h.scaleLinear().domain([100,1200]).range([5,20]),t.axis.axisTitleScale?this.axisTitleScale=t.axis.tickScale:this.axisTitleScale=h.scaleLinear().domain([100,1200]).range([5,23]),this.scaledTickSize=this.tickScale(this.opts.dims.width),this.currentTickSize=this.tickScale(this.opts.dims.width),this.tickFontLop=h.scaleLog().domain([this.opts.zoomProps.scaleExtent.minZoom,this.opts.zoomProps.scaleExtent.maxZoom]).range([this.scaledTickSize,this.opts.axis.ticks.maxZoomFont])}return y(a,[{key:"onZoom",value:function(t){var e=this;this.currentTickSize=this.tickFontLop(t),this.axisTickTextElements.forEach(function(t){h.select(t).style("font-size",e.currentTickSize)})}},{key:"calculateAxisParameters",value:function(){var i=this,t=this.opts,e=this.axisIndex,a=this.axisOptions,s=this.opts.dims,n=s.innerW,r=s.innerH,o=s.optsLeftChartOffset,l=s.optsTopChartOffset,c=this.opts.axis.maxAxisNo,h=o+n/2,u=l+r/2,p=o+n/2*(1-Math.sin(e*O/c)),d=l+r/2*(1-Math.cos(e*O/c));p<h&&d<=u?this.quad=P:h<=p&&d<=u?this.quad=A:p<=h&&u<=d?this.quad="QUAD_3":h<=p&&u<=d&&(this.quad="QUAD_4");var f=n/2*(1-t.axis.leftOffsetPLabel*Math.sin(e*O/c))-60*Math.sin(e*O/c)+o,g=r/2*(1-Math.cos(e*O/c))-20*Math.cos(e*O/c)+l,x=Math.abs(p-h)<1e-9?1/0:(d-u)/(p-h),m=x===1/0?0:d-x*p;this.gradient=x;this.maxValue=t.axis.useGlobalMax?t.axis.maxValue:a.axisValueMax,this.axisLength=Math.sqrt(Math.pow(p-h,2)+Math.pow(d-u,2)),this.angleFromNorth=180/Math.PI*(1-e*O/c)-180/Math.PI-90-180/Math.PI*10/this.axisLength/2,this.axis=a.axisId,this.label=a.label?a.label:a.axisId,this.opts.axis.textOverflow&&(this.textLineSpacingPx=this.opts.axis.textLineSpacingPx,this.labelLines=[],this.words=this.label.split(" "),this.lines=[this.words[0]],this.lines=this.words.slice(1).reduce(function(t,e){return t[t.length-1].length+e.length<=i.opts.axis.textOverflowWidthLimit?t[t.length-1]=t[t.length-1]+" "+e:t.push(e),t},this.lines)),this.x1=h,this.y1=u,this.x2=p,this.y2=d,this.labelX=f,this.labelY=g;var y=Math.sin(e*O/c),v=Math.cos(e*O/c);this.projectCordToAxis=function(t,e){return x===1/0?{x:h,y:e}:x<-2||0<=x||x<.145?{x:t,y:x*t+m}:{x:(e-m)/x,y:e}},this.projectValueOnAxis=function(t){return{x:o+n/2*(1-parseFloat(Math.max(t,0))/this.maxValue*y),y:l+r/2*(1-parseFloat(Math.max(t,0))/this.maxValue*v)}},this.cordOnAxisToValue=function(t,e){if(this.gradient===1/0){var i=Math.abs(this.y2-e);return(this.axisLength-i)*this.maxValue/this.axisLength}if(0<=this.gradient&&this.gradient<1e-8){var a=Math.abs(this.x2-t);return(this.axisLength-a)*this.maxValue/this.axisLength}return(2*(t-o)/n-1)*(this.maxValue/y)*-1}}},{key:"onRectMouseOver",value:function(){if(this.dragActive)return!1;this.axisTickTextElements.forEach(function(t){h.select(t).style("opacity",.9)})}},{key:"onRectMouseOut",value:function(){if(this.dragActive)return!1;this.axisTickTextElements.forEach(function(t){h.select(t).transition(200).style("opacity",0)})}}]),a}(),S=function(){function a(t){var i=this;n(this,a),this.axisMap=t.axisMap,this.series=u.cloneDeep(t.series),this.drawingContext=t.drawingContext,this.seriesIdent=t.seriesIdent,this.seriesIndex=t.seriesIndex,this.zoomConfig=t.zoomProps,this.opts=u.cloneDeep(t.areaOptions),this.dims=t.dims,this.opts.onValueChange=t.areaOptions.onValueChange,this.opts.colorScale=t.areaOptions.colorScale,this.onAreaUpdate=t.onAreaUpdate,this.dragCoordOffset={x:0,y:0},this.label=this.series.label;var e=this.label.split(" ");this.legendLabelLines=[e[0]],this.legendLabelLines=e.slice(1).reduce(function(t,e){return t[t.length-1].length+e.length<=i.opts.textOverflowWidthLimit?t[t.length-1]=t[t.length-1]+" "+e:t.push(e),t},this.legendLabelLines),this.labelTextLineSpacing=h.scaleLinear().domain([100,1200]).range(this.opts.textLineSpacingRangeLegend),this.legendLabelEls=[],this.polygonClassName="chart-poly-"+this.seriesIdent,this.polygonVertexLables="poly-labels-"+this.seriesIdent,this.circleOverlayClassName="circle-overlay"+this.seriesIdent,this.circleClassName="circle-"+this.seriesIdent,this.currentAreaOpacity=this.opts.areaHighlightProps.defaultAreaOpacity,this.points=this.series.data.map(function(t){return{cords:i.axisMap[t.axis].projectValueOnAxis(t.value),datum:u.cloneDeep(t)}}),this.polygonWrapper={points:this.points,svgStringRep:this.points.reduce(function(t,e){return t+e.cords.x+","+e.cords.y+" "},"")},this.setupZoomInterpolators(),this.onLegendOver=this.onLegendOver.bind(this),this.onLegendOut=this.onLegendOut.bind(this),this.hilightThisAreaRemove=this.hilightThisAreaRemove.bind(this),this.hilightThisArea=this.hilightThisArea.bind(this),this.state=l,this.postRenderQueue=[],this.draggingParams={tFMatrix:null,svgEl:null}}return y(a,[{key:"createEventHandler",value:function(s,n){return function(t){switch(s){case c:n.state!==p&&n.state!==r&&(n.state=o,h.select(t.circleRef).style("fill-opacity",n.opts.hoverCircleOpacity),n.hilightThisArea(),h.select(t.circleRef).transition(100).attr("r",n.opts.circleProps.defaultRadius*n.opts.circleProps.circleOverlayRadiusMult));break;case d:n.state===o?(h.select(t.circleRef).style("fill-opacity",n.opts.defaultCircleOpacity),n.hilightThisAreaRemove(),h.select(t.circleRef).transition(100).attr("r",n.opts.circleProps.defaultRadius),n.state=l):n.state===p&&(n.state=r);break;case f:if(m.isFirefox){var e=this.getCTM(),i=n.drawingContext().nodes()[0].parentNode,a=i.createSVGMatrix();a.e=i.parentNode.getBoundingClientRect().x,a.f=i.parentNode.getBoundingClientRect().y,a=a.multiply(e),n.draggingParams.tFMatrix=a.inverse(),n.draggingParams.svgEl=i}break;case g:n.draggingActions(t,n);break;case x:n.axisMap[t.datum.axis].dragActive=!1,n.axisMap[t.datum.axis].onRectMouseOut(),h.select(t.circleRef).style("fill-opacity",n.opts.defaultCircleOpacity),n.state=l,n.postRenderQueue.push(function(){return n.hilightThisAreaRemove()}),n.updatePositions(),n.ctm=null}}}},{key:"createOnMouseOverPolygon",value:function(){var i=this;return function(t){var e="."+i.polygonClassName;i.drawingContext().selectAll("polygon").transition(200).style("fill-opacity",i.opts.areaHighlightProps.hiddenAreaOpacity),i.drawingContext().selectAll(e).transition(200).style("fill-opacity",i.opts.areaHighlightProps.highlightedAreaOpacity)}}},{key:"createOnMouseOutPolygon",value:function(){var e=this;return function(t){h.select(this).transition(200).style("fill-opacity",e.opts.areaHighlightProps.defaultAreaOpacity)}}},{key:"draggingActions",value:function(t,e){var i=e.axisMap[t.datum.axis];e.axisMap[t.datum.axis].onRectMouseOver(),e.axisMap[t.datum.axis].dragActive=!0;var a=h.event,s=a.x,n=a.y;if(m.isFirefox){var r=e.draggingParams.svgEl.createSVGPoint();r.x=h.event.sourceEvent.clientX,r.y=h.event.sourceEvent.clientY,s=(r=r.matrixTransform(e.draggingParams.tFMatrix)).x,n=r.y}var o=i.projectCordToAxis(s,n).x,l=i.projectCordToAxis(s,n).y;if(i.quad===P||i.quad===A){if(l<i.y2||l>i.y1)return}else if(l<i.y1||l>i.y2)return;this.state=p;var c=i.cordOnAxisToValue(o,l);t.datum.value=c,t.cords=e.axisMap[t.datum.axis].projectValueOnAxis(c),e.updatePositions(),u.isFunction(e.opts.onValueChange)&&e.opts.onValueChange(t)}},{key:"hilightThisArea",value:function(){var t="."+this.polygonClassName;this.drawingContext().selectAll("polygon").transition(200).style("fill-opacity",this.opts.areaHighlightProps.hiddenAreaOpacity).style("stroke-opacity",this.opts.areaHighlightProps.hiddenStrokeOpacity),this.drawingContext().selectAll("."+this.polygonVertexLables).style("opacity",this.opts.areaHighlightProps.highlightedLabelOpacity),this.drawingContext().selectAll(t).transition(200).style("fill-opacity",this.opts.areaHighlightProps.highlightedAreaOpacity).style("stroke-opacity",this.opts.areaHighlightProps.highlightedStrokeOpacity),this.currentAreaOpacity=this.opts.areaHighlightProps.highlightedAreaOpacity}},{key:"hilightThisAreaRemove",value:function(){this.drawingContext().selectAll("polygon").transition(200).style("fill-opacity",this.opts.areaHighlightProps.defaultAreaOpacity).style("stroke-opacity",this.opts.areaHighlightProps.defaultStrokeOpacity),this.drawingContext().selectAll("."+this.polygonVertexLables).style("opacity",this.opts.areaHighlightProps.hiddenLabelOpacity),this.currentAreaOpacity=this.opts.areaHighlightProps.defaultAreaOpacity}},{key:"isDragActive",value:function(){return this.state===r||this.state===p}},{key:"onLegendOver",value:function(){var e=this;this.dragActive||(h.select(this.legendRect).attr("opacity",1),this.legendLabelEls.map(function(t){return h.select(t)}).forEach(function(t){t.attr("fill",e.opts.areaColorScale(e.seriesIndex)),t.attr("font-weight","bold")}),this.hilightThisArea(this))}},{key:"onLegendOut",value:function(){this.dragActive||(h.select(this.legendRect).attr("opacity",.7),this.legendLabelEls.map(function(t){return h.select(t)}).forEach(function(t){t.attr("fill",t.attr("original-fill")),t.attr("font-weight","normal")}),this.hilightThisAreaRemove(this))}},{key:"onZoomUpdateSizes",value:function(t){this.opts.lineProps.strokeWidth=this.zlop.areaLineLop(t),this.opts.circleProps.defaultRadius=this.zlop.circleRadiusLop(t),this.opts.labelProps.fontSize=this.zlop.fontLop(t)}},{key:"renderArea",value:function(){var t=this;this.area=this.drawingContext().selectAll(this.polygonClassName).data([this.polygonWrapper]).enter().append("polygon").attr("class",this.polygonClassName).style("stroke-width",this.opts.lineProps.strokeWidth+"px").style("stroke",function(){if(t.opts.useColorScale)return t.opts.lineColorScale(t.seriesIndex)}).style("stroke-opacity",this.opts.areaHighlightProps.defaultStrokeOpacity).attr("points",function(t){return t.svgStringRep}).style("fill",function(){if(t.opts.useColorScale)return t.opts.areaColorScale(t.seriesIndex)}).style("fill-opacity",this.currentAreaOpacity);var e=h.format(".2");this.areaVertexLabels=this.drawingContext().selectAll(this.polygonVertexLables).data(this.points).enter().append("svg:text").text(function(t){return e(t.datum.value)}).attr("x",function(t){return t.cords.x}).attr("y",function(t){return t.cords.y}).attr("class",this.polygonVertexLables).style("font-family",this.opts.labelProps["font-family"]).style("font-size",this.opts.labelProps.fontSize+"px").style("opacity",function(){return t.isDragActive()?1:t.opts.areaHighlightProps.defaultLabelOpacity}),this.opts.areaHighlight&&this.area.on("mouseover",this.createOnMouseOverPolygon()).on("mouseout",this.createOnMouseOutPolygon())}},{key:"renderCircles",value:function(){var t=this;this.circles=this.drawingContext().selectAll(this.circleClassName).data(this.points).enter().append("svg:circle").attr("r",function(){return t.isDragActive()?t.opts.circleProps.circleOverlayRadiusMult*t.opts.circleProps.defaultRadius:t.opts.circleProps.defaultRadius}).attr("alt",function(t){return Math.max(t.value,0)}).attr("cx",function(t){return t.cords.x}).attr("cy",function(t){return t.cords.y}).attr("class",this.circleClassName).style("fill",function(){if(t.opts.useColorScale)return t.opts.lineColorScale(t.seriesIndex)}).style("fill-opacity",function(){return t.isDragActive()?t.opts.hoverCircleOpacity:t.opts.defaultCircleOpacity}).each(function(t){t.circleRef=this}),this.circleOverylays=this.drawingContext().selectAll(this.circleOverlayClassName).data(this.points).enter().append("svg:circle").attr("r",this.opts.circleProps.defaultRadius*this.opts.circleProps.circleOverlayRadiusMult).attr("cx",function(t){return t.cords.x}).attr("cy",function(t){return t.cords.y}).attr("opacity",0).attr("class",this.circleOverlayClassName).attr("pointer-events","all").each(function(t){t.overlayRef=this}),this.series.circleHighlight&&this.circleOverylays.on("mouseover",this.createEventHandler(c,this)).on("mouseout",this.createEventHandler(d,this)),this.series.dragEnabled&&this.circleOverylays.call(h.drag().subject(function(t){return this}).on("start",this.createEventHandler(f,this)).on("drag",this.createEventHandler(g,this)).on("end",this.createEventHandler(x,this))),this.circles.append("svg:title").text(function(t){return t.datum.value})}},{key:"remove",value:function(){this.series.showCircle&&(h.selectAll("."+this.circleOverlayClassName).on("mouseover",null).on("mouseout",null).on("drag",null).on("end",null).data([]).exit().remove(),h.selectAll("."+this.circleClassName).data([]).exit().remove()),this.circles=[],this.circleOverylays=[],this.removeArea()}},{key:"removeArea",value:function(){h.selectAll("."+this.polygonClassName).on("mouseover",null).on("mouseout",null).data([]).exit().remove(),this.areaVertexLabels.remove()}},{key:"render",value:function(){for(this.renderArea(),this.series.showCircle&&this.renderCircles();0<this.postRenderQueue.length;)this.postRenderQueue.pop()()}},{key:"setDragCoordOffset",value:function(t,e){this.dragCoordOffset.x=t,this.dragCoordOffset.y=e}},{key:"setupZoomInterpolators",value:function(){var t=this.zoomConfig.scaleExtent.maxZoom;this.zlop={};this.zlop.areaLineLop=h.scaleLog().base(8).domain([1,t]).range([this.opts.lineProps.strokeWidth,this.opts.lineProps.maxZoomStroke]),this.zlop.circleRadiusLop=h.scaleLog().base(8).domain([1,t]).range([this.opts.circleProps.defaultRadius,this.opts.circleProps.maxZoomRadius]),this.zlop.fontLop=h.scaleLog().domain([1,t]).range([this.opts.labelProps.fontSize,this.opts.labelProps.maxFontSize])}},{key:"updatePositions",value:function(){this.polygonWrapper.svgStringRep=this.points.reduce(function(t,e){return t+e.cords.x+","+e.cords.y+" "},""),this.onAreaUpdate()}}]),a}();return function(){function e(t){n(this,e),this.rootElement=h.select(t.rootElement),this.rootElId=this.rootElement.attr("id"),this.setOps(t),this.areas=[],this.axisRectClassName="axis-rect-overlay"}return y(e,[{key:"render",value:function(){this.setupDrawingArea(),this.renderAxis(),this.renderArea(),this.opts.showLegend&&this.renderLegend()}},{key:"setOps",value:function(t){var i=this;this.opts=u.merge({enableZoom:!0,zoomProps:{scaleExtent:{minZoom:1,maxZoom:12}},data:[],dims:{width:500,height:500,translateXp:.05,translateYp:.05,legendSpaceP:.1,innerPaddingP:.1},legend:{interactive:!0,legendWidthP:.9,legendHeightP:.2,legendWOverlap:1.1,legendTopOffsetP:.03,textYOffset:9,textOffsetP:.75,colorScale:h.scaleOrdinal(h.schemeAccent),iconHeightP:.02,iconWidthP:.02,iconSpacingP:.05,title:"Test title",scaleTextWithSize:!0,titleScale:null,labelScale:null,titleProperties:{fontSize:12,fill:"#404040"},labelTextProperties:{"font-size":"11px",fill:"#737373"}},levels:{levelsNo:2,noTicks:3,levelsColor:null},point:{radius:5},showLegend:!0,axis:{config:[],colorScale:null,useGlobalMax:!1,maxValue:.6,leftOffsetPLabel:.85,textOverflow:!0,textOverflowWidthLimit:10,textLineSpacingPx:10,tickScale:null,axisTitleScale:null,axisLabelProps:{"font-family":"sans-serif",fontSize:11,fill:"#808080"},ticks:{fill:"#737373",minZoomFont:10,maxZoomFont:1,"font-family":"sans-serif"}},area:{areaHighlight:!1,areaHighlightProps:{defaultAreaOpacity:0,highlightedAreaOpacity:.7,hiddenAreaOpacity:.1,defaultStrokeOpacity:.8,highlightedStrokeOpacity:1,hiddenStrokeOpacity:.2,defaultLabelOpacity:0,highlightedLabelOpacity:1,hiddenLabelOpacity:0},labelProps:{"font-family":"sans-serif",fontSize:10,maxFontSize:2},defaultCircleOpacity:.3,hoverCircleOpacity:.5,circleProps:{defaultRadius:5,maxZoomRadius:1,circleOverlayRadiusMult:1.5},useColorScale:!0,areaColorScale:h.scaleOrdinal(h.schemeAccent),lineColorScale:h.scaleOrdinal(h.schemeAccent),onValueChange:null,textOverflowWidthLimit:10,textLineSpacingRangeLegend:[1,20],lineProps:{strokeWidth:2,maxZoomStroke:.5}},rootElement:null},t),this.opts.axis.maxAxisNo=this.opts.axis.config.length;var e=this.opts.dims;e.paddingW=e.width*e.translateXp/2,e.paddingH=e.paddingW,e.legendW=e.width*e.legendSpaceP,e.chartContainerW=e.width-e.paddingW-e.legendW,e.chartContainerH=e.height-2*e.paddingH,e.innerPadding=e.chartContainerH*e.innerPaddingP,e.innerW=e.chartContainerW-2*e.innerPadding,e.innerH=e.chartContainerH-2*e.innerPadding,e.optsLeftChartOffset=e.innerPadding,e.optsTopChartOffset=e.innerPadding;var a=this.opts.legend;a.width=e.legendW*a.legendWidthP,a.height=e.height*a.legendHeightP,a.iconSpacing=a.iconSpacingP*e.height,a.iconHeight=a.iconHeightP*e.height,a.iconWidth=a.iconWidthP*e.height,this.data=this.opts.data,this.axisConfig=this.opts.axis.config,this.axisParameters=this.axisConfig.map(function(t,e){return new v(i.opts,t,e)}),this.axisMap=this.axisParameters.reduce(function(t,e){return t[e.axis]=e,t},{})}},{key:"setupDrawingArea",value:function(){var s=this,t=this.opts.dims,e=t.width,i=t.height,a=t.paddingH,n=t.paddingW;this.rootSvg=this.rootElement.append("svg").attr("width",e).attr("height",i),this.rootSvg.append("g").attr("class","root"+this.rootElId).attr("transform","translate("+n+","+a+")"),this.opts.enableZoom&&(this.zoom=h.zoom().on("zoom",function(t){if(m.isFirefox){var e=h.event.transform.k,i=e>s.opts.zoomProps.scaleExtent.minZoom?.1*e:s.opts.zoomProps.scaleExtent.minZoom,a=e<s.opts.zoomProps.scaleExtent.maxZoom?1.1*e:s.opts.zoomProps.scaleExtent.maxZoom;s.zoom.scaleExtent([i,a]),s.drawingContext().attr("transform",h.event.transform),s.areas.forEach(function(t){return t.onZoomUpdateSizes(e)}),s.axisParameters.forEach(function(t){return t.onZoom(e)})}else s.drawingContext().attr("transform",h.event.transform),s.areas.forEach(function(t){return t.onZoomUpdateSizes(h.event.transform.k)}),s.axisParameters.forEach(function(t){return t.onZoom(h.event.transform.k)});s.drawingContext().attr("transform",h.event.transform),s.areas.forEach(function(t){return t.onZoomUpdateSizes(h.event.transform.k)}),s.axisParameters.forEach(function(t){return t.onZoom(h.event.transform.k)}),s.onUpdateArea()}).translateExtent([[0,0],[e,i]]).scaleExtent([this.opts.zoomProps.scaleExtent.minZoom,this.opts.zoomProps.scaleExtent.maxZoom]),this.rootSvg.call(this.zoom)),this.drawingContext=function(){var t=this.rootElId.toString();return function(){return h.select(".root"+t)}}.bind(this)()}},{key:"setDragCoordOffset",value:function(e,i){this.areas.forEach(function(t){t.setDragCoordOffset(e,i)})}},{key:"renderAxis",value:function(){for(var o=this,t=this.opts,a=this.opts.dims.width,e=function(n){var r=t.levels.levelsNo;o.drawingContext().selectAll(".levels").data(o.axisParameters).enter().append("svg:line").attr("x1",function(t,e){var i=t.maxValue/r*(n+1);return t.projectValueOnAxis(i).x}).attr("y1",function(t,e){var i=t.maxValue/r*(n+1);return t.projectValueOnAxis(i).y}).attr("x2",function(t,e){var i=e+1===o.axisParameters.length?0:e+1,a=o.axisParameters[i],s=a.maxValue/r*(n+1);return a.projectValueOnAxis(s).x}).attr("y2",function(t,e){var i=e+1===o.axisParameters.length?0:e+1,a=o.axisParameters[i],s=a.maxValue/r*(n+1);return a.projectValueOnAxis(s).y}).attr("class","line").style("stroke","grey").style("stroke-opacity","0.75").style("stroke-width","0.3px")},i=0;i<t.levels.levelsNo-1;i++)e(i);var s=h.format(".2%"),n=t.axis.ticks;t.axis.axisTitleScale||(t.axis.axisTitleScale=h.scaleLinear().domain([100,1200]).range([5,23]));var r=function(i){var a=t.levels.levelsNo;o.drawingContext().selectAll(".levels").data(o.axisParameters).enter().append("svg:text").attr("x",function(t){var e=t.maxValue/a*(i+1);return t.projectValueOnAxis(e).x}).attr("y",function(t){var e=t.maxValue/a*(i+1);return t.projectValueOnAxis(e).y}).attr("class","legend").style("font-family",n["font-family"]).style("font-size",function(t){return t.scaledTickSize+"px"}).style("opacity",0).attr("fill",n.fill).text(function(t){return s(t.maxValue/a*(i+1)/t.maxValue)}).each(function(t){t.axisTickTextElements.push(this)})};for(i=0;i<t.levels.levelsNo;i++)r(i);this.axisG=this.drawingContext().selectAll(".axis").data(this.axisParameters).enter().append("g"),this.axisLines=this.axisG.attr("class","axis").append("line").attr("x1",function(t){return t.x1}).attr("y1",function(t){return t.y1}).attr("x2",function(t){return t.x2}).attr("y2",function(t){return t.y2}).attr("class","line").attr("pointer-events","none").style("stroke","grey").style("stroke-opacity",.75).style("stroke-width","0.3px"),this.rects=this.axisG.append("rect").attr("class",this.axisRectClassName).attr("x",function(t){return t.x1}).attr("y",function(t){return t.y1}).attr("transform",function(t,e){return"rotate("+t.angleFromNorth+","+t.x1+","+t.y1+")"}).attr("width",function(t){return t.axisLength}).attr("height",10).attr("fill-opacity",0).on("mouseover",function(t){return t.onRectMouseOver()}).on("mouseout",function(t){return t.onRectMouseOut()}).each(function(t){t.axisRect=this});var l=this.opts.axis.axisLabelProps,c=this.opts.axis;c.textLineSpacingPx=h.scaleLinear().domain([100,1200]).range([1,30]),t.axis.textOverflow?this.axisText=this.axisG.append("text").attr("class","axis-label").attr("pointer-events","none").text("").each(function(t){for(var e=t.lines,i=0;i<e.length;i++)h.select(this).append("tspan").attr("x",function(t){return t.labelX}).attr("y",function(t){return t.labelY}).attr("dy",function(t){return c.textLineSpacingPx(a)*i}).text(e[i]).style("font-family",l["font-family"]).style("font-size",function(t){return t.axisTitleScale(a)+"px"}).style("fill",l.fill).attr("text-anchor","middle").each(function(t){t.labelLines.push(this)})}):this.axisText=this.axisG.append("text").attr("class","axis-label").text(function(t){return t.label}).style("font-family",l["font-family"]).style("font-size",function(t){return t.axisTitleScale(a)+"px"}).style("fill",l.fill).attr("text-anchor","middle").attr("dy","1.5em").attr("transform",function(){return"translate(0, -10)"}).attr("x",function(t){return t.labelX}).attr("y",function(t){return t.labelY}).attr("pointer-events","none")}},{key:"renderArea",value:function(){var i=this;this.areas=this.data.map(function(t,e){return new S({axisMap:i.axisMap,dims:i.opts.dims,series:t,drawingContext:i.drawingContext,seriesIdent:""+e+i.rootElId,seriesIndex:e,areaOptions:i.opts.area,onAreaUpdate:i.onUpdateArea.bind(i),zoomProps:i.opts.zoomProps})}),this.areas.forEach(function(t){return t.render()})}},{key:"renderLegend",value:function(){var i=this,t=this.opts.dims,s=t.width,e=t.height,n=t.legendW,r=this.opts.legend,a=this.rootSvg.append("svg").attr("width",s).attr("height",e);r.scaleTextWithSize&&!r.titleScale&&(r.titleScale=h.scaleLinear().domain([100,1200]).range([5,20])),r.scaleTextWithSize&&!r.labelScale&&(r.labelScale=h.scaleLinear().domain([100,1200]).range([5,15])),a.append("text").attr("class","title").attr("x",s-n*(1+r.legendWOverlap)).attr("y",r.legendTopOffsetP*e).text(r.title).style("font-size",function(){return r.scaleTextWithSize?r.titleScale(s)+"px":r.titleProperties.fontSize+"px"}).attr("fill",r.titleProperties.fill);var o=a.append("g").attr("class","legend").attr("height",r.height).attr("width",r.width).attr("transform","translate(0,"+r.legendTopOffsetP*e*2+")");o.selectAll("rect").data(this.areas).enter().append("rect").attr("x",s-n*(1+r.legendWOverlap)).attr("y",function(t,e){return e*r.iconSpacing}).attr("width",r.iconWidth).attr("height",r.iconHeight).attr("opacity",.7).style("fill",function(t,e){return i.opts.area.areaColorScale(e)}).each(function(t){t.legendRect=this}),o.selectAll("text").data(this.areas).enter().append("text").text("").each(function(t,e){for(var i=t.legendLabelLines,a=0;a<i.length;a++)h.select(this).append("tspan").attr("x",s-n*(1+r.legendWOverlap)*r.textOffsetP).attr("y",function(t){return e*r.iconSpacing+r.textYOffset}).attr("dy",function(t){return t.labelTextLineSpacing(s)*a}).text(function(t){return t.legendLabelLines[a]}).style("font-size",function(){return r.scaleTextWithSize?r.labelScale(s)+"px":r.labelTextProperties.fontSize+"px"}).attr("fill",r.labelTextProperties.fill).attr("original-fill",r.labelTextProperties.fill).each(function(t){t.legendLabelEls.push(this)})}),o.selectAll("legend-rect-overlays").data(this.areas).enter().append("rect").attr("x",s-n*(1+r.legendWOverlap)).attr("y",function(t,e){return e*r.iconSpacing}).attr("width",n*(1+r.legendWOverlap)).attr("height",r.iconSpacing).attr("opacity",0).on("mouseover",function(t,e){t.onLegendOver(t)}).on("mouseout",function(t,e){t.onLegendOut(t)}).each(function(t){t.rectOverlay=t})}},{key:"reRenderWithNewData",value:function(t){this.data=t,this.removeAreas(),this.renderArea()}},{key:"reRenderWithNewOptions",value:function(t){this.delete(),this.setOps(t),this.areas=[],this.render()}},{key:"removeAxis",value:function(){this.axisLines.remove(),this.axisText.remove(),h.selectAll("."+this.axisRectClassName).on("mouseover",null).on("mouseout",null).data([]).exit().remove()}},{key:"removeAreas",value:function(){this.areas.forEach(function(t){return t.remove()})}},{key:"delete",value:function(){this.removeAreas(),this.removeAxis(),this.rootSvg.remove()}},{key:"onUpdateArea",value:function(){this.removeAreas(),this.areas.forEach(function(t){return t.render()})}}]),e}()});
