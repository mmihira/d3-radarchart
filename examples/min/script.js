var axisConfig = [
  {axisId: "Conscientiousness", axisValueMax: 1},
  {axisId: "Neuroticism", axisValueMax: 1},
  {axisId: "Agreeableness", axisValueMax: 1},
  {axisId: "Openness", axisValueMax: 1},
  {axisId: "Extraversion", axisValueMax: 1}
];

var data = [
  {
    label: 'Normie',
    dragEnabled: true,
    showCircle: true,
    data: [
      {axis: "Conscientiousness", value: 0.25},
      {axis: "Neuroticism", value: 0.1},
      {axis: "Agreeableness", value: 0.7},
      {axis: "Openness", value: 0.6},
      {axis: "Extraversion", value: 0.5}
    ]
  },
  {
    label: 'Pepe',
    dragEnabled: true,
    showCircle: true,
    data: [
      {axis: "Conscientiousness", value: 0.56},
      {axis: "Neuroticism", value: 0.7},
      {axis: "Agreeableness", value: 0.2},
      {axis: "Openness", value: 0.3},
      {axis: "Extraversion", value: 0.2}
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
    config: axisConfig
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
