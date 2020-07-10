var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var chart = d3.select("#scatter").append("div").classed("chart", true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (data, err) {
  if (err) throw err;
  console.log(data)
  // parse data
  data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.poverty), d3.max(data, d => d.poverty)])
    .range([0, width]);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.healthcare), d3.max(data, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xMin;
  var xMax;
  var yMin;
  var yMax

  xMin = d3.min(data, function (data) {
    return data.healthcare;
  });

  xMax = d3.max(data, function (data) {
    return data.healthcare;
  });

  yMin = d3.min(data, function (data) {
    return data.poverty;
  });

  yMax = d3.max(data, function (data) {
    return data.poverty;
  });

  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([yMin, yMax]);

  console.log(xMin);
  console.log(yMax);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.healthcare))
    .attr("cy", d => yLinearScale(d.poverty))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (data) {
      var stateName = data.state;
      var poverty = +data.poverty;
      var healthcare = +data.healthcare;
      return (stateName + "<br> In Poverty (%): " + poverty
      );
    });

  chartGroup.call(toolTip);

  // Updating circles group
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (healthData) {
    toolTip.show(healthData);
  })
    // onmouseout event
    .on("mouseout", function (healthData, index) {
      toolTip.hide(healthData);
    });

  chartGroup.append("text")
    .style("font-size", "10px")
    .selectAll("tspan")
    .data(data)
    .enter()
    .append("tspan")
    .attr("x", function (data) {
      return xLinearScale(data.healthcare);
    })
    .attr("y", function (data) {
      return yLinearScale(data.poverty);
    })
    .text(function (data) {
      return data.abbr
    });

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healtcare(%)");

  chartGroup.append("text")
    .attr("transform", `translate(${(width / 2.0) - margin.left}, ${height + margin.top + 40})`)
   //.attr("y", 0 - margin.left + 40)
   // .attr("x", 0 - (height / 1.5))
    .attr("class", "axisText")
    .text("In Poverty (%)");
});
