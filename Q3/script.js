window.addEventListener('DOMContentLoaded', () => {
  drawChart('a')
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
    .attr("x", width / 2)
    .attr('y', 25)
    .attr("stroke", "black")
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
  }).then(function(data){

    let data_dict = {};
    const all_values = [];
    for(let i = 0; i < data.length; i++){
      for (let j = 0; j < keys.length; j++){
        all_values.push(data[i][keys[j]])
        data_dict[keys[j]] = []
        data_dict[keys[j]].push(data[i][keys[j]])
      }
    }

    //Scales
    const xScale = d3.scaleTime().range([0, width]),
      yScale = d3.scaleLinear().rangeRound([height, 0]);

    xScale.domain(d3.extent(data, function(d){
      return d.date}))
    yScale.domain([(0), d3.max(all_values)]) // [0, "95775"]


    // Lines
    const linesA = plot.append("g")
      .attr("id", "lines-a");
    for (let j = 0; j < keys.length; j++) {
      const line = d3.line()
        .x(function (d) {
          return xScale(d.date)
        })
        .y(function (d) {
          return yScale(d[keys[j]])
        })
        .curve(d3.curveMonotoneX)

      linesA.append('path')
        .datum(data) // Binds data to the line
        .style("stroke", colors[j]) // Color
        .attr('class', 'line') // Assign a class for styling
        .attr('d', line) // Calls the line generator
    }

    //Declare x-axis and y-axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%b %y')),
      yaxis = d3.axisLeft(yScale)
        .ticks(10);

    //Append axes
    plot.append('g')
      .attr('class', 'x axis')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    plot.append('g')
      .attr('class', 'y axis')
      .call(yaxis);



    //Add legends
    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width + 5)
      .attr('y', function(d){return yScale(d3.max(data_dict['Catan=count']))})
      .attr('fill', colors[0])
      .text('Catan')

    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Dominion=count']))})
      .attr('fill', colors[1])
      .text('Dominion')


    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Codenames=count']))})
      .attr('fill', colors[2])
      .text('Codenames')


    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Terraforming Mars=count']))})
      .attr('fill', colors[3])
      .text('Terraforming Mars')


    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Gloomhaven=count']))})
      .attr('fill', colors[4])
      .text('Gloomhaven')

    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Magic: The Gathering=count']))})
      .attr('fill', colors[5])
      .text('Magic: The Gathering')

    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Dixit=count']))})
      .attr('fill', colors[6])
      .text('Dixit')

    linesA.append('g')
      .selectAll('line')
      .data(data)
      .enter()
      .append('text')
      .attr('x', width+10)
      .attr('y', function(d){return yScale(d3.max(data_dict['Monopoly=count']))})
      .attr('fill', colors[7])
      .text('Monopoly')

    // Add the text label for axes
    const xAxisA = plot.append("g")
      .attr('id', 'x-axis-a')

    xAxisA.append('text')
      .attr("x", width/2)
      .attr('y', height+ 50)
      .attr("text-anchor", "middle")
      .attr("stroke", "black")
      .text("Month");

    const yAxisA = plot.append("g")
      .attr('id', 'y-axis-a')
      .attr("transform", "rotate(-90)");

    yAxisA.append('text')
      .attr("x", -120)
      .attr("y", 25)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Number of Ratings");

  })

}
