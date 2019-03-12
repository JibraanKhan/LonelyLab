var jsonData = d3.json('grades.json')
var publicData;
var screen = {
  width: 500,
  height: 500
};

jsonData.then(function(data){
   publicData = data;
   graphData(data, screen.width, screen.height);
}, function(error){
})

var graphData = function(data, width, height){
  if (width){
    screen.width = width;
  }
  if (height){
    screen.height = height;
  }
  //console.log(d3.max(data, function(d){ return d.name.length; }))
  var legend_margins = {
    top: screen.height * 0.1,
    bottom: screen.height * 0.01,
    left: screen.width * 0.01,
    right: screen.width * 0.01,
  };
  var legend_offset = {
    top: screen.height * 0.05,
    bottom: screen.height * 0.02,
    left: screen.width * 0.02,
    right: screen.width * 0.02,
  };
  var max_people = data.length;
  var rect_width = screen.width * 0.04;
  var legend_width = rect_width + legend_margins.left + legend_margins.right;
  var margins = {
    top: screen.height * 0.05,
    bottom: screen.height * 0.1,
    left: screen.width * 0.2,
    right: rect_width + legend_margins.left + legend_margins.right
  };
  var w = screen.width - margins.left - margins.right;
  var h = screen.height - margins.top - margins.bottom;
  var xScale = d3.scaleLinear()
                 .domain([0, d3.max(data, function(d){ return d.grades.length - 1; })])
                 .range([margins.left, w]);
  var xAxis = d3.axisTop(xScale)
                .ticks(data.length);
  var yScale = d3.scaleLinear()
                 .domain([d3.min(data, function(d){  return d.grades.reduce(function(a,b){ return Math.min(a,b); }); }), d3.max(data, function(d){ return d.grades.reduce(function(a,b){ return Math.max(a,b); }); })])
                 .range([h, margins.top]);
  var yAxis = d3.axisRight(yScale)
                .ticks(d3.max(data, function(d){ return d.grades.reduce(function(a,b){ return Math.max(a,b); }); }) / 20);
  var svg = d3.select('body').append('svg')
              .attr('width', screen.width)
              .attr('height', screen.height);
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var students = svg.selectAll('g')
                    .data(data)
                    .enter()
                    .append('g')
                    .classed('Student', true)
                    .attr('fill', function(d){
                      return color(d.name);
                    });
  var max_grades = function(){
    var max = 0;
    data.forEach(function(d){
      max += d.grades.length;
    })

    return max
  }

 max_grades();
  students.selectAll('circle')
          .data(function(d){ return d.grades; })
          .enter()
          .append('circle')
          .attr('cx', function(d, i){ return xScale(i); })
          .attr('cy', function(d){ return yScale(d); })
          .attr('r', ((h + w) * (1/max_grades())) * 0.5);

  var rect_height = (h/max_people) * 0.08;
  var legend_height = ((rect_height + legend_margins.bottom) * max_people) + legend_margins.top + legend_margins.bottom;
  var legend_x_scale = d3.scaleLinear()
                         .domain([w, screen.width])
                         .range([w + legend_offset.left, w + legend_offset.left + legend_width])
  var legend_y_scale = d3.scaleLinear()
                         .domain([0, screen.height])
                         .range([legend_offset.top, legend_offset.top + legend_height])
  var legend = svg.append('g')
                  .classed('legend', true);
  var legendlines = legend.selectAll('g')
                          .data(data)
                          .enter()
                          .append('g')
                          .classed('legendLines', true)
                          .attr('fill', function(d){
                            return color(d.name);
                          })

  var legend_x = legend_x_scale(w + legend_offset.left);
  var legend_y = legend_y_scale(0 + legend_offset.top);
  var text_lengths = [];
  var text_heights = [];
  var font_size = ((w + h) - max_people * 5) * 0.02

  legendlines.append('text')
             .attr('x', legend_x + legend_margins.left + rect_width + legend_margins.right + legend_offset.left)
             .attr('y', function(d, i){
               return (legend_margins.top + legend_offset.top) + (i * (legend_margins.top + rect_height)) + font_size/2;
             })
             .text(function(d){
               return d.name;
             })
             .each(function(d){
               text_lengths.push(this.getComputedTextLength());
               text_heights.push(d3.select('text').node().getBoundingClientRect().height)
             })
             .attr('font-size', font_size + 'px');

  var longest_text_length = text_lengths.reduce(function(a,b){ return Math.max(a,b); });
  var longest_text_height = text_heights.reduce(function(a,b){ return Math.max(a,b); });

  legendlines.append('rect')
             .attr('x', legend_x + legend_margins.left)
             .attr('y', function(d, i){
                  return ((legend_margins.top + legend_offset.top) + (i * (legend_margins.top + rect_height)));
             })
             .attr('width', rect_width)
             .attr('height', rect_height);

  svg.attr('width', screen.width + longest_text_length);

  svg.append('g')
     .classed('xAxis', true)
     .attr('transform', 'translate(0,' + screen.height * 0.95 + ')')
     .call(xAxis);

  svg.append('g')
     .classed('yAxis', true)
     .attr('transform', 'translate(' + (margins.left * 0.5) + ',0)')
     .call(yAxis);

  svg.append('text')
     .classed('LabelX', true)
     .attr('transform', 'translate(' + w/2 + ',' + screen.height + ')')
     .text('Exams')
     .attr('font-size', font_size);

  svg.append('text')
     .classed('LabelY', true)
     .attr('transform', 'translate('+ screen.width * 0.05 +',' + h/2 + ') rotate(-90)')
     .text('Grades')
     .attr('font-size', font_size);
}



















var update = function(e){
  var height = document.getElementById('Height').value;
  var width = document.getElementById('Width').value;
  if ((height == screen.height) && (width == screen.width)){
    return;
  }
  d3.select('.xAxis').remove();
  d3.select('.LabelX').remove();
  d3.select('.yAxis').remove();
  d3.select('.LabelY').remove();
  screen.width = width;
  screen.height = height;
  var legend_margins = {
    top: screen.height * 0.1,
    bottom: screen.height * 0.01,
    left: screen.width * 0.01,
    right: screen.width * 0.01,
  };
  var legend_offset = {
    top: screen.height * 0.05,
    bottom: screen.height * 0.02,
    left: screen.width * 0.02,
    right: screen.width * 0.02,
  };
  var max_people = publicData.length;
  var rect_width = screen.width * 0.04;
  var legend_width = rect_width + legend_margins.left + legend_margins.right;
  var margins = {
    top: screen.height * 0.05,
    bottom: screen.height * 0.1,
    left: screen.width * 0.2,
    right: rect_width + legend_margins.left + legend_margins.right
  };
  var w = screen.width - margins.left - margins.right;
  var h = screen.height - margins.top - margins.bottom;
  var xScale = d3.scaleLinear()
                 .domain([0, d3.max(publicData, function(d){ return d.grades.length - 1; })])
                 .range([margins.left, w]);
  var xAxis = d3.axisTop(xScale)
                .ticks(publicData.length);
  var yScale = d3.scaleLinear()
                 .domain([d3.min(publicData, function(d){  return d.grades.reduce(function(a,b){ return Math.min(a,b); }); }), d3.max(publicData, function(d){ return d.grades.reduce(function(a,b){ return Math.max(a,b); }); })])
                 .range([h, margins.top]);
  var yAxis = d3.axisRight(yScale)
                .ticks(d3.max(publicData, function(d){ return d.grades.reduce(function(a,b){ return Math.max(a,b); }); }) / 20);

  var svg = d3.select('body').append('svg')
              .attr('width', screen.width)
              .attr('height', screen.height);
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var students = svg.selectAll('g')
                    .data(publicData)
                    .enter()
                    .append('g')
                    .classed('Student', true)
                    .attr('fill', function(d){
                      return color(d.name);
                    });
  var max_grades = function(){
    var max = 0;
    publicData.forEach(function(d){
      max += d.grades.length;
    })

    return max
  }
  var rect_height = (h/max_people) * 0.08;
  var legend_height = ((rect_height + legend_margins.bottom) * max_people) + legend_margins.top + legend_margins.bottom;
  var legend_x_scale = d3.scaleLinear()
                         .domain([w, screen.width])
                         .range([w + legend_offset.left, w + legend_offset.left + legend_width])
  var legend_y_scale = d3.scaleLinear()
                         .domain([0, screen.height])
                         .range([legend_offset.top, legend_offset.top + legend_height])
  var legend = svg.append('g')
                  .classed('legend', true);
  var legendlines = legend.selectAll('g')
                          .data(publicData)
                          .enter()
                          .append('g')
                          .attr('fill', function(d){
                            return color(d.name);
                          })
  var legend_x = legend_x_scale(w + legend_offset.left);
  var legend_y = legend_y_scale(0 + legend_offset.top);
  var text_lengths = [];
  var text_heights = [];
  var font_size = ((w + h) - max_people * 5) * 0.02
  var svg = d3.select('svg');
  var legend = svg.select('.legend')
  var legendLines = legend.select('.legendLines')
  var rects = legend.selectAll('rect');
  var circles = svg.selectAll('.Student').selectAll('circle');
  var texts = legend.selectAll('text');

  texts.each(function(d){
    text_lengths.push(this.getComputedTextLength());
    text_heights.push(d3.select('text').node().getBoundingClientRect().height);
  });

  var longest_text_length = text_lengths.reduce(function(a,b){ return Math.max(a,b); });
  var longest_text_height = text_heights.reduce(function(a,b){ return Math.max(a,b); });

  svg.transition()
     .attr('width', width)
     .attr('height', height);

  rects.transition()
       .attr('x', legend_x + legend_margins.left)
       .attr('y', function(d, i){
               return ((legend_margins.top + legend_offset.top) + (i * (legend_margins.top + rect_height)));
       })
       .attr('width', rect_width)
       .attr('height', rect_height);

  circles.transition()
         .attr('cx', function(d, i){ return xScale(i); })
         .attr('cy', function(d){ return yScale(d); })
         .attr('r', ((h + w) * (1/max_grades())) * 0.5);

  texts.transition()
       .attr('x', legend_x + legend_margins.left + rect_width + legend_margins.right + legend_offset.left)
       .attr('y', function(d, i){
          return (legend_margins.top + legend_offset.top) + (i * (legend_margins.top + rect_height)) + font_size/2;
       })
       .text(function(d){
          return d.name;
       })
       .attr('font-size', font_size + 'px');

  svg.append('g')
     .classed('xAxis', true)
     .transition()
     .attr('transform', 'translate(0,' + screen.height * 0.95 + ')')
     .call(xAxis);

  svg.append('g')
     .classed('yAxis', true)
     .transition()
     .attr('transform', 'translate(' + (margins.left * 0.5) + ',0)')
     .call(yAxis);
}
