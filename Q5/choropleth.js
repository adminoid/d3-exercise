const margin = 80
const width = 850 - margin / 2
const height = 450 - margin / 2

// define projection and path required for Choropleth
const projection = d3.geoEqualEarth();
const path = d3.geoPath(projection);

// define any other global variables
let world = []
const dataset = []
const allGroup = new Set()
const myArr = []

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin * 2)
  .attr("height", height + margin * 2)

// enter code to read files
Promise.all([d3.json('world_countries.json'), d3.dsv(",","ratings-by-country.csv").then(function(data){
  for (let i = 0; i < data.length; i++){
    dataset.push({country:data[i]['Country'], game:data[i]['Game'], users:data[i]["Number of Users"], avg_rating: +data[i]["Average Rating"]}); //+d[i] convert string to integer
    allGroup.add(data[i]['Game']); //use for the dropdown list, it is setup as a set, only contain distinct value
  }
  for (let val of allGroup.values()) {
    myArr.push(val)
  }
})
])
  .then(files => {
    world = files[0].features;
    // enter code to create color scale
    const colorType = ['#eff3ff','#bdd7e7','#6baed6','#2171b5'];
    const color = d3.scaleQuantile()
      .domain([0,10])
      .range(colorType);

    // create select button for the dropdown list
    d3.select("#gameDropdown")
      .selectAll('myOptions')
      .data(myArr)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; })

    // define tooltip
    const tip = d3.tip().attr('id','tooltip').offset([10,10])
      .html(function(d){
        return "Country:" + d.properties.name
          + "<br/> Game: " + d.properties.game
          + "<br/> Avg Rating: " + d.properties.avg_rating
          + "<br/> Number of Users: " + d.properties.users});

    // A function that update the chart
    // part 1: Build a function call "updated". it does 2 things: 1 allow the input "selectedGame" to filter the csv file "dataset" based on the game, 2. store it to country_by_game
    let country_by_game = []
    let countriesMap = false
    function update(selectedGame) {
      country_by_game = dataset.filter(function( d ) {
        return d.game === selectedGame;
      });
      // part 2: start the drawing, use the data "world" from the json file
      // the drawing is changed whenever the country_by_name[country] matches the world[country]
      if (countriesMap) {
        svg.select('#countries').remove()
      }
      countriesMap = svg.insert("g", ":first-child")
        .attr("id", "countries")
        .selectAll("path")
        .data(world)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d){
          const ret = "gray"; //initial fill is gray
          for (let i = 0; i < country_by_game.length; i++) {
            if (d.properties.name === country_by_game[i].country) {
              d.properties["game"] =  country_by_game[i].game
              d.properties["users"] = country_by_game[i].users
              d.properties['avg_rating'] = country_by_game[i].avg_rating
              return color(country_by_game[i].avg_rating);
            }
          }
          return ret;
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .call(tip);
    }
    // Set default for the initial drawing
    update(myArr[0]);

    d3.select("#gameDropdown").on("change", function() {
      const selectedOption = d3.select(this).property("value")
      update(selectedOption)
    })

    const legendObject = d3.legendColor()
      .cells([0,2.5,5,7.5,10])
      .shapeWidth(20)
      .orient('vertical')
      .title("Average Rating:")
      .scale(color)

    svg.append("g")
      .attr("id", "legend")
      .attr("transform", "translate(20,320)")
      .call(legendObject)

    svg.append("text")
      .attr("transform", "translate(500,510)")
      .text("Yjones7");

    // create legend and all the texts
    // select label todo: move to visible area
    // svg.append("text")
    //   .attr("transform", "translate(145,0)")
    //   .text("Select Board Game:");

    // set up the gameDropdown.
    // 1.if the option is selected from the list, the selection is returned to const selectedOption
    // 2.run the update function with this selected option

  })
