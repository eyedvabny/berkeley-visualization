//
// PARAMETERS
//
var n_parts = 700; // Default number of particles
var radius = 5; // Pixel radius of a particle
var dim = 500; // Dimension of the canvas (square)

//
// GLOBAL VARIABLES
//
var particles = []; // Particles to plot on the canvas
var frame; // The canvas element

//
// Classes
//

// Particle class
var Particle = function (){

    // Generate a trial random position
    var temp_x;
    var temp_y;

    // Check if two elements are collided
    function is_collided(x,y){
    	return function(elem){
    		return (4*radius*radius) < (elem.x-x)*(elem.x-x) + (elem.y-y)*(elem.y-y);
    	}
    }

    // Loop until we are not blocked
    while(true){

    	// Generate a trial position
    	temp_x = Math.random() * (dim-2*radius) + radius;
    	temp_y = Math.random() * (dim-2*radius) + radius;

    	// Break out if we are not 
    	if(particles.every(is_collided(temp_x,temp_y))){
    		break;
    	}
    }

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

function redraw_particles(){
    points = frame.selectAll("circle")
                  .data(particles)

    points.enter()
          .append("circle")
          .attr("cx",function(d){return d.x})
          .attr("cy",function(d){return d.y})
          .attr("r",function(d){return d.r})
          .attr("class","regular")
          .on("click", function(d) { 
          	d3.select(this).attr("class","selected");
          })
    
    points.exit()
          .remove();
}

//
// INITIATION
//

// Create the canvas
frame = d3.select("body")
          .append("svg")
          .attr("width",dim)
          .attr("height",dim);

// Init the slider and attach an event listener
d3.select("#density")
  .attr("value",n_parts)
  .call(function(){
  	update_dens_label(this.value);
  })
  .on("input",function(){
  	update_dens_label(this.value);
  	update_particle_list(this.value);
  	redraw_particles();
  });

update_particle_list(n_parts);
redraw_particles();

// References
// http://bl.ocks.org/mbostock/fe3f75700e70416e37cd
// https://github.com/reem/d3-particle-simulator
// http://bl.ocks.org/mbostock/4343214