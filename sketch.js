
/* 
function setup() {

  createCanvas(256*4, 256*4);
  console.log('Preload completed');
  background(0); 

}

var xCounter = 0; 

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function draw() {
  strokeWeight(.15); 
  stroke(0,random(255),0,random(100));
  fill(0,random(255),0,random(100)); 
  line(0, height/2 , width, height/2);
  line(xCounter, height/2+ getRandomNumber(-100,100),  width,random(height))
  line((width-xCounter), height/2+ getRandomNumber(-100,100), 0, random(height))
  if (xCounter >= width) {
    xCounter = 0}
  else {
    xCounter +=random(15);
  } 
} */


var song; 
var fft; 
var amp; 
var duration; 
var bands = 64; 


function preload() {
  song = loadSound('lottalove.mp3'); 
  //song = loadSound('alive.mp3'); 
}

vOffset = 100; 

function setup() {
  createCanvas(256*4, 256);
  console.log('Preload completed');
  fft = new p5.FFT(0.9, bands); 
  amp = new p5.Amplitude(0.1); 
  duration = song.duration(); 
  background(0); 
}

function mousePressed() {
  console.log('Mouse Pressed'); 
  if (song.isPlaying()) {
    song.pause();  
  } else {
  song.play(); 
  song.rate(1); 
}
}

let offset=2; 
let keepMax = []; 
let ampHistory = [];
let fade = 255; 
let scale = 0; 

function draw() {
  background(0); 
  push(); 
  strokeWeight(0.35); 
  stroke(0,255,0,100);
  fill(0,255,0,100); 
  line(0, height/2, width, height/2);
  line(0, height/4, width, height/4);
  line(0, height *.75, width, height * .75);
  pop(); 
  stroke(0,255,0,200);
  fill(0,255,0,100); 
  var spectrum = fft.analyze(); 
  if (keepMax.length == 0) {
    keepMax = [...spectrum];
  } ; 
  for (i = 0; i < spectrum.length; i++) {
  var xPos = (i * width/bands); 
  var yPos = map(spectrum[i], 0, 256,height, 0);  
  rect(xPos, yPos, width/bands-offset, height); 
  if (spectrum[i] > keepMax[i]) {
    keepMax[i] = spectrum[i];
  } else {
    keepMax[i] -= 0.1; 
  }
  maxY = map(keepMax[i], 0, 256,height, 0)
  push(); 
  stroke(57, 255, 20); 
  line(xPos, maxY, (width/bands) + xPos-offset, maxY); 
  pop(); 
}
  push(); 
  noFill();  
  x = map(song.currentTime(), 0, duration, 0, width); 
  y = map(amp.getLevel(), 0, 1, 0, height/2); ; 
  ampHistory.push([x,(height * .75) - y]); 
  beginShape(); 
  for (p = 0; p < ampHistory.length; p++) {
    theFade = map(p,0, ampHistory.length, 0, 255 );
    stroke(255,theFade); 
    vertex(ampHistory[p][0], ampHistory[p][1] - scale);
  }
  endShape(); 
  pop(); 
} 
