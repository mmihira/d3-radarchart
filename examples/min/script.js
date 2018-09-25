var axisConfig = [
  {label: 'Conscientiousness', axisId: "con_1", axisValueMax: 4, axisValueMin: 2},
  {label: 'Neuroticism', axisId: "neu_2", axisValueMax: 1, axisValueMin: 0},
  {label: 'Test spacign space space', axisId: "spac_3", axisValueMax: 1, axisValueMin: 0},
  {label: 'Opennes', axisId: "open_2", axisValueMax: 1, axisValueMin: 0},
  {label: 'Extraversion', axisId: "extra_3", axisValueMax: 1, axisValueMin: 0}
];

var data = [
  {
    label: 'Normie',
    dragEnabled: true,
    showCircle: true,
    data: [
      {axis: "con_1", value: 3.8},
      {axis: "neu_2", value: 0.1},
      {axis: "spac_3", value: 0.7},
      {axis: "open_2", value: 0.6},
      {axis: "extra_3", value: 0.5}
    ]
  },
  {
    label: 'Pepe',
    dragEnabled: true,
    showCircle: true,
    circleHighlight: true,
    data: [
      {axis: "con_1", value: 2.5},
      {axis: "neu_2", value: 0.7},
      {axis: "spac_3", value: 0.2},
      {axis: "open_2", value: 0.3},
      {axis: "extra_3", value: 0.2}
    ]
  },
];

var options = {
  data: data,
  dims: {
    width: 550,
    height: 500,
  },
  showLegend: true,
  rootElement: document.getElementById('chart'),
  levels: {
    levelsNo: 3
  },
  legend: {
    title: "Big 5"
  },
  axis: {
    config: axisConfig,
    wheelLabelAreaId: 'Pepe'
  }
}

const radarChart = new RadarChart(options);
radarChart.render();

let reRenderTest = function() {
  console.log('Removing');
  setTimeout(function() {
    radarChart.delete();
    setTimeout(function() {
      console.log('Re-rendering');
      radarChart.reRenderWithNewOptions(options);
    }, 1000)
  }, 1000)
};

// setTimeout(reRenderTest, 2000);
