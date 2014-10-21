//
// PARAMETERS
//
var radius = 5; // Pixel radius of a particle
var dim = 500; // Dimension of the canvas (square)

//
// GLOBAL VARIABLES
//
var particles = []; // Particles to plot on the canvas
var points; // Points on the simulation canvas
var frame; // The canvas element
var brush; // The selecting brush
var brush_container; // Visual representation of the brush
var slider; // Slider for the density of the system
var selected = []; // Selected points

//
// Classes
//

// Particle class
var Particle = function (){

    var temp_x, temp_y;

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
    this.dx = Math.random()*2 - 1;

    this.y = temp_y;
    this.dy = Math.random()*2 - 1;
    
    this.r = radius;
}

//
// FUNCTIONS
//

// Update the density text label
function update_dens_label(n){
  d3.select("#density").attr("value",n);
  d3.select("#density_value").text(n);
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
  if(root.length == 2){
    
  }
	if(root == this) {
		d3.select(this).attr("class","regular");
		root = null;
	} else {
    d3.select(root).attr("class","regular");
		d3.select(this).attr("class","selected");
		root = this;
	}
}

// Clear the brush selection when adjusting
// the number of particles in the simulation
function clear_selected(){
  brush_container.call(brush.clear());
  points.classed("grouped",false)
        .classed("selected",false);
  root = [];  
}

// Draw the points on the canvas
function redraw_particles(){
  points = frame.selectAll("circle")
                .data(particles);

  points.enter()
        .append("circle")
        .attr("cx",function(d){return d.x})
        .attr("cy",function(d){return d.y})
        .attr("r",function(d){return d.r})
        .classed("regular",true)
        .on("click", toggle_selection);

  points.exit()
        .remove();

  clear_selected();
}

// Highlighed brushed points and 
function brushed(){
  var extent = brush.extent();
  points.classed("grouped", function(d) {
     return extent[0][0] <= d.x && d.x < extent[1][0]
         && extent[0][1] <= d.y && d.y < extent[1][1];
   });
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
max_particles  = (dim*dim) / (radius*radius) / 8;
init_num_particles = max_particles / 2;

// Create the canvas
frame = d3.select("body")
          .append("svg")
          .attr("width",dim)
          .attr("height",dim);

// Brush for point selection
brush = d3.svg.brush()
              .x(d3.scale.identity().domain([0, dim]))
              .y(d3.scale.identity().domain([0, dim]))
              .on("brush", );

// Append the brush to the canvas
brush_container = frame.append('g')
                       .attr("class","brush")
                       .call(brush);

// Init the simulation and attach an event listener
// to the slider controlling the number of particles
slider = d3.select("#density")
           .attr("value",init_num_particles)
           .attr("max",max_particles)
           .style("width",(0.75*dim).toString()+"px")
           .call(function(){
              update_dens_label(init_num_particles);
              update_particle_list(init_num_particles);
              redraw_particles();
           })
           .on("input",function(){
           	 update_dens_label(this.value);
           	 update_particle_list(this.value);
           	 redraw_particles();
           });

// References
// http://bl.ocks.org/mbostock/fe3f75700e70416e37cd
// https://github.com/reem/d3-particle-simulator
// http://bl.ocks.org/mbostock/4343214
// https://github.com/mbostock/d3/wiki/SVG-Controls
// http://bl.ocks.org/mbostock/4565798