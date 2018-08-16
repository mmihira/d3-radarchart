# d3-RadarChart

## Table of Contents

* [Screenshot](#Screenshot)
* [Live Demo](#live-demo)
* [Install](#install)
* [Usage](#usage)
* [Related](#related)
* [Changelog](#changelog)
* [License](#license)

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

## Contribute

If you have a feature request, please add it as an issue or make a pull request.

## Changelog

## License

The MIT License (MIT)

Copyright (c) 2018 bokuweb

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
