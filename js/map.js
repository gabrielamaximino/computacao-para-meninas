// set the dimensions and margins of the graph
var margin = {top: 20, right: 10, bottom: 40, left: 100},
    width = 600 - margin.left - margin.right,
       height = 400 - margin.top - margin.bottom;

// The svg
var svg = d3.select("svg")
 .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
// create a tooltip
var tooltip = d3.select("#tooltip")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
 
      
// Map and projection
//var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2 - margin.left, height / 2]);

// Data and color scale
var data = d3.map();

var domain = [0, 10]
var labels = ["0", "5 - 10", "> 10"]
var range = ["#F8CAEE","#BF76AF","#852170"]
var colorScale = d3.scaleThreshold()
  .domain(domain)
  .range(range);


var promises = []
promises.push(d3.json("https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson"))
promises.push(d3.csv("./infos.csv", function(d) { data.set(d.sigla, +d.artigos); }))


myDataPromises = Promise.all(promises).then(function(topo) {
	
	let mouseOver = function(d) {
        console.log("D É: ", d)

    	d3.selectAll(".topo")
      		.transition()
      		.duration(200)
      		.style("opacity", .5)
    
    	d3.select(this)
    		.transition()
      		.duration(200)
      		.style("opacity", 1)
      		.style("stroke", "black")
      
      	d.total = data.get(d.id) || 0;
      	
      	tooltip
          	.style("opacity", 0.8)
          	.html(d.id + ": " + d3.format(",.2r")(d.total))
          	.style("left", (d3.event.pageX) + "px")		
          	.style("top", (d3.event.pageY - 28) + "px");

  }

  let mouseLeave = function(d) {
    d3.selectAll(".topo")
      .transition()
      .duration(200)
      .style("opacity", .7)
      
    d3.selectAll(".topo")
      .transition()
      .duration(200)
      .style("stroke", "transparent")
      
    d3.select("#annotation")
    	.style("opacity", 1)
      
    tooltip
          .style("opacity", 0)
  }

	var topo = topo[0]

  	// Draw the map
  	svg.append("g")
    	.selectAll("path")
    	
    	.data(topo.features)
    	.enter()
    	.append("path")
    	.attr("class", "topo")
      	// draw each country
      	.attr("d", d3.geoPath()
        	.projection(projection)
      	)
      	// set the color of each country
      	.attr("fill", function (d) {
        	d.total = data.get(d.id) || 0;
        	return colorScale(d.total);
      	})
      	.style("opacity", .7)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      
      
    // legend
    var legend_x = width - margin.left
    var legend_y = height - 30
    svg.append("g")
  		.attr("class", "legendQuant")
  		.attr("transform", "translate(" + legend_x + "," + legend_y+")");

	var legend = d3.legendColor()
    	.labels(labels)
    	.title("Population")
    	.scale(colorScale)
    
    
     svg.select(".legendQuant")
  		.call(legend);
  

  svg.append("g")
  .style("opacity", 1)
  .attr("id", "annotation")
  .call(makeAnnotations)

    })
    