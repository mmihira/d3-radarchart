function createData ({showCircle = false, circleHighlight = false, dragEnabled = false}) {
  const axisConfig = [
    {
      label: 'Conscientiousness',
      axisId: 'con_1',
      axisValueMax: 4,
      axisValueMin: 2
    },
    { label: 'Neuroticism', axisId: 'neu_2', axisValueMax: 1, axisValueMin: 0 },
    {
      label: 'Test spacing space space',
      axisId: 'spac_3',
      axisValueMax: 1,
      axisValueMin: 0
    },
    { label: 'Opennes', axisId: 'open_2', axisValueMax: 1, axisValueMin: 0 },
    {
      label: 'Extraversion',
      axisId: 'extra_3',
      axisValueMax: 1,
      axisValueMin: 0
    }
  ];

  const data = [
    {
      label: 'Normie',
      seriesId: 'nor_1',
      dragEnabled,
      showCircle,
      circleHighlight,
      fill: 'royalblue',
      data: [
        { axis: 'con_1', value: 3.8 },
        { axis: 'neu_2', value: 0.1 },
        { axis: 'spac_3', value: 0.7 },
        { axis: 'open_2', value: 0.6 },
        { axis: 'extra_3', value: 0.5 }
      ]
    },
    {
      label: 'Pepe',
      seriesId: 'pep_1',
      dragEnabled: false,
      showCircle: false,
      circleHighlight: false,
      data: [
        { axis: 'con_1', value: 2.5 },
        { axis: 'neu_2', value: 0.7 },
        { axis: 'spac_3', value: 0.2 },
        { axis: 'open_2', value: 0.3 },
        { axis: 'extra_3', value: 0.2 }
      ]
    }
  ];

  return { axisConfig, data };
}

export default createData;
