
const margin = 50
const width = 800 - margin / 2
const height = 350 - margin / 2
const innerTranslation = `translate(${margin},${margin})`

const yearsData = {
  '2015': [],
  '2016': [],
  '2017': [],
  '2018': [],
  '2019': [],
}

d3.csv('average-rating.csv').then(function(data) {
  data.forEach(d => {
    d.average_rating = Math.floor(d.average_rating);
    d.users_rated = +d.users_rated;
  })
  const groupByRatings = function(d) {
    const q1Data = [],
      categories = []
    let maxCount = 0;
    for (let i = 0; i < 10; i++) {          // Initialize q1Data
      let currDict = {};
      for (let y = 2015; y < 2020; y++) {
        currDict['rating'] = i;
        currDict[y.toString()] = 0;
        if( i === 0) { categories.push(y.toString()); }
      }
      q1Data.push(currDict);
    }
    for (let i = 0; i < d.length; i++) {
      let currRating = d[i]['average_rating'],
        currYear = d[i]['year'];
      if (parseInt(currYear) >= 2015 && parseInt(currYear) <= 2019) {
        q1Data[currRating][currYear]++;
        maxCount = Math.max(maxCount, q1Data[currRating][currYear]);
      }
    }
    return [q1Data, categories, maxCount];
  }
  const [q1Data, categories, maxCount] = groupByRatings(data);

  // Scale the range of the data and set the ranges:
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(q1Data, function(d) { return d.rating; }));
  y.domain([0, maxCount+50]);

  // Define colors:
  const lineArray = []
  const colorArray = [d3.schemeCategory10, d3.schemeAccent]
  const colorScheme = d3.scaleOrdinal(colorArray[0]);
  const svgMain = d3.select('body')
    .append('svg')
    .attr("width", width + margin * 2)
    .attr("height", height + margin * 2)
    .attr("transform", innerTranslation)

  // generate color for each line:
  for (let i = 0; i < colorArray[0].length; i++) {
    const lineDict = {};
    lineDict.color = colorScheme(i);
    lineArray.push(lineDict);
  }

  for (let i = 0; i < q1Data.length; i++) {
    for (const key in yearsData) {
      yearsData[key].push({
        'year': key,
        'users rated': q1Data[i][key],
        'rating': q1Data[i]['rating']
      })
    }
  }

  const linesContainer = svgMain.append('g')
    .attr('id', 'lines')

  let i = 0
  for (const key in yearsData) {
    linesContainer.append('path')
      .attr('id', 'line' + key)
      .data([yearsData[key]])
      .attr("class", "line " + categories[i])
      .style('stroke', lineArray[i].color)
      .style('fill', 'none')
      .attr("d", d3.line()
        .x(d => x(+d.rating) + margin)
        .y(d => y(+d['users rated']) + margin)
      )

    i++
  }

  // Add the X axis:
  const xAxisLines = svgMain.append('g')
    .attr('id', 'x-axis-lines')
    .attr('transform', `translate(${margin}, ${height + margin})`)
    .call(d3.axisBottom(x)) // https://stackoverflow.com/questions/40173533/customize-the-d3-month-or-year-tick-format/40175517
  xAxisLines.append('text')
    .attr('class', 'x label')
    .attr('x', 225)
    .attr('y', height + 40)
    .text('Rating');

  // Add the Y Axis
  const yAxisLines = svgMain.append("g")
    .attr('id', 'y-axis-lines')
    .attr('transform', innerTranslation)
    .call(d3.axisLeft(y))

  yAxisLines.append('text')
    .attr('transform', 'rotate(270)')
    .attr('class', 'y label')
    .attr('x', -200)
    .attr('y', -50)
    .text('Count');


  const circlesContainer = svgMain.append('g')
    .attr('id', 'circles')
  let j = 0
  for (const key in yearsData) {

    circlesContainer.selectAll('myCircles')
      .attr('id', 'circle' + key)
      .data(yearsData[key])
      .enter()
      .append("circle") // Uses the enter().append() method
      .attr('fill', lineArray[j].color)
      .attr("cx", d => x(d.rating) + margin)
      .attr("cy", d => y(+d['users rated']) + margin)
      .attr("r", 2)
      .on('mouseover', mouseoverHandler)
      .on('mouseout', function(_) {
        d3.select(this).attr('r', 2)
        d3.select('#barchart').remove()
      })

    j++
  }

  svgMain.append('g')
    .attr('id', 'line_chart_title')
    .attr('transform', `translate(${width / 2 + 50}, ${margin / 2})`)
    .attr('width', width)
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .text('Board games by Rating 2015-2019')

  // Add my GT Username:
  svgMain.append('g')
    .attr('id', 'credit')
    .append('text')
    .attr('y', 20)
    .attr('x', width/2-150)
    .attr('stroke', 'steelblue')
    .attr('font-size', '15px')
    .attr('font-weight', 'bold')
    .text('GT Username: Yjones7')

  // Add legend:
  const legend = svgMain.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${width}, ${margin})`)

  for (let k = 0; k < categories.length; k++) {
    legend.append('circle')
      .attr('transform', `translate(0, ${k * 20 - 5})`)
      .attr("fill", _ => lineArray[k].color)
      .attr('r', 5)
  }

  for (let k = 0; k < categories.length; k++) {
    legend.append('text')
      .text(categories[k])
      .attr("fill", _ => lineArray[k].color)
      .attr("transform", `translate(15,${k * 20})`);
  }


  function mouseoverHandler(d) {
    let selectedYear = d.year
    const usersRating = d.rating;
    let q3Data = [], maxRated = []

    for (let i = 0; i < data.length; i++) {
      if (Math.floor(parseInt(data[i]['average_rating'])) === usersRating && data[i]['year'] === selectedYear) {
        if (q3Data && q3Data.length < 5) {
          q3Data.push(data[i]);
          maxRated.push(parseInt(data[i]['users_rated']))
        } else if (q3Data
          && q3Data.length >= 5
          && parseInt(data[i]['users_rated']) > Math.min(... maxRated)) {
          let minIndex = maxRated.indexOf(Math.min(... maxRated));
          q3Data[minIndex] = data[i];
          maxRated[minIndex] = parseInt(data[i]['users_rated']);
        }
      }
    }
    function sortData(aList) {                  // sort by descending order
      for (let i = 0; i < aList.length; i++) {
        let key = aList[i],
          j = i - 1;
        while (j >= 0 && parseInt(key['users_rated']) > parseInt(aList[j]['users_rated'])) {
          aList[j+1] = aList[j];
          j--;
        }
        aList[j+1] = key;
      }
    }
    sortData(q3Data);

    d3.select(this).attr('r', 8);
    let svgBar = d3.select('body')
      .append('svg')
      .attr('id', 'barchart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    let drawBarchart = function() {
      // drawing barchart:
      let xBarScaleC = d3.scaleLinear().range([0, width]);
      let yBarScaleC = d3.scaleBand().range([height, 0]).padding(.5);

      if (q3Data[0]) {
        xBarScaleC.domain([0, parseInt(q3Data[0]['users_rated'])]);
        yBarScaleC.domain(q3Data.map(
          d => (d.name.length > 10) ? d.name.slice(0,10) : d.name
        ).reverse())
      }

      svgBar.selectAll('.bar')
        .data(q3Data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .transition()
        .duration(300)
        .attr('width', d => xBarScaleC(+d.users_rated))
        .attr('y', d => yBarScaleC(d.name.slice(0,10)))
        .attr('height', yBarScaleC.bandwidth())

      // gridlines in x axis function
      function make_x_gridlines() {
        return d3.axisBottom(xBarScaleC)
          .ticks(10)
      }
      // add the x gridlines
      svgBar.append("g")
        .attr('class', 'grid')
        .attr("transform", "translate(0," + height + ")")
        .attr('stroke-opacity', .2)
        .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat(''));
      // Add title to barchart:
      svgBar.append('text')
        .attr('x', width/2-150)
        .attr('y', -10)
        .text('Top 5 Most Rated Games for ' + selectedYear.toString() + ' with Rating ' + usersRating.toString());
      // Add the x axis:
      svgBar.append('g')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBarScaleC))
        .style('font-size', '7px');
      svgBar.append('text')
        .attr('class', 'x label')
        .attr('x', 120)
        .attr('y', height + 40)
        .attr('font-weight', 'bold')
        .attr('font-size', '15px')
        .text('Number of Users');
      // add the y Axis
      svgBar.append("g")
        .call(d3.axisLeft(yBarScaleC));
      svgBar.append('text')
        .attr('transform', 'rotate(270)')
        .attr('class', 'y label')
        .attr('x', -120)
        .attr('y', -100)
        .attr('font-weight', 'bold')
        .attr('font-size', '15px')
        .text('Games');
    }
    drawBarchart();

  }

})
