// Define map size on screen
var width = 960,
    height = 600;

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-5, 0])
  .html(function(d) {
    console.log("O D É:, ", d.properties.nome)
    var dataRow = statesById.get(d.properties.nome);
      if (dataRow) {
          console.log(dataRow);
          return "Estado: " + dataRow.estado + "<br> Artigos publicados: " + dataRow.artigos;
      } else {
          console.log("no dataRow", d);
          return d.properties.nome + ": No data.";
      }
  })

var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.call(tip);

var g = svg.append("g");

// Align center of Brazil to center of map
var projection = d3.geo.mercator()
  .scale(650)
  .center([-52, -15])
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

var colorScale = d3.scale.linear().range(["#EBDEF0", "#76448A"])

var statesById = d3.map();

// Load data (asynchronously)
d3_queue.queue()
    .defer(d3.json, "files/br-states.json")
    .defer(d3.csv, "files/artigos_por_estado.csv", typeAndSet)
    .await(ready);

function typeAndSet(d) {
  d.artigos = +d.artigos;
  statesById.set(d.estado, d);
  return d;
}

function getColor(d) {
  var dataRow = statesById.get(d.properties.nome);
  if (dataRow) {
      console.log(dataRow);
      return colorScale(dataRow.artigos);
  } else {
      console.log("no dataRow", d);
      return "#ccc";
  }
}

function ready(error, brazil, artigos) {
  if (error) throw error;

  console.log(brazil);
  console.log(artigos);

  colorScale.domain(d3.extent(artigos, function(d) {return d.artigos;}));

  // Extracting polygons and contours
  var states = topojson.feature(brazil, brazil.objects.estados);
  var states_contour = topojson.mesh(brazil, brazil.objects.estados);

  // Desenhando estados
  g.selectAll(".estado")
      .data(states.features)
    .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr('fill', function(d,i) {
          console.log("aqui", d.properties.nome);
          return getColor(d);
      })
      .append("title");

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(20,20)");

  var legendLinear = d3.legend.color()
    .shapeWidth(30)
    .orient('horizontal')
    .scale(colorScale);

  svg.select(".legendLinear")
    .call(legendLinear);

  g.append("path")
    .datum(states_contour)
    .attr("d", path)
    .attr("class", "state_contour");
}

d3.select(self.frameElement).style("height", height + "px");