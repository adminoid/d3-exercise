//python -m http.server 8000

window.addEventListener('DOMContentLoaded', (event) => {

  d3.dsv(",", "board_games.csv", function(d) {
    return {
      source: d.source,
      target: d.target,
      value: +d.value
    }
  }).then(function(data) {

    var links = data;

    var nodes = {};

    // compute the distinct nodes from the links.
    links.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
      link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });

    var width = 1200,
      height = 700;

    var force = d3.forceSimulation()
      .nodes(d3.values(nodes))
      .force("link", d3.forceLink(links).distance(100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-250))
      .alphaTarget(1)
      .on("tick", tick);

    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    // add the links
    var path = svg.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("class", "link") // 2b Styling Edges
      .style("stroke", function(d){
        if(d.value == 0) {return 'gray'} else if (d.value == 1 ){return 'green'}}) //Change link color
      .style("stroke-width", function(d){
        if(d.value == 0) {return 3} else if (d.value == 1 ){return 1}}) //Change link thinkness
      .style('stroke-dasharray', function(d){ //Dashed link if value is 1
        if(d.value == 1) {return ("3, 3")}})

    // define the nodes
    var node = svg.selectAll(".node")
      .data(force.nodes())
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("dblclick", dblclick);


    // add the nodes
    node.append("circle")
      .attr("r", function(d){ // 2.c.1 Scaling nodes based on node degree
        d.weight = path.filter(function(l){ //d.weight determines the degree of links on a given node
          return l.source.index == d.index || l.target.index == d.index}).size();
        var currentRadius = 5
        return currentRadius + (d.weight * 3); //Adjust current radius based on returned weight
      })
      .style('fill', function(d){ // 2.c.2 Use color to reflect node degree
        d.weight = path.filter(function(l){
          return l.source.index == d.index || l.target.index == d.index}).size();
        if (d.weight == 1) {return '#ece7f2'}

        else if (d.weight ==2 || d.weight ==3) {return '#a6bddb'}

        else if (3 < d.weight) {return '#2b8cbe'}
      });

    // Reference used learning to scale nodes properly: https://stackoverflow.com/questions/43906686/d3-node-radius-depends-on-number-of-links-weight-property


    // 2a. Add node labels at the top right of each node in bold
    node.append("text")
      .attr("x", 5)
      .attr("y", -10)
      .style("font-weight", 600)
      .text(function(d){return d.name})


    // add the curvy lines
    function tick() {
      path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
          d.source.x + "," +
          d.source.y + "A" +
          dr + "," + dr + " 0 0,1 " +
          d.target.x + "," +
          d.target.y;
      })
      ;

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    };


    function dragstarted(d) {
      if (!d3.event.active) force.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      d3.select(this) //2.d.2 Marking pinned nodes
        .append("text")
        .attr("class", "pinned")
        .attr("x", -10)
        .attr("y",-5)
        .text("*")
        .style("font-size", "16px")
    };

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    function dragended(d) {
      if (!d3.event.active) force.alphaTarget(0);
      if (d.fixed == true) {
        d.fx = d.x;
        d.fy = d.y;
      }
      else {
        d.fx = d.x; //2.d.1 Pining a dragged node
        d.fy = d.y;

      }
    };

    // 2.d.3 Double clicking to unpin and unmark a node
    function dblclick(d){
      d3.select(this).selectAll('text.pinned').remove()
      d.fx = null;
      d.fy = null;

    };

    //GT Username
    svg.append('g')
      .append('text')
      .attr('id', 'credit')
      .attr("transform", "translate(800,50)")
      .attr("text-anchor", "right")
      .attr("stroke", "black")
      .text("eperalta6");

  }).catch(function(error) {
    console.log(error);
  });

});
