document.addEventListener('DOMContentLoaded', () => {
  drawChart('a')
  drawChart('b')
  drawChart('c1')
  drawChart('c2')
})

const global_width = 1000,
  global_height = 500;

// define the dimensions and margins for the graph
const margin = {top: 100, right: 200, bottom: 50, left: 150};
const width = global_width - margin.left - margin.right,
  height = global_height - margin.top - margin.bottom;

const naming = {
  a: 'Number of Ratings 2016-2020',
  b: 'Number of Ratings 2016-2020 with Rankings',
  c1: 'Number of Ratings 2016-2020 (Square root Scale)',
  c2: 'Number of Ratings 2016-2020 (Log Scale)',
}

const rankIndices = [0, 2, 3, 4]

const colors = d3.schemeCategory10;

const keys = [
  'Catan',
  'Dominion',
  'Codenames',
  'Terraforming Mars',
  'Gloomhaven',
  'Magic: The Gathering',
  'Dixit',
  'Monopoly',
]

const keysCount = keys.map(key => key + '=count')
let keysRank = []
for (let i = 0; i <= rankIndices.length; i++) {
  keysRank.push(keys[i] + '=rank')
}

const drawChart = (prefix) => {
  //Appending first SVG element
  const svg = d3.select("svg#svg-" + prefix)
    .attr("transform", "translate(50,50)")
    .attr('width', global_width)
    .attr('height', global_height)

  //Chart Title
  svg.append('text')
    .attr('id', 'title-' + prefix)
    .attr("x", width / 5)
    .attr('y', 25)
    .attr("font-size", "26px")
    .attr("fill", "#282828")
    .text(naming[prefix]);

  const plot = svg.append("g")
    .attr("id", "plot-" + prefix)
    .attr("transform", "translate(80,50)");

  d3.dsv(',', 'boardgame_ratings.csv', d => {
    let data = {
      date: d3.timeParse("%Y-%m-%d")(d.date)
    }
    const keysSum = [
      ...keysCount,
      ...keysRank
    ]
    keysSum.map(key => {
      data[key] = +d[key]
    })
    return data
  }).then(function(data) {

    let data_dict = {};
    const all_values = [];
    for(let i = 0; i < data.length; i++){
      for (let j = 0; j < keysCount.length; j++){
        all_values.push(data[i][keysCount[j]])
        data_dict[keysCount[j]] = [data[i][keysCount[j]]]
      }
    }

    // Scales
    const xScale = d3.scaleTime().range([0, width]);
    let yScale
    if (prefix === 'c1') {
      yScale = d3.scaleSqrt().rangeRound([height, 0])
      yScale.domain([(0), d3.max(all_values)])
    } else if (prefix === 'c2') {
      yScale = d3.scaleLog().rangeRound([height, 0])
      yScale.domain([1, 100000])
    } else {
      yScale = d3.scaleLinear().rangeRound([height, 0]);
      yScale.domain([(0), d3.max(all_values)])
    }

    xScale.domain(d3.extent(data, function(d){
      return d.date}))

    // Lines with legends
    const linesContainer = plot.append("g")
      .attr("id", "lines-" + prefix)

    let orderMain = [], orderOther = []
    for (let j = 0; j < keysCount.length; j++) {
      const line = d3.line()
        .x(function (d) {
          return xScale(d.date)
        })
        .y(function (d) {
          return yScale(d[keysCount[j]])
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
        .attr('fill', 'none')
        .attr('d', line)

      const title = keysCount[j].split('=')[0]

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
        .attr('y', _ => yScale(d3.max(data_dict[keysCount[j]])))
        .attr('fill', colors[j])
        .text(title)

      if (prefix !== 'a' && rankIndices.includes(j)) {

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
            return yScale(d[keysCount[j]])
          })
          .attr("r", 10)

        dotContainer.append('text')
          .attr('x', function (d) {
            return xScale(d.date)
          })
          .attr('y', function (d) {
            return yScale(d[keysCount[j]])
          })
          .text(function (d) {
            return d[keys[j] + '=rank']
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

    if (prefix !== 'a') {
      // Add Ranks Legend
      const legend = svg.append('g')
        .attr('id', 'legend-' + prefix)
        .attr('transform', `translate(${width}, ${height})`)

      legend.append('circle')
        .attr('r', 10)
        .attr('stroke', 'black')
        .attr('fill', 'black')
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
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
