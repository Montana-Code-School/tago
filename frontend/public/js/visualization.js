import * as d3 from 'd3';

$(function() {
  var margin = {
    top: 70,
    right: 40,
    bottom: 150,
    left: 60
  };

  var width = 610 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var formatTime = d3.timeFormat("%X");

  var legendRectSize = 12;
  var legendSpacing = 4;

  var graphElems = {
    colors: [
      "#ebff00",
      "#04d218",
      "#ff0000",
      "#1e90ff",
      "#4b0082",
      "#000000"
    ],
    zones: [],
    maxActivity: 0
  }

  var svg = d3.select("#graph-container").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .style("background-color", "#d8e0f0").append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function parseData(data){
    var image = new Image( ) ;
    var prefix = "data:image/png;base64,"
    var completedString = prefix.concat(data.image)

    image.src = completedString;

    if ( $('#heat-map').children().length >= 1 ) {
      $('#heat-map').children().remove()
    }

    document.getElementById('heat-map').appendChild(image);
  }

  function setMaxActivity(domain) {
    for (var i = 0; i < domain.zones.length; i++) {
      var rhett = domain.zones[i].intervals.map(function(v, i) {
        return Number(v.activity);
      }).reduce(function(a, b) {
        return Math.max(a, b);
      });

      if (rhett > graphElems.maxActivity) {
        graphElems.maxActivity = rhett;
      }
    }
  }

  function drawGraph(domain) {

    setMaxActivity(domain);

    for (var i = 0; i < domain.zones.length; i++) {
      let zoneColor = d3.rgb(domain.zones[i].color[2],domain.zones[i].color[1],domain.zones[i].color[0])

      if(domain.zones[i].intervals.length > 30) {
        domain.zones[i].intervals = domain.zones[i].intervals.splice(
          domain.zones[i].intervals.length-30,
          domain.zones[i].intervals.length-1
        )
      }

      domain.zones[i].intervals.map(function(d) {
        var dc = new Date(d.dateCreated);

        d.date = +d.dateCreated;
        d.activity = +d.activity;
      });

      graphElems.zones = domain.zones;

      x.domain(d3.extent(domain.zones[i].intervals, function(d) { return d.date; }));
      y.domain([0, graphElems.maxActivity]);

      var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.activity); });

      svg.append("path")
        .data([domain.zones[i].intervals])
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke", zoneColor)
        .style("stroke-width", 2.5)
        .attr("d", valueline);

      svg.selectAll("dot")
          .data(domain.zones[i].intervals)
        .enter().append("circle")
          .style("fill", zoneColor)
          .attr("r", 6)
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.activity); })
          .on("mouseover", function(d) {
            div.transition()
            .duration(200)
            .style("opacity", .9);

            div.html(formatTime(d.date) + "<br/>" + d.activity.toFixed(3))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
            .style("opacity", 0)
            .duration(5)
            .style("left", "0px")
            .style("top", "0px");
          });
    }

    var legend = svg.selectAll('.legend')
        .data(graphElems.zones)
      .enter().append("g")
        .attr("class", "legend")
        .attr("background-color", "yellow")
        .attr("transform", function(d, i) {
          var height = legendRectSize + legendSpacing;
          var offset = -380;
          var horz = -2 * legendRectSize;
          var vert = (i * height) - offset;
          return "translate(" + horz + ", " + vert + ")";
        });

    legend.append("rect")
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", function(d,i){

        let zoneColor = d3.rgb(domain.zones[i].color[2],domain.zones[i].color[1],domain.zones[i].color[0])
        return zoneColor;

      })
      .style("stroke", function(d,i){
        let zoneColor = d3.rgb(domain.zones[i].color[2],domain.zones[i].color[1],domain.zones[i].color[0])
        return zoneColor;
      });

    legend.append("text")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function(d) {return d.name; });

    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%X")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svg.append("text")
      .attr("transform",
      "translate(" + (width/2) + " ," +
      (height + margin.top + 15) + ")")
      .attr("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Time");

    svg.append("g")
      .attr("class", "axisSteelBlue")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Activity");

    svg.append("text")
      .attr("x", (width / 2))
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("text-decoration", "underline")
      .text("Activity vs. Time");
  }

  function getTagoData(){
    let duration = $("#intervalPicker").val()

    if(!duration) {
      duration = 60;
    }

    $.ajax({
      type:'GET',
      contentType:'application/json; charset=utf-8',
      url:'https://tago-app.herokuapp.com/api/domain/currentZones/' + duration,
      dataType:"json",
      success: function(domain, error) {
        if (error != 'success') console.log(error);

        var heatmap = domain.heatmaps.pop();
        parseData(heatmap);
        drawGraph(domain);
      }
    });
  }

  $("#intervalPicker").change(function() {
    svg.selectAll("*").remove()
    getTagoData()
  });

  getTagoData();

  $('.lightbox_trig').click(() => {
    var image_href = $(this).find('img').attr('src');

    if ($('#lightbox').length > 0) {
      $('#content').html('<img src="' + image_href + '" />');
      $('#lightbox').show();

    } else {
      var lightbox =
        '<div id="lightbox">' +
        '<div id="content">' +
        '<img src="' + image_href + '" />' +
        '</div>' +
        '</div>';

      $('body').append(lightbox);
    }

    $('#lightbox').click(() => {
      $('#content img').remove()
      $('#lightbox').hide();
    });
  });

  $('.graphLB').click(() => {

    let graphRef = $('svg')[0]

    if ($('#lightbox').length > 0) {
      console.log("greater than")
      $('svg').clone().appendTo('#content');
      $('#lightbox').show();
    } else {
      console.log(graphRef)
      var lightbox =
        '<div id="lightbox">' +
        '<div id="content">' +
        '</div>' +
        '</div>';

      $('body').append(lightbox);
      $('svg').clone().appendTo('#content');
      // $('#content').append(graphRef)
    }

    $('#lightbox').click(() => {
      $('#lightbox').hide();
      $('#content svg').remove()
    });
  });

});
