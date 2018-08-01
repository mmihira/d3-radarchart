

//Legend titles

//Data

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

var d = [
  [
	  {axis:"Email",value:0.59},
    {axis:"Social Networks",value:0.56},
    {axis:"Internet Banking",value:0.42},
    {axis:"News Sportsites",value:0.34},
    {axis:"Search Engine",value:0.48},
    {axis:"View Shopping sites",value:0.14},
    {axis:"Paying Online",value:0.11},
    {axis:"Buy Online",value:0.05},
    {axis:"Stream Music",value:0.07},
    {axis:"Online Gaming",value:0.12},
    {axis:"Navigation",value:0.27},
    {axis:"App connected to TV program",value:0.03},
    {axis:"Offline Gaming",value:0.12},
    {axis:"Photo Video",value:0.4},
    {axis:"Reading",value:0.03},
    {axis:"Listen Music",value:0.22},
    {axis:"Watch TV",value:0.03},
    {axis:"TV Movies Streaming",value:0.03},
    {axis:"Listen Radio",value:0.07},
    {axis:"Sending Money",value:0.18},
    {axis:"Other",value:0.07},
    {axis:"Use less Once week",value:0.08}
    ],[
    {axis:"Email",value:0.48},
    {axis:"Social Networks",value:0.41},
    {axis:"Internet Banking",value:0.27},
    {axis:"News Sportsites",value:0.28},
    {axis:"Search Engine",value:0.46},
    {axis:"View Shopping sites",value:0.29},
    {axis:"Paying Online",value:0.11},
    {axis:"Buy Online",value:0.14},
    {axis:"Stream Music",value:0.05},
    {axis:"Online Gaming",value:0.19},
    {axis:"Navigation",value:0.14},
    {axis:"App connected to TV program",value:0.06},
    {axis:"Offline Gaming",value:0.24},
    {axis:"Photo Video",value:0.17},
    {axis:"Reading",value:0.15},
    {axis:"Listen Music",value:0.12},
    {axis:"Watch TV",value:0.1},
    {axis:"TV Movies Streaming",value:0.14},
    {axis:"Listen Radio",value:0.06},
    {axis:"Sending Money",value:0.16},
    {axis:"Other",value:0.07},
    {axis:"Use less Once week",value:0.17}
	]
];

//Options for the Radar chart, other than default
var mycfg = {
  w: 500,
  h: 500,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300
}

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

var options = {
  pointRadius: 5,
  width: 500,
  height: 500,
  outerWidth: 800,
  outerHeight:600,
  defaultAreaOpacity: 0.5,
  highlightedAreaOpacity: 0.7,
  hiddenAreaOpacity: 0.1,
  xbuffer: 80, // to adjust space for
  ybuffer: 30
}


for(var i in mycfg){
  if('undefined' !== typeof mycfg[i]){
     cfg[i] = mycfg[i];
  }
}

const z = new RadarChart(cfg, axiss, d, document.getElementById('chart'));
z.render();

setTimeout(
  () => z.remove(),
  3000
)


////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

