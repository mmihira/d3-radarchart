function createOptions (toMerge) {
  let axisConfig = [
    {label: 'Conscientiousness', axisId: "con_1", axisValueMax: 4, axisValueMin: 2},
    {label: 'Neuroticism', axisId: "neu_2", axisValueMax: 1, axisValueMin: 0},
    {label: 'Test spacing space space', axisId: "spac_3", axisValueMax: 1, axisValueMin: 0},
    {label: 'Opennes', axisId: "open_2", axisValueMax: 1, axisValueMin: 0},
    {label: 'Extraversion', axisId: "extra_3", axisValueMax: 1, axisValueMin: 0}
  ];

  let data = [
    {
      label: 'Normie',
      seriesId: 'nor_1',
      dragEnabled: false,
      showCircle: false,
      circleHighlight: false,
      fill: 'royalblue',
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
      seriesId: 'pep_1',
      dragEnabled: false,
      showCircle: false,
      circleHighlight: false,
      data: [
        {axis: "con_1", value: 2.5},
        {axis: "neu_2", value: 0.7},
        {axis: "spac_3", value: 0.2},
        {axis: "open_2", value: 0.3},
        {axis: "extra_3", value: 0.2}
      ]
    },
  ];

  let options = {
    enableZoom: false,
    chartRootName: 'test1',
    data: data,
    dims: {
      width: 550,
      height: 500,
    },
    showLegend: false,
    rootElementId: 'chart',
    levels: {
      levelsNo: 3
    },
    legend: {
      title: "Big 5"
    },
    axis: {
      config: axisConfig,
      onAxisLabelOver: null
    }
  };

  return _.merge(options, toMerge);
};

let defOptions = createOptions({});
let radarChart = new RadarChart(defOptions);
radarChart.render();

function updateChart () {
  radarChart.reRenderWithNewOptions(defOptions);
};

function updateOptions (options) {
  _.merge(defOptions, options);
}

function toggleEnableZoom (element) {
  if (element.checked) {
    updateOptions({ enableZoom: true });
    updateChart();
  } else {
    updateOptions({ enableZoom: false });
    updateChart();
  }
};

function toggleHighlight (element) {
  if (!element.checked) {
    let data = [
      {
        label: 'Normie',
        seriesId: 'nor_1',
        dragEnabled: false,
        showCircle: false,
        circleHighlight: false,
        fill: 'royalblue',
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
        seriesId: 'pep_1',
        dragEnabled: false,
        showCircle: false,
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
    updateOptions({ data: data });
    updateChart();
  } else {
    let data = [
      {
        label: 'Normie',
        seriesId: 'nor_1',
        dragEnabled: false,
        showCircle: true,
        circleHighlight: true,
        fill: 'royalblue',
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
        seriesId: 'pep_1',
        dragEnabled: false,
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
    updateOptions({ data: data });
    updateChart();
  }
};

function toggleWheelAdjust (element) {
  if (element.checked) {
    updateOptions({ axis: { wheelLabelAreaId: 'pep_1' }});
    updateChart();
  } else {
    updateOptions({ axis: { wheelLabelAreaId: null }});
    updateChart();
  }
};

function toggleLegend (element) {
  if (element.checked) {
    updateOptions({ showLegend: true });
    updateChart();
  } else {
    updateOptions({ showLegend: false });
    updateChart();
  }
};

function toggleCircleDrag (element) {
  if (element.checked) {
    let data = [
      {
        label: 'Normie',
        seriesId: 'nor_1',
        dragEnabled: true,
        showCircle: true,
        circleHighlight: true,
        fill: 'royalblue',
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
        seriesId: 'pep_1',
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
    updateOptions({ data: data });
    updateChart();
  } else {
    let data = [
      {
        label: 'Normie',
        seriesId: 'nor_1',
        dragEnabled: false,
        showCircle: false,
        circleHighlight: false,
        fill: 'royalblue',
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
        seriesId: 'pep_1',
        dragEnabled: false,
        showCircle: false,
        circleHighlight: false,
        data: [
          {axis: "con_1", value: 2.5},
          {axis: "neu_2", value: 0.7},
          {axis: "spac_3", value: 0.2},
          {axis: "open_2", value: 0.3},
          {axis: "extra_3", value: 0.2}
        ]
      },
    ];
    updateOptions({ data: data });
    updateChart();
  }
};
