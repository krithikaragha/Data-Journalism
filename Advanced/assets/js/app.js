var svgWidth = 750;
var svgHeight = 500;

var xMin;
var xMax;
var yMin;
var yMax;

var currentX = "poverty";
var currentY = "healthcare";

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
  .attr("height", svgHeight)
  .attr("class", "chart");

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a group element with SVG for y-axis labels
chartGroup.append("g").attr("class", "yLabel");
var yLabel = d3.select(".yLabel");

// Create y-axis labels
// Lacks Healthcare
yLabel
  .attr("transform", "rotate(-90)")
  .append("text")
  .attr("y", 0 - margin.left + 52)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "healthcare")
  .attr("class", "aText active y")
  .style("text-anchor", "middle")
  .text("Lacks Healthcare (%)");

// Smokes
yLabel
  .attr("transform", "rotate(-90)")
  .append("text")
  .attr("y", 0 - margin.left + 32)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "smokes")
  .attr("class", "aText inactive y")
  .style("text-anchor", "middle")
  .text("Smokes (%)");

// Obesity
yLabel
  .attr("transform", "rotate(-90)")
  .append("text")
  .attr("y", 0 - margin.left + 12)
  .attr("x", 0 - (height / 2))
  .attr("data-axis", "y")
  .attr("data-name", "obesity")
  .attr("class", "aText inactive y")
  .style("text-anchor", "middle")
  .text("Obese (%)");

// Create a group element with SVG for x-axis labels
chartGroup.append("g").attr("class", "xLabel");
var xLabel = d3.select(".xLabel");

// Create x-axis labels
// Poverty
xLabel
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 12})`)
  .attr("y", -3)
  .attr("data-name", "poverty")
  .attr("data-axis", "x") 
  .attr("class", "aText active x") 
  .style("text-anchor", "middle")
  .text("In Poverty (%)");

// Age
xLabel
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 24})`)
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x") 
  .attr("class", "aText inactive x") 
  .style("text-anchor", "middle")
  .text("Age (Median)");

// Income
xLabel
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 36})`)
  .attr("y", 3)
  .attr("data-name", "income")
  .attr("data-axis", "x") 
  .attr("class", "aText inactive x") 
  .style("text-anchor", "middle")
  .text("Household Income (Median)");

// Import Data
d3.csv("data.csv").then(function(censusData) {

    // Parse the data and cast as numbers
    censusData.forEach(function(data) {
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // Initialize tooltip
    var toolTip = d3.tip() 
      .attr("class", "tooltip")
      .offset([40, -60])
      .html(function(d) {
        var xVal;
        var state = "<div>" + d.state + "</div>";
        var yVal = "<div>" + currentY + ": " + d[currentY] + "%</div>";
        if (currentX === "poverty") {
          xVal = "<div>" + currentX + ": " + d[currentX] + "%</div>";
        }
        else {
          xVal = "<div>" + currentX + ": " + parseFloat(d[currentX]).toLocaleString("en") + "</div>";
        }
        return state + xVal + yVal; 
    });

    // Create tooltip in the chart
    svg.call(toolTip);

    // Create a function to get the min and max values for X-axis
    function xMinMax() {
        xMin = d3.min(censusData, function(d) {
            return parseFloat(d[currentX]) * 0.90;
        });

        xMax = d3.max(censusData, function(d) {
            return parseFloat(d[currentX]) * 1.10;
        });
    }

    // Create a function to get the min and max values for Y-axis
    function yMinMax() {
        yMin = d3.min(censusData, function(d) {
            return parseFloat(d[currentY]) * 0.90;
        });

        yMax = d3.max(censusData, function(d) {
            return parseFloat(d[currentY]) * 1.10;
        });
    }

    // Create a function that changes the class and appearance of X/Y labels when clicked
    function changeLabel(axis, textClicked) {
        // Toggle between active/inactive classes for the axis
        d3
          .selectAll(".aText")
          .filter("." + axis)
          .filter(".active")
          .classed("active", false)
          .classed("inactive", true);

        // Toggle between active/inactive classes for the labels
        textClicked
          .classed("inactive", false)
          .classed("active", true);
    }

    // Grab xMin, xMax, yMin and yMax values by calling the appropriate functions
    xMinMax();
    yMinMax();

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Create the axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart
    chartGroup
      .append("g")
      .call(bottomAxis)
      .attr("class", "xAxis")
      .attr("transform", `translate(0, ${height})`);

    chartGroup
      .append("g")
      .call(leftAxis)
      .attr("class", "yAxis");

    // Create the circles
    var circles = chartGroup.selectAll("g").data(censusData).enter();

    // Append the circles for each row of data (i.e. the state)
    circles
      .append("circle")
      .attr("cx", function(d) {
          return xLinearScale(d[currentX]);
      })
      .attr("cy", function(d) {
          return yLinearScale(d[currentY]);
      })
      .attr("r", "15")
      .attr("fill", "#89bdd3")
      .attr("class", function(d) {
          return "stateCircle" + d.abbr;
      })
      // Define event handler for hovering
      .on("mouseover", function(d) {
          toolTip.show(d, this);
      })
      // Define event handler for mouseout
      .on("mouseout", function(d) {
          toolTip.hide(d);
      });

    // Create labels for the circles with state abbreviations
    circles
      .append("text")
      .text(function(d) {
          return d.abbr;
      })
      .attr("dx", function(d) {
          return xLinearScale(d[currentX]);
      })
      .attr("dy", function(d) {
          return yLinearScale(d[currentY]) + (15 / 2.5);
      })
      .attr("class", "stateText")
      .attr("font-size", "15px")
      // Define event handler for hovering
      .on("mouseover", function(d) {
          toolTip.show(d);
      })
      // Define event handler for mouseout
      .on("mouseout", function(d) {
          toolTip.hide(d);
      });

    // Define event handler for X-axis/Y-axis labels
    d3.selectAll(".aText").on("click", function() {
        
      // Grab the object itself
      var self = d3.select(this);

      // Execute if label is inactive
      if(self.classed("inactive")) {
        // Grab the name and axis 
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        // Execute if x-axis label is inactive
        if (axis === "x") {

          // Set currentX to be equal to the label name
          currentX = name;

          // Get new xMin and xMax values
          xMinMax();

          // Redefine the domain of X-axis with new xMin and xMax values
          xLinearScale.domain([xMin, xMax]);

          // Redraw the X-axis & define a transition for when we update the X-axis
          chartGroup.select(".xAxis").transition().duration(300).call(bottomAxis);

          // Update the location of the circles
          d3.selectAll("circle").each(function() {
              // Define a transition for each circle
              d3
                .select(this)
                .transition()
                .attr("cx", function(d) {
                    return xLinearScale(d[currentX]);
                })
                .duration(300);
          });

          // Update the location of the circle labels with state abbreviations
          d3.selectAll(".stateText").each(function() {
              // Define a transition for each label
              d3
                .select(this)
                .transition()
                .attr("dx", function(d) {
                  return xLinearScale(d[currentX]);
                })
                .duration(300);
          });

          // Change classes for last active label and the label which was clicked
          changeLabel(axis, self);
        }
        // Execute if y-axis label is inactive
        else {

          // Set currentY to be equal to the label name
          currentY = name;

          // Get new yMin and yMax values
          yMinMax();

          // Redefine the domain of Y-axis with new yMin and yMax values
          yLinearScale.domain([yMin, yMax]);

          // Redraw the Y-axis & define a transition for when we update the Y-axis
          chartGroup.select(".yAxis").transition().duration(300).call(leftAxis);

          // Update the location of the circles
          d3.selectAll("circle").each(function() {
              // Define a transition for each circle
              d3
                .select(this)
                .transition()
                .attr("cy", function(d) {
                  return yLinearScale(d[currentY]);
                })
                .duration(300);
          });

          // Update the location of the circle labels with state abbreviations
          d3.selectAll(".stateText").each(function() {
              // Define a transition for each label
              d3
                .select(this)
                .transition()
                .attr("dy", function(d) {
                  return yLinearScale(d[currentY]) + (15 / 3);
                })
                .duration(300);
          });

          // Change classes for last active label and the label which was clicked
          changeLabel(axis, self);
        }
      }  // End of outer if block
    });    // End of inner d3
}); // End of outer d3


