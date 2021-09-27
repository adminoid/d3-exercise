window.addEventListener('DOMContentLoaded', () => {
  drawChart('a')
  drawChart('b')
});

const global_width = 1000,
  global_height = 500;

// define the dimensions and margins for the graph
const margin = {top: 100, right: 200, bottom: 50, left: 150};
const width = global_width - margin.left - margin.right,
  height = global_height - margin.top - margin.bottom;

const drawChart = (prefix) => {
  //Appending first SVG element
  const svg = d3.select("svg#svg-" + prefix)
    .attr("transform", "translate(50,50)")
    .attr('width', global_width)
    .attr('height', global_height)

  //Chart Title
  svg.append('text')
    .attr('id', 'title-' + prefix)
    .attr("x", width / 2.6)
    .attr('y', 25)
    .attr("font-size", "26px")
    .attr("fill", "#282828")
    .text("Number of Ratings 2016 - 2020");

  const plot = svg.append("g")
    .attr("id", "plot-" + prefix)
    .attr("transform", "translate(80,50)");

  const colors = d3.schemeCategory10;

  const keys = [
    'Catan=count',
    'Dominion=count',
    'Codenames=count',
    'Terraforming Mars=count',
    'Gloomhaven=count',
    'Magic: The Gathering=count',
    'Dixit=count',
    'Monopoly=count'
  ];

  d3.dsv(',', 'boardgame_ratings.csv', d => {
    let data = {
      date: d3.timeParse("%Y-%m-%d")(d.date)
    }
    keys.map(key => {
      data[key] = +d[key]
    })
    return data
  }).then(function(data) {

    let data_dict = {};
    const all_values = [];
    for(let i = 0; i < data.length; i++){
      for (let j = 0; j < keys.length; j++){
        all_values.push(data[i][keys[j]])
        data_dict[keys[j]] = [data[i][keys[j]]]
      }
    }

    // Scales
    const xScale = d3.scaleTime().range([0, width]),
      yScale = d3.scaleLinear().rangeRound([height, 0]);

    xScale.domain(d3.extent(data, function(d){
      return d.date}))
    yScale.domain([(0), d3.max(all_values)]) // [0, "95775"]

    // Lines with legends
    const linesContainer = plot.append("g")
      .attr("id", "lines-" + prefix)

    let orderMain = [], orderOther = []
    for (let j = 0; j < keys.length; j++) {

      const line = d3.line()
        .x(function (d) {
          return xScale(d.date)
        })
        .y(function (d) {
          return yScale(d[keys[j]])
        })
        .curve(d3.curveMonotoneX)

      const lineContainer = linesContainer
        .append('g')
        .attr('class', 'line-container')

      lineContainer
        .append('path')
        .datum(data)
        .style("stroke", colors[j])
        .attr('class', 'line')
        .attr('d', line)

      const title = keys[j].split('=')[0]

      let current = false
      lineContainer
        .filter(_ => {
          if (current !== j) {
            current = j
            return true
          }
          return false
        })
        .append('text')
        .attr('x', width + 5)
        .attr('y', _ => yScale(d3.max(data_dict[keys[j]])))
        .attr('fill', colors[j])
        .text(title)

      if (prefix === 'b' && [0, 2, 3, 4].includes(j)) {

        const dotsContainer = lineContainer
          .append('g')
          .attr('class', 'line-info')

        const scaled_data = []
        for (let i = 0; i < data.length; i++) {
          if ((i + 1) % 3 === 0) {
            scaled_data.push(data[i])
          }
        }

        const dotContainer = dotsContainer
          .selectAll(".dots")
          .data(scaled_data)
          .enter()
          .append('g')
          .attr('class', 'dot')

        dotContainer.append('circle')
          .style("fill", colors[j])
          .attr('cx', function (d) {
            return xScale(d.date)
          })
          .attr('cy', function (d) {
            return yScale(d[keys[j]])
          })
          .attr("r", 15)

        dotContainer.append('text')
          .attr('x', function (d) {
            return xScale(d.date)
          })
          .attr('y', function (d) {
            return yScale(d[keys[j]])
          })
          .text(function (d) {
            return d[keys[j]]
          })
          .attr('text-anchor', 'middle')
          .attr('dy', '.3em')
          .attr('stroke', 'white')
          .attr('font-size', '8px')
          .attr('font', 'sans-serif')

        orderMain.push(j)

      } else {
        orderOther.push(j)
      }
    }

    if (prefix === 'b') {
      // Add Ranks Legend
      const legend = svg.append('g')
        .attr('id', 'legend-' + prefix)
        .attr('transform', `translate(${width}, ${height})`)

      legend.append('circle')
        .attr('r', 15)
        .attr('stroke', 'black')
        .attr('fill', 'black')
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('stroke', 'white')
        .attr('font-size', '13px')
        .attr('font', 'sans-serif')
        .attr('dy', '.3em')
        .attr('fill', 'white')
        .text('rank')
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '2em')
        .attr('fill', 'black')
        .text('BoardGameGeek Rank')

      const ordering = linesContainer.selectAll('.line-container')
      ordering.data(orderMain.concat(orderOther))
      ordering.sort(d3.descending)
    }

    // Declare x-axis and y-axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %y'))
    const yAxis = d3.axisLeft(yScale)
      .ticks(10)

    // Append axes
    const xAxisContainer = plot.append('g')
      .attr('id', 'x-axis-' + prefix)
      .attr("transform", "translate(0," + height + ")")
    xAxisContainer
      .call(xAxis)
    // text label
    xAxisContainer
      .append('text')
      .attr("font-size", "14px")
      .attr("fill", "#282828")
      .attr("x", width/2)
      .attr('y', 40)
      .attr("text-anchor", "middle")
      .text("Month")

    const yAxisContainer = plot.append('g')
      .attr('id', 'y-axis-' + prefix)
    yAxisContainer
      .call(yAxis)
    // text label
    yAxisContainer
      .append('text')
      .attr("transform", "rotate(-90) translate(0, -3)")
      .attr("font-size", "14px")
      .attr("fill", "#282828")
      .attr("x", -120)
      .attr("y", 20)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .text("Number of Ratings")
  })

}
