const series = [
  {
    label: 'Normie',
    seriesId: 'nor_1',
    dragEnabled: true,
    showCircle: true,
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

export default series;
