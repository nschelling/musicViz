"use strict"

var container = $('#container');
var viewport = $('#viewport');

var readText;
var apiURL;
var audio;
var source;

var javascriptNode;
var analyser;
var average;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var gradient=ctx.createLinearGradient(0,0,0,170);
var canvasWidth =viewport.width();
var canvasHeight = viewport.height();

var radius = 10;
var centerX;
var centerY;





window.AudioContext = window.AudioContext||window.webkitAudioContext;
  var context = new AudioContext();

function loadSound() {
  var request = new XMLHttpRequest();

  request.open("GET", apiURL , true); 
  request.responseType = "arraybuffer"; 
  
  request.setRequestHeader("X-Mashape-Key", "jJXHg7FvoomshZMAtGVStQoPt1dZp1opv4ajsnscJlkHcXcHe6");
  request.onload = function() {
      var Data = request.response;
      process(Data);
  };

  request.send();
 }

function process(Data) {
  //source = context.createBufferSource(); // Create Sound Source
  
  context.decodeAudioData(Data, function(buffer){
    source = context.createBufferSource(); // Create Sound Source
  
    source.buffer = buffer;
    source.connect(context.destination); 
    source.start(0);
    setupAudioNodes();


source.onended = function() {
  source.disconnect(javascriptNode);
  javascriptNode.disconnect(context.destination);
}

  });

  
}


function setupAudioNodes() {
        
        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 1, 1);
        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);
 
        // setup a analyzer
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;

               // connect the source to the analyser
        var sourceNode = source;
        sourceNode.connect(analyser);
 
        // we use the javascript node to draw at a specific interval.
        analyser.connect(javascriptNode);
 
        // and connect to destination, if you want audio
       source.connect(context.destination);
       //source.stop(context.currentTime);



        // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
    javascriptNode.onaudioprocess = function() {
 
        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        average = getAverageVolume(array);
        console.log(average);
        

        radius = average*2;
        centerX = 600;
        centerY = 200;

        ctx.clearRect(0,0,canvasWidth, canvasHeight);

        ctx.beginPath();

        ctx.arc(centerX, centerY, radius, 0, 2 *Math.PI, false);
        
        ctx.fillStyle = 'yellow';
        ctx.fill();
      


        }
     }

  

 // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
 
    function getAverageVolume(array) {
        var values = 0;
        var average;
 
        var length = array.length;
 
        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }
 
        average = values / length;
        return average;
    }




$("#textSubmit").click(function(){
  readText =  $("#text").val();
  apiURL = "https://montanaflynn-text-to-speech.p.mashape.com/speak?text=" + readText 
  //apiURL = "media/1984.mp3";
  loadSound();
  setupAudioNodes();


});

