// Extracting training data
var training_inputs = [];
var training_outputs = [];

var canvas;
var context;

var height;
var width;

var nn;

var learning_rate = 0.01;
var network_structure = [];

window.onload = function() {

  // get canvas
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  // get size of canvas
  width = canvas.width;
  height = canvas.height;

  // Get training input and output from table
  populate_training_data_arrays();

  // Get network network_structure
  network_structure = get_network_structure();

  // get learning rate
  learning_rate = document.getElementById('learning_rate').value;

  // create the neural network
  nn = new Neural_network(network_structure,training_inputs[0].length);

  // reset button
  var reset_button = document.getElementById('reset_button');
  reset_button.addEventListener('click', function(){
    nn = new Neural_network(network_structure,training_inputs[0].length);
  });

  // start the display loop
  window.requestAnimationFrame(loop);
};


function loop(current_time){
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);

  nn.train(training_inputs,training_outputs,learning_rate);
  // Use a random input for display
  nn.forward_propagation(training_inputs[0]);
  nn.draw();

  context.font = "15px Arial";
  context.fillStyle ="black";
  context.textAlign="left";
  context.textBaseline="Middle";
  context.fillText("Epoch: " + nn.epoch,30,30);
  context.fillText("Error: " + (100*nn.error/training_outputs.length).toFixed(2) + "%",150,30);
  context.fillText("Rate: " + learning_rate,280,30);

  requestAnimationFrame(loop);
}

function Neural_network(network_structure, network_input_count) {
  // Neural network class

  this.input_count = network_input_count;
  this.structure = network_structure;

  this.synapses = [];
  this.neurons = [];
  this.deltas = [];

  this.cost;
  this.error;
  this.epoch = 0;

  // Build layers accordingly
  for(var layer_index = 0; layer_index < this.structure.length; layer_index ++) {

    this.synapses[layer_index] = [];
    this.neurons[layer_index] = [];
    this.deltas[layer_index] = [];

    for(var neuron_index = 0; neuron_index < this.structure[layer_index]; neuron_index ++) {

      this.synapses[layer_index][neuron_index] = [];

      var synapse_count;
      if(layer_index == 0) {
        // Synapses are connected to the network input for the first layer
        synapse_count = this.input_count;
      }
      else {
        // Synapses are connected to the previous layer of neurons for other layers
        synapse_count = this.structure[layer_index-1];
      }

      synapse_count += 1; // Adding bias

      for(var synapse_index = 0; synapse_index < synapse_count; synapse_index ++) {
        this.synapses[layer_index][neuron_index][synapse_index] = 1*(2*Math.random()-1);
      }
    }
  }

  this.forward_propagation = function(network_input) {
    // Process input through the network

    for(var layer_index = 0; layer_index < this.synapses.length; layer_index ++) {

      // Inptu is either network input or previous layer
      var input = [];
      if(layer_index == 0) input = network_input;
      else input = this.neurons[layer_index-1];

      for(var neuron_index = 0; neuron_index < this.synapses[layer_index].length; neuron_index ++) {

        var synaptic_sum = 0;

        // Deal first with neurons...
        for(var synapse_index = 0; synapse_index < this.synapses[layer_index][neuron_index].length-1; synapse_index ++) {
          synaptic_sum += input[synapse_index] * this.synapses[layer_index][neuron_index][synapse_index];
        }

        // And then with bias
        var bias_index = this.synapses[layer_index][neuron_index].length-1;
        synaptic_sum += this.synapses[layer_index][neuron_index][bias_index];

        // Activation of each neuron
        this.neurons[layer_index][neuron_index] = this.activation(synaptic_sum);
      }
    }
  }

  this.train = function(training_inputs, training_outputs, learning_rate) {
    // Train the network

    this.cost = 0.0;
    this. error = 0.0;

    for (var training_set_index=0; training_set_index<training_inputs.length; training_set_index++) {
      var training_input = training_inputs[training_set_index];
      var training_output = training_outputs[training_set_index];
      this.forward_propagation(training_input);
      var network_output = this.neurons[this.neurons.length-1];

      // Compute cost
      for (var output_index=0; output_index<training_output.length; output_index++) {
        this.error += Math.abs(training_output[output_index] - network_output[output_index]);
        this.cost += 0.5 * (training_output[output_index] - network_output[output_index]) * (training_output[output_index] - network_output[output_index]);
      }

      this.backward_propagation(training_input, training_output);
      this.update_weights(training_input, learning_rate);
    }

    this.epoch ++;
  }

  this.backward_propagation = function(training_input, training_output) {
    // Computes the delta of each neuron

    // Iterate backwards through the network
    for (var layer_index = this.synapses.length-1; layer_index >= 0; layer_index --) {
      for (var neuron_index=0; neuron_index < this.synapses[layer_index].length; neuron_index++) {

        var error;
        if (layer_index == this.synapses.length-1) {
          // Last layer
          error = training_output[neuron_index] - this.neurons[this.synapses.length-1][neuron_index];
        }
        else {
          // Layers other than the last one
          error = 0.0;
          for (var next_layer_neuron_index = 0; next_layer_neuron_index < this.synapses[layer_index+1].length; next_layer_neuron_index++) {
            error += this.deltas[layer_index+1][next_layer_neuron_index] * this.synapses[layer_index+1][next_layer_neuron_index][neuron_index];
          }
        }
        this.deltas[layer_index][neuron_index] = error * this.activation_derivative(this.neurons[layer_index][neuron_index]);
      }
    }
  }

  this.update_weights = function(training_input, learning_rate) {

    for (var layer_index=0; layer_index<this.synapses.length; layer_index++) {

      // Use network input for the first layer and previous layer neurons for the other layers
      var input;
      if (layer_index == 0) input = training_input;
      else input = this.neurons[layer_index-1];

      for (var neuron_index = 0; neuron_index < this.synapses[layer_index].length; neuron_index++) {
        // Normal inputs
        for (var input_index = 0; input_index < this.synapses[layer_index][neuron_index].length-1; input_index++) {
          this.synapses[layer_index][neuron_index][input_index] += learning_rate * this.deltas[layer_index][neuron_index] * input[input_index];
        }

        // bias
        var bias_index = this.synapses[layer_index][neuron_index].length-1;
        this.synapses[layer_index][neuron_index][bias_index] += learning_rate * this.deltas[layer_index][neuron_index];
      }
    }

  }

  this.activation = function(x) {
    // Neuron activation function

    return 1.0/(1.0+Math.exp(-x));
  }

  this.activation_derivative = function(x) {
    // Neuron activation function derivative

    return x*(1.0-x);
  }

  this.draw = function() {
    // Draw the network

    var padding = 50;
    var neuron_radius = 20;

    var synapse_min_width = 0.1;
    var synapse_max_width = 10;

    // draw the synapses
    for(var layer_index = 0; layer_index < this.synapses.length; layer_index ++) {

      // find min and max weights of current layer
      // THIS SHOULD BE CHANGED TO THE FIRST SYNAPSE
      var min_weight = 9999.00;
      var max_weight = -9999.00;
      for (var neuron_index = 0; neuron_index < this.synapses[layer_index].length; neuron_index++) {
        for (var synapse_index = 0; synapse_index < this.synapses[layer_index][neuron_index].length; synapse_index++) {
          if (this.synapses[layer_index][neuron_index][synapse_index] > max_weight) {
            max_weight = this.synapses[layer_index][neuron_index][synapse_index];
          }
          if (this.synapses[layer_index][neuron_index][synapse_index] < min_weight) {
            min_weight = this.synapses[layer_index][neuron_index][synapse_index];
          }
        }
      }



      var start_x = map(layer_index-1,-1,this.synapses.length-1,padding,width-padding);
      var end_x = map(layer_index,-1,this.synapses.length-1,padding,width-padding);

      for(var neuron_index = 0; neuron_index < this.synapses[layer_index].length; neuron_index ++) {

        var end_y;
        if( layer_index != this.synapses.length -1) {
          // The last neuron of the layer is the bias, which is not connected to the previous layer
          end_y = map(neuron_index,-1,this.synapses[layer_index].length+1, padding, height);
        }
        else {
          // The last neuron layer (output ;ayer) does not have a bias neuron
          end_y = map(neuron_index,-1,this.synapses[layer_index].length, padding, height);
        }


        for(var synapse_index = 0; synapse_index < this.synapses[layer_index][neuron_index].length; synapse_index ++) {
          // draw synapse

          var start_y = map(synapse_index,-1,this.synapses[layer_index][neuron_index].length, padding, height);


          context.beginPath();
          context.moveTo(start_x,start_y);
          context.lineTo(end_x,end_y);

          var synaptic_weight = this.synapses[layer_index][neuron_index][synapse_index];
          if(synaptic_weight > 0){
            context.strokeStyle="#000000";
            context.lineWidth = map(synaptic_weight,0,max_weight,synapse_min_width,synapse_max_width);
          }
          else {
            context.strokeStyle="#ff0000";
            context.lineWidth = map(synaptic_weight,min_weight,0,synapse_max_width, synapse_min_width);
          }


          context.stroke();
        }
      }
    }

    // draw the neurons
    for(var layer_index = 0; layer_index < this.synapses.length; layer_index ++) {
      var pos_x = map(layer_index, -1, this.synapses.length-1, padding, width-padding);
      for(var neuron_index = 0; neuron_index < this.synapses[layer_index].length; neuron_index ++) {
        var pos_y;
        if( layer_index != this.synapses.length-1) {
          // The last neuron of the layer is the bias, which is not connected to the previous layer
          pos_y = map(neuron_index,-1,this.synapses[layer_index].length+1, padding, height);
        }
        else {
          // The last neuron layer (output ;ayer) does not have a bias neuron
          pos_y = map(neuron_index,-1,this.synapses[layer_index].length, padding, height);
        }

        context.beginPath();
        context.arc(pos_x,pos_y,neuron_radius,0,2*Math.PI);
        context.fillStyle = "white";
        context.strokeStyle="#000000";
        context.lineWidth=2;
        context.fill();
        context.stroke();
      }
    }

    // draw the bias
    for(var layer_index = 0; layer_index < this.synapses.length; layer_index ++) {
      var pos_x = map(layer_index-1, -1, this.synapses.length-1, padding, width-padding);
      var pos_y = map(this.synapses[layer_index][0].length-1, -1, this.synapses[layer_index][0].length, padding, height);

      context.beginPath();
      context.arc(pos_x,pos_y,neuron_radius,0,2*Math.PI);
      context.fillStyle = "white";
      context.strokeStyle="Red";
      context.lineWidth=2;
      context.fill();
      context.stroke();

      /*
      context.font = "15px Arial";
      context.fillStyle ="Red";
      context.textAlign="center";
      context.textBaseline="Middle";
      context.fillText("1",pos_x,pos_y);
      */
    }

    // drawing inputs
    for(var input_index = 0; input_index<this.synapses[0][0].length-1; input_index++){
      var pos_x = padding;
      var pos_y = map(input_index,-1,this.synapses[0][0].length, padding, height);

      context.beginPath();
      context.rect(pos_x-neuron_radius,pos_y-neuron_radius,2*neuron_radius,2*neuron_radius);
      //context.arc(pos_x,pos_y,neuron_radius,0,2*Math.PI);
      context.fillStyle = "white";
      context.strokeStyle="#000000";
      context.lineWidth=2;
      context.fill();
      context.stroke();
    }
  }
}

function populate_training_data_arrays() {
  // Fills training input and output data from the table

  // get input table elements
  var oTable = document.getElementById('training_inputs');
  var row_count = oTable.rows.length;
  for (var row_index = 0; row_index < row_count; row_index++) {
    var oCells = oTable.rows.item(row_index).cells;
    var cell_count = oCells.length;
    training_inputs[row_index] = [];
    for(var cell_index=0; cell_index < cell_count; cell_index ++) {
      training_inputs[row_index][cell_index] = oCells.item(cell_index).innerHTML;
    }
  }

  // get output table elements
  var oTable = document.getElementById('training_outputs');
  var row_count = oTable.rows.length;
  for (var row_index = 0; row_index < row_count; row_index++) {
    var oCells = oTable.rows.item(row_index).cells;
    var cell_count = oCells.length;
    training_outputs[row_index] = [];
    for(var cell_index=0; cell_index < cell_count; cell_index ++) {
      training_outputs[row_index][cell_index] = oCells.item(cell_index).innerHTML;
    }
  }
}

function map(val, oldLow, oldHigh, newLow, newHigh) {
  // Linear mapping
  return (val-oldLow)/(oldHigh-oldLow) * (newHigh-newLow) + newLow;
}

function get_network_structure() {
  var network_structure = [];

  var hidden_neurons_string = document.getElementById('hidden_neurons').value
  var hidden_neurons_string_array = hidden_neurons_string.split(",");

  for(var layer_index=0; layer_index < hidden_neurons_string_array.length; layer_index++ ) {
    network_structure.push(parseInt(hidden_neurons_string_array[layer_index]));
  }


  // add output layer
  network_structure.push(training_outputs[0].length);

  return network_structure;

}

function map(val, oldLow, oldHigh, newLow, newHigh) {
  // Linear mapping
  return (val-oldLow)/(oldHigh-oldLow) * (newHigh-newLow) + newLow;
}
