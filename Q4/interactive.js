
const margin = {top: 50, right: 200, bottom: 50, left: 150},
  width = 800 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

const yearsData = {
  '2015': [],
  '2016': [],
  '2017': [],
  '2018': [],
  '2019': [],
}

d3.csv('average-rating.csv').then(function(data) {
  data.forEach(function (d) {
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
  const svg1 = d3.select('body')
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('viewBox', [0,0,width,height]);
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

  let i = 0
  for (const key in yearsData) {
    svg1.append('path')
      .attr('id', 'line' + key)
      .data([yearsData[key]])
      .attr("class", "line " + categories[i])
      // .style('stroke', colorScheme[i])
      .style('stroke', lineArray[i].color)
      .style('fill', 'none')                // Remove shaded area
      .attr("d", d3.line()
        .x(function(d) { return x(+d.rating); })
        .y(function(d) { return y(+d['users rated']); })
      )
    i++
  }

  svg1.selectAll('myCircles')
    .attr('id', 'circle2015')
    .data(yearsData["2015"])
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr('fill', lineArray[0].color)
    .attr("cx", function(d) { return x(d.rating) })
    .attr("cy", function(d) { return y(+d['users rated']) })
    .attr("r", 2)
    .on('mouseover', mouseoverHandler)
    .on('mouseout', function(_) {
      d3.select(this).attr('r', 2);
      d3.select('#barchart').remove();
    });
  svg1.selectAll('myCircles')
    .attr('id', 'circle2016')
    .data(yearsData["2016"])
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr('fill', lineArray[1].color)
    .attr("cx", function(d) { return x(d.rating) })
    .attr("cy", function(d) { return y(+d['users rated']) })
    .attr("r", 2)
    .on('mouseover', mouseoverHandler)
    .on('mouseout', function(_) {
      d3.select(this).attr('r', 2);
      d3.select('#barchart').remove();
    });
  svg1.selectAll('myCircles')
    .attr('id', 'circle2017')
    .data(yearsData["2017"])
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr('fill', lineArray[2].color)
    .attr("cx", function(d) { return x(d.rating) })
    .attr("cy", function(d) { return y(+d['users rated']) })
    .attr("r", 2)
    .on('mouseover', mouseoverHandler)
    .on('mouseout', function(_) {
      d3.select(this).attr('r', 2);
      d3.select('#barchart').remove();
    });
  svg1.selectAll('myCircles')
    .attr('id', 'circle2018')
    .data(yearsData["2018"])
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr('fill', lineArray[3].color)
    .attr("cx", function(d) { return x(d.rating) })
    .attr("cy", function(d) { return y(+d['users rated']) })
    .attr("r", 2)
    .on('mouseover', mouseoverHandler)
    .on('mouseout', function(_) {
      d3.select(this).attr('r', 2);
      d3.select('#barchart').remove();
    });
  svg1.selectAll('myCircles')
    .attr('id', 'circle2019')
    .data(yearsData["2019"])
    .enter()
    .append("circle") // Uses the enter().append() method
    .attr('fill', lineArray[4].color)
    .attr("cx", function(d) { return x(d.rating) })
    .attr("cy", function(d) { return y(+d['users rated']) })
    .attr("r", 2)
    .on('mouseover', mouseoverHandler)
    .on('mouseout', function(_) {
      d3.select(this).attr('r', 2);
      d3.select('#barchart').remove();
    });

  function mouseoverHandler(d) {
    console.log(d, d.year, d.rating, d['users rated']);
    let selectedYear = d.year
    const usersRating = d.rating;
    let q3Data = [], maxRated = []
    // const colorMap = {
    //   '2015': lineArray[0].color, '2016': lineArray[1].color, '2017': lineArray[2].color,
    //   '2018': lineArray[3].color, '2019': lineArray[4].color};

    let processBarData = function() {
      for (let i = 0; i < data.length; i++) {
        if (Math.floor(parseInt(data[i]['average_rating'])) === usersRating && data[i]['year'] === selectedYear) {
          if (q3Data.length < 5) {
            q3Data.push(data[i]);
            maxRated.push(parseInt(data[i]['users_rated']))
          }
          else if (q3Data.length >= 5 && parseInt(data[i]['users_rated']) > Math.min(... maxRated)) {
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
      // q3Data.forEach(function(d) { d.users_rated = d.users_rated } )
    }
    processBarData();           // Prepare data for drawing barchart.
    if (q3Data) {
      while (q3Data.length > 0 && q3Data.length < 5) {
        let specialSpace = '';
        for (let i = 0; i < q3Data.length; i++) { specialSpace += ' '}
        q3Data.push({
          'name': specialSpace,
          'year': selectedYear.toString(),
          'average_rating': 0,
          'users_rated': 0
        })
        console.log('q3Data length: ', q3Data.length);
      }
    }
    console.log('After q3Data: ', q3Data);
    d3.select(this).attr('r', 8);
    let bar_svg1 = d3.select('body')
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
      xBarScaleC.domain([0, parseInt(q3Data[0]['users_rated'])]);
      yBarScaleC.domain(q3Data.map(function(d) {
        if (d.name.length > 10) { return d.name.slice(0,10);}
        else {return d.name;} }).reverse());
      bar_svg1.selectAll('.bar')
        .data(q3Data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .transition()
        .duration(300)
        .attr('width', function(d) { return xBarScaleC(+d.users_rated); })
        .attr('y', function (d) { return yBarScaleC(d.name.slice(0,10)); })
        .attr('height', yBarScaleC.bandwidth())

      // gridlines in x axis function
      function make_x_gridlines() {
        return d3.axisBottom(xBarScaleC)
          .ticks(10)
      }
      // add the x gridlines
      bar_svg1.append("g")
        .attr('class', 'grid')
        .attr("transform", "translate(0," + height + ")")
        .attr('stroke-opacity', .2)
        .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat(''));
      // Add title to barchart:
      bar_svg1.append('text')
        .attr('x', width/2-150)
        .attr('y', -10)
        .text('Top 5 Most Rated Games for ' + selectedYear.toString() + ' with Rating ' + usersRating.toString());
      // Add the x axis:
      bar_svg1.append('g')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBarScaleC))
        .style('font-size', '7px');
      bar_svg1.append('text')
        .attr('class', 'x label')
        .attr('x', 120)
        .attr('y', height + 40)
        .attr('font-weight', 'bold')
        .attr('font-size', '15px')
        .text('Number of Users');
      // add the y Axis
      bar_svg1.append("g")
        .call(d3.axisLeft(yBarScaleC));
      bar_svg1.append('text')
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

  svg1.append('text')
    .attr('x', width/2-100)
    .attr('y', 0)
    .text('Board games by Rating 2015-2019');
  // Add the X axis:
  svg1.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x)) // https://stackoverflow.com/questions/40173533/customize-the-d3-month-or-year-tick-format/40175517
  svg1.append('text')
    .attr('class', 'x label')
    .attr('x', 225)
    .attr('y', height+40)
    .text('Rating');
  // Add the Y Axis
  svg1.append("g")
    .call(d3.axisLeft(y));
  svg1.append('text')
    .attr('transform', 'rotate(270)')
    .attr('class', 'y label')
    .attr('x', -200)
    .attr('y', -50)
    .text('Count');

  // Add legend:
  const lineLegend = svg1.selectAll('.lineLegend')
    .data(categories)
    .enter()
    .append('g')
    .attr('class', 'lineLegend')
    .attr('transform', function(d, i) {
      return 'translate(' + width + ',' + (i * 20) + ')';
    });
  lineLegend.append('text')
    .text(function(d) { return d;})
    .attr("transform", "translate(15,9)"); //align texts with boxes
  lineLegend.append("circle")
    .attr("fill", function (d, i) {return lineArray[i].color; })
    .attr('r', 5)

  // Add my GT Username:
  svg1.append('text')
    .attr('y', 20)
    .attr('x', width/2-150)
    .attr('stroke', 'steelblue')
    .attr('font-size', '15px')
    .attr('font-weight', 'bold')
    .text('GT Username: yyu441')
})
