//
// PARAMETERS
//
var radius = 5; // Pixel radius of a particle
var dim = 500; // Dimension of the canvas (square)
var K = 500; // Temperature of the system

//
// GLOBAL VARIABLES
//
var particles = []; // Particles to plot on the canvas
var selected = []; // Selected points

var simulation; // Simulation canvas
var ener_histogram; // Histogram canvas
var text_data; // Text box for single-valued data
var brush; // The selecting brush

var points; // Points on the simulation canvas

//
// Classes
//

// Particle class
var Particle = function (){

    var temp_x, temp_y;
    
    // Pind a postion that doesn't conflict with existing particles
    while(true){

    	// Generate a trial position
    	temp_x = Math.random() * (dim-2*radius) + radius;
    	temp_y = Math.random() * (dim-2*radius) + radius;

    	// Break out if we are not blocked
    	if(particles.every(is_unblocked(temp_x,temp_y))){
    		break;
    	}
    }

    // Set the position, radius, and velocity
    this.x = temp_x;
    this.dx = d3.random.normal(0,Math.sqrt(K))();

    this.y = temp_y;
    this.dy = d3.random.normal(0,Math.sqrt(K))();
    
    this.r = radius;
}

//
// FUNCTIONS
//

// Update the density text label
function update_dens_label(n){
  d3.select("#num_parts").attr("value",n);
  d3.select("#num_parts_value").text(n);
}

// Update the list of particles
function update_particle_list(n){
  // We are adding particles
  while(n > particles.length){
      particles.push(new Particle());
  }

  // We are removing particles
  while(n < particles.length){
      particles.pop();
  }
}

// Toggle the color of a point and set it as root
function toggle_selection(d){
  elem = selected.indexOf(d);
  
  if(elem != -1){
    // This element is already selected -> deselect
    d3.select(this).classed("selected",false);
    selected.splice(elem,1);
  
  } else {
    
    // The selector already has two elements - clear them
    if (selected.length == 2) {
      // Array is already full - deselect all
      points.filter(".selected").classed("selected",false);
      selected = [];
    }
    
    // The element is new - add to selection
    selected.push(d);
    d3.select(this).classed("selected",true);
  }
  
  toggle_distance_line();
}

// Toggle the distance line between two selected particles
function toggle_distance_line(){
  if(selected.length == 2){
    simulation.append("line")
              .attr("class","distance")
              .attr("x1",selected[0].x)
              .attr("y1",selected[0].y)
              .attr("x2",selected[1].x)
              .attr("y2",selected[1].y);
  } else {
    simulation.select("line.distance")
              .remove();
  }
}

// Compute the distance between two points
function distance(){
  if(selected.length == 2){
    p1 = selected[0];
    p2 = selected[1];

    return Math.sqrt( (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y) );
  }
}


// Calculate the density of the system
// If brushing - return density of selection
// If no selection - return density of whole system
function density(){
  if(!brush.empty()){

    var extent = brush.extent();
    var num_parts = points.filter(".grouped").size();

    var area = (extent[1][0]-extent[0][0])*(extent[1][1]-extent[0][1])/(4*radius*radius);
    
    return num_parts/area;

  } else{
    return points.size() / (dim * dim) * (4*radius*radius);
  }
}

function temperature(){
  var data;
  if(!brush.empty()){
    data = points.filter(".grouped").data();

  }else{
    data = particles;
  }

  data.map();

}

// Clear all selections when adjusting the
// number of particles in the simulation
function clear_selected(){
  brush_container.call(brush.clear());
  points.classed("grouped",false)
        .classed("selected",false);
  selected = [];
  toggle_distance_line();
}

// Draw the points on the canvas
function redraw_particles(){
  points = simulation.selectAll("circle")
                     .data(particles);

  points.enter()
        .append("circle")
        .attr("cx",function(d){return d.x})
        .attr("cy",function(d){return d.y})
        .attr("r",function(d){return d.r})
        .on("click", toggle_selection);

  points.exit()
        .remove();
}

// Draw the histogram
function redraw_histogram(){
    var dataset;
    
    // The data set is based off the brush selection
    if(!brush.empty()){
        dataset = points.filter(".grouped").data();
    } else {
        dataset = particles;
    }

    // Calculate the KE of each point
    var data = dataset.map(function(d){
                  return (d.dx*d.dx + d.dy*d.dy)/2;
               });

    // Scale the histogram axis appropriately
    var x = hist_dims.x_axis;

    // Split the x-range into 30 bins
    var num_splits = 50;
    var splits = d3.range(num_splits+1).map(function(i){return x.domain()[1]* i/num_splits});

    // Bin the data into 50 bins
    var bins = d3.layout.histogram()
                        .bins(splits)
                        (data);
    
    var y = hist_dims.y_axis
                     .domain([0, d3.max(bins, function(d) { return d.y; })])
    
    var bars = ener_histogram.selectAll(".bar")
                             .data(bins)
    bars.enter()
        .append("rect")
        .attr("class","bar")
            
    bars.exit()
        .remove();
        
    bars.attr("transform", function(d) {
           return "translate(" + x(d.x) + "," + y(d.y) + ")";
         })
         .attr("x",1)
         .attr("width",x(bins[0].dx) - 1)
         .attr("height", function(d) {
           return hist_dims.height - y(d.y);
         });
         
    ener_histogram.select(".y.axis")
                  .call(d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .tickFormat(d3.format("d"))
                  );
}

function update_labels(){
  text_data.select("#label_density").text("Density: " + density());
  text_data.select("#label_temperature").text("Temperature: " + density());
  text_data.select("#label_velocity").text("Average Velocity: " + density());
}

// Highlight brushed points
function brushed(){
  var extent = brush.extent();
  points.classed("grouped", function(d) {
    return extent[0][0] <= d.x && d.x < extent[1][0]
        && extent[0][1] <= d.y && d.y < extent[1][1];
  });
  
  redraw_histogram();
  update_labels();
}

// Generator to check if two elements are collided
function is_unblocked(x,y){
  return function(elem){
    return (4*radius*radius) < (elem.x-x)*(elem.x-x) + (elem.y-y)*(elem.y-y);
  }
}

//
// INITIATION
//

// Some size considerations
var max_particles  = (dim*dim) / (radius*radius) / 8;
var init_num_particles = max_particles / 2;

var hist_margin = {top: 20, right: 20, bottom: 30, left: 40};
var hist_dims = {height: dim/2-hist_margin.top-hist_margin.bottom,
                 width: dim-hist_margin.left-hist_margin.right,
                 x_axis: d3.scale.linear().range([0,dim-hist_margin.left-hist_margin.right]).domain([0, 3000]),
                 y_axis:  d3.scale.linear().rangeRound([dim/2-hist_margin.top-hist_margin.bottom,0])};

var text_margin = {top: dim/2+15, right: 20, bottom: 20, left: 20};
var text_dims = {height: dim/2-15-text_margin.bottom,
                 width: dim-text_margin.left-text_margin.right};

// Adjust the sizing of the title
d3.select("h1")
  .style("width",(2*dim)+"px");

// Create the simulation canvas
simulation = d3.select("body")
               .append("svg")
               .attr("width",dim)
               .attr("height",dim);
               
// Side canvas to hold the energy histogram & data                
var sideinfo = d3.select("body")
                 .append("svg")
                 .attr("width",dim)
                 .attr("height",dim);
             
// Histogram component of the side bar
ener_histogram = sideinfo.append("g")
                         .attr("transform", "translate(" + hist_margin.left + "," + hist_margin.top + ")");

ener_histogram.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + hist_dims.height + ")")
              .call(d3.svg.axis()
                  .scale(hist_dims.x_axis)
                  .orient("bottom")
              );
              
ener_histogram.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "middle")
              .attr("x", hist_dims.width/2)
              .attr("y", dim/2-15)
              .text("Kinetic Energy");
              
ener_histogram.append("text")
              .attr("class", "y label")
              .attr("text-anchor", "middle")
              .attr("y", -hist_margin.left/1.5)
              .attr("x", -hist_dims.height/2)
              .attr("transform", "rotate(-90)")
              .text("Count");
                          
ener_histogram.append("g")
              .attr("class", "y axis")
              .call(d3.svg.axis()
                  .scale(hist_dims.y_axis)
                  .orient("left")
              );
                  
// Text box for single-valued updates      
text_data = sideinfo.append("g")
                    .attr("transform", "translate(" + text_margin.left + "," + text_margin.top + ")")
text_data.append("text")
         .attr("class","label heading")
         .attr("id","label_heading")
         .attr("text-anchor","middle")
         .attr("y",20)
         .attr("x",text_dims.width/2)
         .text("Statistics for the complete ensemble:");

text_data.append("text")
         .attr("class","label")
         .attr("id","label_density")
         .attr("text-anchor","left")
         .attr("y",50)
         .attr("x",15)
         .text("Density:");

text_data.append("text")
         .attr("class","label")
         .attr("id","label_temperature")
         .attr("text-anchor","left")
         .attr("y",70)
         .attr("x",15)
         .text("Temperature:");

text_data.append("text")
         .attr("class","label")
         .attr("id","label_velocity")
         .attr("text-anchor","left")
         .attr("y",90)
         .attr("x",15)
         .text("Average Velocity:");

// Brush for point selection
brush = d3.svg.brush()
              .x(d3.scale.identity().domain([0, dim]))
              .y(d3.scale.identity().domain([0, dim]))
              .on("brush",brushed);

// Append the brush to the canvas
var brush_container = simulation.append('g')
                                .attr("class","brush")
                                .call(brush);

// Init the simulation and attach an event listener
// to the slider controlling the number of particles
var slider = d3.select("#num_parts")
               .attr("value",init_num_particles)
               .attr("max",max_particles)
               .style("width",(0.75*dim).toString()+"px")
               .call(function(){
                  update_dens_label(init_num_particles);
                  update_particle_list(init_num_particles);
                  redraw_particles();
                  redraw_histogram();
                  update_labels();
               })
               .on("input",function(){
                  clear_selected();
                  update_dens_label(this.value);
                  update_particle_list(this.value);
                  redraw_particles();
                  redraw_histogram();
                  update_labels();
               });

// References
// http://bl.ocks.org/mbostock/fe3f75700e70416e37cd
// https://github.com/reem/d3-particle-simulator
// http://bl.ocks.org/mbostock/4343214
// https://github.com/mbostock/d3/wiki/SVG-Controls
// http://bl.ocks.org/mbostock/4565798
// https://mbostock.github.io/d3/talk/20111018/collision.html