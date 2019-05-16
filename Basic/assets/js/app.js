var svgWidth = 750;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60, 
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart and shift the latter by left and top margins
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data.csv").then(function(censusData) {
    
    // Parse Data & Cast as numbers
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Initialize tooltip
    var toolTip = d3.tip() 
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return  `${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`; 
    });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(censusData, d => d.poverty))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(censusData, d => d.healthcare)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom().scale(xLinearScale);
    var leftAxis = d3.axisLeft().scale(yLinearScale);

    // Append axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("Circle").data(censusData).enter();

    // Append the circles for each row of data (i.e. state)
    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "#89bdd3") 
      // Define event handler for hovering
      .on("mouseover", function(d) {
        toolTip.show(d, this);
      })
      // Define event handler for mouseout
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });
   

    // Append labels for the circles with state abbreviations
    circlesGroup
      .append("text")
      .text(function(d) {
        return d.abbr;
      })
      .attr("dx", function(d) {
        return xLinearScale(d.poverty);
      })
      .attr("dy", function(d) {
        return yLinearScale(d.healthcare);
      })      
      .attr("font-family", "sans-serif")
      .attr("font-size", "15px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      // Define event handler for hovering
      .on("mouseover", function(d) {
        toolTip.show(d);
      })
      // Define event handler for mouseout
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });

    // Create Y-axis labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("Lacks Healthcare (%)");

    // Create X-axis labels
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
      .attr("class", "axisText")
      .style("text-anchor", "middle")
      .text("In Poverty (%)");
  });
