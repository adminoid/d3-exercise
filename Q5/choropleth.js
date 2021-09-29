
// define margin and dimensions for svg
const margin = {top: 50, right: 50, bottom: 50, left: 50};
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// define projection and path required for Choropleth
const projection = d3.geoEqualEarth();
const path = d3.geoPath(projection);

// define tooltip
const tip = d3.tip().attr('class','d3-tip').offset([10,10])
  .html(function(d){
    return "Country:" + d.properties.name
      + "<br/> Game: " + d.properties.game
      + "<br/> Avg Rating: " + d.properties.avg_rating
      + "<br/> Number of Users: " + d.properties.users});

// define any other global variables
let world = []
const dataset = []
const allGroup = new Set()
const myArr = []

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + ", "+ 1.5*margin.bottom+")")
  .call(tip);

// enter code to read files
Promise.all([d3.json('world_countries.json'), d3.dsv(",","ratings-by-country.csv").then(function(data){
  for (let i = 0; i < data.length; i++){
    dataset.push({country:data[i]['Country'], game:data[i]['Game'], users:data[i]["Number of Users"], avg_rating: +data[i]["Average Rating"]}); //+d[i] convert string to integer
    allGroup.add(data[i].Game); //use for the dropdown list, it is setup as a set, only contain distinct value
  }
  for (
    let it = allGroup.values(), val= null;
    val=it.next().value;
  ) {
    myArr.push(val); //convert set to array for the usage of the dropdown list
  }
})
])
  .then(function(files){
    world = files[0].features;
    // enter code to create color scale
    const colorType = ['#eff3ff','#bdd7e7','#6baed6','#2171b5'];
    const color = d3.scaleQuantile()
      .domain([0,10])
      .range(colorType);
    // create legend and all the texts
    svg.append("g")
      .attr("class", "legendQuant")
      .attr("transform", "translate(20,320)");

    const legend = d3.legendColor()
      .cells([0,2.5,5,7.5,10])
      .shapeWidth(20)
      .orient('vertical')
      .title("Average Rating:")
      .scale(color)

    svg.select(".legendQuant")
      .call(legend);

    svg.append("text")
      .attr("transform", "translate(500,510)")
      .text("Zliu723");

    svg.append("text")
      .attr("transform", "translate(-5,-10)")
      .text("Select Board Game: ");

    // create select button for the dropdown list
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(myArr)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; })

    // A function that update the chart
    // part 1: Build a function call "updated". it does 2 things: 1 allow the input "selectedGame" to filter the csv file "dataset" based on the game, 2. store it to country_by_game
    let country_by_game = []
    function update(selectedGame) {
      country_by_game = dataset.filter(function( d ) {
        return d.game == selectedGame;
      });
      // part 2: start the drawing, use the data "world" from the json file
      // the drawing is changed whenever the coutnry_by_name[country] matches the world[country]
      svg.append("g")
        .attr("class", "name")
        .selectAll("path")
        .data(world)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d){
          const ret = "gray"; //initial fill is gray
          for (let i = 0; i < country_by_game.length; i++) {
            if (d.properties.name == country_by_game[i].country) { //if the "country" from csv matches the "country" from json
              d.properties["game"] =  country_by_game[i].game //temporary insert the columns from csv to the json, not all for drawing, but for the tip function we define earlier
              d.properties["users"] = country_by_game[i].users
              d.properties['avg_rating'] = country_by_game[i].avg_rating
              return color(country_by_game[i].avg_rating);
            }
          }
          return ret;
        })
        .on('mouseover', tip.show) //the tip function is only good to use on the "world" data because of the format it was written
        .on('mouseout', tip.hide)
        .call(tip);
    }
    // Set default for the initial drawing
    update(myArr[0]);

    // set up the selectButton.
    // 1.if the option is selected from the list, the selection is returned to const selectedOption
    // 2.run the update function with this selected option
    d3.select("#selectButton").on("change", function(d) {
      const selectedOption = d3.select(this).property("value") // 1.
      update(selectedOption); // 2.
    })

  })
