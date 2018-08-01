//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html
//
//
//
//
//
var axiss = [
  {axisId:"Email", value:0.59},
  {axisId:"Social Networks", value:0.56},
  {axisId:"Internet Banking", value:0.42},
  {axisId:"News Sportsites", value:0.34},
  {axisId:"Search Engine", value:0.48},
  {axisId:"View Shopping sites", value:0.14},
  {axisId:"Paying Online", value:0.11},
  {axisId:"Buy Online", value:0.05},
  {axisId:"Stream Music", value:0.07},
  {axisId:"Online Gaming", value:0.12},
  {axisId:"Navigation", value:0.27},
  {axisId:"App connected to TV program", value:0.03},
  {axisId:"Offline Gaming", value:0.12},
  {axisId:"Photo Video", value:0.4},
  {axisId:"Reading", value:0.03},
  {axisId:"Listen Music", value:0.22},
  {axisId:"Watch TV", value:0.03},
  {axisId:"TV Movies Streaming", value:0.03},
  {axisId:"Listen Radio", value:0.07},
  {axisId:"Sending Money", value:0.18},
  {axisId:"Other", value:0.07},
  {axisId:"Use less Once week", value:0.08}
];

var RadarChart = {
  draw: function(id, d, options){

  var cfg = {
	 radius: 5,
	 w: 600,
	 h: 600,
	 factor: 1,
	 factorLegend: .85,
	 levels: 3,
	 maxValue: 0,
	 radians: 2 * Math.PI,
	 opacityArea: 0.5,
	 ToRight: 5,
	 TranslateX: 80,
	 TranslateY: 30,
	 ExtraWidthX: 100,
	 ExtraWidthY: 100,
	 color: d3.scaleOrdinal(d3.schemeAccent)
	};


	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){
		  cfg[i] = options[i];
		}
	  }
	}

  const z = new RadarChartT(cfg, axiss, d, document.getElementById('chart'));

	cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));

  axisNo = d[0].length;

	var allAxis = d[0].map(function(i, inx) {
    const x1 = cfg.w / 2;
    const y1 = cfg.h / 2;
    const x2 = cfg.w / 2 * (1 - cfg.factor*Math.sin(inx * cfg.radians / axisNo));
    const y2 = cfg.h / 2 * (1 - cfg.factor*Math.cos(inx * cfg.radians / axisNo));
    const label_x = cfg.w/2*(1-cfg.factorLegend*Math.sin(inx*cfg.radians/axisNo))-60*Math.sin(inx*cfg.radians/axisNo);
    const label_y = cfg.h/2*(1-Math.cos(inx*cfg.radians/axisNo))-20*Math.cos(inx*cfg.radians/axisNo);
    const gradient = Math.abs(x2 - x1) < 0.000000001 ? Infinity : (y2 - y1) / (x2 - x1);
    const b = gradient === Infinity ? 0 : y2 - gradient * x2;
    const projectCordToAxis = function(x, y) {
      if (gradient === Infinity) {
        return {x: x1, y: y};
      } else {
        return {x: x, y: gradient * x + b};
      }
    };
    return {
      axis: i.axis,
      label: i.axis,
      x1: x1,
		  y1: y1,
		  x2: x2,
		  y2: y2,
      label_x: label_x,
      label_y: label_y,
      projectCordToAxis: projectCordToAxis,
      projectValueOnAxis: function(value) {
        return {x: 0, y: 0};
      }
    };
  });

  console.log(cfg);
  console.log(allAxis[0]);

  var axisMap = allAxis.reduce(function(map, ix) {
    map[ix.axis] = ix;
    return map;
  }, {});

  z.render();

  if (false) {

	 var total = allAxis.length;
	 var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	 var Format = d3.format('%');
	 d3.select(id).select("svg").remove();

	 var g = d3.select(id)
	 		.append("svg")
	 		.attr("width", cfg.w+cfg.ExtraWidthX)
	 		.attr("height", cfg.h+cfg.ExtraWidthY)
	 		.append("g")
	 		.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
	 		;

	 var tooltip;

	for(var j=0; j<cfg.levels-1; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data(allAxis)
	   .enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", "grey")
	   .style("stroke-opacity", "0.75")
	   .style("stroke-width", "0.3px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}

	//Text indicating at what % each level is
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data([1]) //dummy data
	   .enter()
	   .append("svg:text")
	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
	   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
	   .attr("class", "legend")
	   .style("font-family", "sans-serif")
	   .style("font-size", "10px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
	   .attr("fill", "#737373")
	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
	}

	series = 0;

	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
      .attr('pointer-events', 'none')
			.attr("class", "axis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i) {return d.x2;})
		.attr("y2", function(d, i) {return d.y2;})
		.attr("class", "line")
    .attr('pointer-events', 'none')
		.style("stroke", "grey")
		.style("stroke-width", "1px");

	axis.append("text")
		.attr("class", "legend")
		.text(function(d) { return d.label; })
		.style("font-family", "sans-serif")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "1.5em")
		.attr("transform", function(d, i){return "translate(0, -10)"})
		.attr("x", function(d, i){
      var axis = axisMap[d.axis];
      return axis.label_x;
    })
		.attr("y", function(d, i){
      var axis = axisMap[d.axis];
      return axis.label_y;
    });


	d.forEach(function(y, x){
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  dataValues.push(dataValues[0]);
	  g.selectAll(".area")
     .data([dataValues])
     .enter()
     .append("polygon")
     .attr("class", "radar-chart-serie"+series)
     .style("stroke-width", "2px")
     .style("stroke", cfg.color(series))
     .attr("points",function(d) {
       var str="";
       for(var pti=0;pti<d.length;pti++){
         str=str+d[pti][0]+","+d[pti][1]+" ";
       }
       return str;
      })
     .style("fill", function(j, i){return cfg.color(series)})
     .style("fill-opacity", cfg.opacityArea)
     .on('mouseover', function (d){
        z = "polygon."+d3.select(this).attr("class");
        g.selectAll("polygon")
         .transition(200)
         .style("fill-opacity", 0.1);
        g.selectAll(z)
         .transition(200)
         .style("fill-opacity", .7);
        })
     .on('mouseout', function(){
        g.selectAll("polygon")
         .transition(200)
         .style("fill-opacity", cfg.opacityArea);
     });
	  series++;
	});
	series=0;


	d.forEach(function(y, x){
	  g.selectAll(".nodes")
		.data(y)
    .enter()
		.append("svg:circle")
    .call(d3.drag()
      .subject(function(d) { return this; })
      .on('drag', function(d) {
        var axis = axisMap[d.axis];
        var {x, y} = d3.event;
        d3.select(d3.event.subject)
          .attr("cx", axis.projectCordToAxis(x, y).x)
          .attr("cy", axis.projectCordToAxis(x, y).y)
      })
    )
		.attr("class", "radar-chart-serie"+series)
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i) {
		  return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i) {
		  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j) {return j.axis})
		.style("fill", cfg.color(series)).style("fill-opacity", .9)
		.on('mouseover', function (d){
        newX =  parseFloat(d3.select(this).attr('cx')) - 10;
        newY =  parseFloat(d3.select(this).attr('cy')) - 5;

        tooltip
          .attr('x', newX)
          .attr('y', newY)
          .text(Format(d.value))
          .transition(200)
          .style('opacity', 1);

        z = "polygon."+d3.select(this).attr("class");
        g.selectAll("polygon")
          .transition(200)
          .style("fill-opacity", 0.1);
        g.selectAll(z)
          .transition(200)
          .style("fill-opacity", .7);
        })
		.on('mouseout', function(){
					tooltip
						.transition(200)
						.style('opacity', 0);
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", cfg.opacityArea);
				  })
		.append("svg:title")
		.text(function(j){return Math.max(j.value, 0)})

	  series++;
	});
  }

	////Tooltip
	//tooltip = g.append('text')
	//		   .style('opacity', 0)
	//		   .style('font-family', 'sans-serif')
	//		   .style('font-size', '13px');
  }
};
