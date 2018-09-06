# d3-RadarChart

## Table of Contents

* [Screenshot](#Screenshot)
* [Live Demo](#live-demo)
* [Install](#install)
* [Usage](#usage)
* [Options](#options)
* [Related](#related)
* [Changelog](#changelog)
* [License](#license)
* [Attributions](#Attributions)

## Screenshot

## Live Demo

## Install

## Install

- use npm

```sh
npm i -S react-rnd
```

- use yarn

```sh
yarn add react-rnd
```

## Usage

### Minimum configuration

``` javascript
const axisConfig = [
  {axisId:"Email"},
  {axisId:"Social Networks"},
  {axisId:"Internet Banking"l}
];

const data = [
  [
    {axis:"Email",value:0.4},
    {axis:"Social Networks",value:0.56},
    {axis:"Internet Banking",value:0.42}
  ],
  [
    {axis:"Email",value:0.48},
    {axis:"Social Networks",value:0.41},
    {axis:"Internet Banking",value:0.27}
  ]
];

var options = {
  data: data,
  dims: {
    width: 550,
    height: 500,
  },
  showLegend: true,
  rootElement: document.getElementById('chart'),
  axis: {
    config: axisConfig,
  }
}

const radarChart = new RadarChart(options);
radarChart.render();
```
## Options

#### `enableZoom: Bool; default = true`

Control whether zoom is enabled or not

##### `zoomProps.scaleExtent.minZoom: Float; default = 1`

The minimum zoom (How much can be zoomed out)

##### `zoomProps.scaleExtent.maxZoom: Float; default = 12`

The maximum zoom (How much can be zoomed in)

#### `data: Array[Objects]; default = []`

The data to display in the radar chart. Should be an array of Series objects.
See series parameters for a list of parameters available.
Example format : 
```
[
  {
    label: 'Normie',
    dragEnabled: false,
    showCircle: true,
    data: [
      {axis: "Conscientiousness", value: 3.8},
      {axis: "Neuroticism", value: 0.1},
      {axis: "test spacing two three", value: 0.7},
      {axis: "Openness", value: 0.6},
      {axis: "Extraversion", value: 0.5}
    ]
  },
  {
    label: 'Pepe',
    dragEnabled: true,
    showCircle: true,
    circleHighlight: true,
    data: [
      {axis: "Conscientiousness", value: 2.5},
      {axis: "Neuroticism", value: 0.7},
      {axis: "test spacing two three", value: 0.2},
      {axis: "Openness", value: 0.3},
      {axis: "Extraversion", value: 0.2}
    ]
  },
];
```
#### `dims: Object`

The dimensions of the chart. Unless fine tuning is required
only the width and height need to be set. The rest should produce
a nice result with different sizes.

##### `dims.width: Float; default = 500`

The outer width of the chart + legend.

##### `dims.height: Float; default = 500`

The outer height of the chart + legend.

##### `dims.translateXp: Float; default = 0.05`

Fraction of outer width which the svg chart element is offset in the x-direction.

##### `dims.translateYp: Float; default = 0.05`

Fraction of outer height which the svg chart element is offset in the y-direction.

##### `dims.legendSpaceP: Float; default = 0.1`

Fraction of the outer width which the legend is alocated. I.e, 0.1 will mean 10% of
the width will be allocated to the legend.

##### `dims.innerPaddingP: Float; default = 0.1`

In addition to the offset the radar chart is further offest by padding equal to outer
height * dims.innerPaddingP

#### `legend: Object`

Set options for the chart legend. The legend is designed to 
scale with the height and width of the chart.

##### `legend.interactive: Bool; default = true`

Whether the chart is interactive or not. I.E hover over a legend item highlights the area 
associated.

#### `legend.legendWidthP: Float, default = 0.9`

The legend inner width = dims.width * dims.legendSpaceP * legend.legendWidthP

#### `legend.legendHeightP: Float, default = 0.2`

The legend inner height = dims.heigt * legend.legendHeightP

#### `legend.legendWOverlap: Float, default = 1.1`

Offset the legend by a fraction of the legend width. Adjust this value if you 
don't want to squash the chart but want the legend to overlap into the chart space.

#### `legend.legendTopOffsetP: Float, default = 0.030`

Fraction dims.height which the Legend is offset from the top


#### `legend.textYOffset: Float, default = 9`

The offset in pixels the legend label text is offset from the top of the chart

#### `legend.textOffsetP: Float, default = 0.75`

The offset of the label text from the right :

```offset =  width - (legendW * (1 + legendWOverlap)) * textOffsetP)```

#### `legend.iconHeightP: Float, default = 0.020`

The height of the label square as a fraction of the chart height

#### `legend.iconWidthP: Float, default = 0.020`

The width of the label square as a fraction of the chart width

#### `legend.iconSpacingP: 0.05: Float, default = 0.05`

The spacing between legend square icon as a fraction of the height

#### `legend.title: String, default = 'Test title'`

The legend title

#### `legend.scaleTextWithSize: Bool, default = true`

Scale the legend text with the size of the chart.

#### `legend.titleScale: Function, default = null`

Provide a custom title scale with size. If null is supplied the following
scaling function is used : 

```
  legendOpts.titleScale = d3.scaleLinear()
    .domain([100, 1200])
    .range([5, 20])
```

#### `legend.labelScale: Function, default = null`

```
  legendOpts.labelScale = d3.scaleLinear()
    .domain([100, 1200])
    .range([5, 15]);
```
#### `legend.titleProperties.fontSize: Ineteger, default = 12`

The fontSize for the legend title. Ignore if the legend labels scale with size.

#### `legend.titleProperties.fill: String, default = '#404040'`

The legend title color

#### `legend.labelTextProperties.font-sze: String, default = 11`

The fontSize for the legend labels. Ignore if the legend labels scale with size.

#### `legend.labelTextProperties.fill: String, default = '#737373'`

The legend text colors

## Contribute

If you have a feature request, please add it as an issue or make a pull request.

## Changelog

## Attributions

The author would like to thank the University Of Melbourne for funding this work and allowing the efforts
to be released as open source.

## License

Copyright [2018] [Mihira Wanninayake]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
