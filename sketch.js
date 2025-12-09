
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

// Available songs
var songs = [
  { name: 'Lotta Love', file: 'songs/lottalove.mp3' },
  { name: 'Alive', file: 'songs/alive.mp3' }
];
var currentSongIndex = 0;
var songSelector;

// Visualization modes
var visualModes = ['Classic', 'Circular', 'Mirror', 'Frequency Colors'];
var currentMode = 0;
var modeSelector;

function preload() {
  song = loadSound(songs[currentSongIndex].file);
}

vOffset = 100; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('Preload completed');
  fft = new p5.FFT(0.9, bands);
  amp = new p5.Amplitude(0.1);
  duration = song.duration();
  background(0);

  // Create song selector dropdown
  songSelector = createSelect();
  songSelector.position(10, 10);
  for (let i = 0; i < songs.length; i++) {
    songSelector.option(songs[i].name);
  }
  songSelector.selected(songs[currentSongIndex].name);
  songSelector.changed(changeSong);

  // Style the selector
  songSelector.style('padding', '8px');
  songSelector.style('font-size', '14px');
  songSelector.style('background-color', '#1a1a1a');
  songSelector.style('color', '#00ff00');
  songSelector.style('border', '2px solid #00ff00');
  songSelector.style('border-radius', '4px');

  // Create visualization mode selector
  modeSelector = createSelect();
  modeSelector.position(10, 50);
  for (let i = 0; i < visualModes.length; i++) {
    modeSelector.option(visualModes[i]);
  }
  modeSelector.selected(visualModes[currentMode]);
  modeSelector.changed(changeMode);

  // Style the mode selector
  modeSelector.style('padding', '8px');
  modeSelector.style('font-size', '14px');
  modeSelector.style('background-color', '#1a1a1a');
  modeSelector.style('color', '#00ff00');
  modeSelector.style('border', '2px solid #00ff00');
  modeSelector.style('border-radius', '4px');
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
  var spectrum = fft.analyze();

  if (keepMax.length == 0) {
    keepMax = [...spectrum];
  }

  // Call appropriate visualization mode
  if (currentMode === 0) {
    drawClassic(spectrum);
  } else if (currentMode === 1) {
    drawCircular(spectrum);
  } else if (currentMode === 2) {
    drawMirror(spectrum);
  } else if (currentMode === 3) {
    drawFrequencyColors(spectrum);
  }

  // Draw amplitude waveform (common to all modes)
  drawWaveform();
}

function drawClassic(spectrum) {
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

  for (i = 0; i < spectrum.length; i++) {
    var xPos = (i * width/bands);
    var yPos = map(spectrum[i], 0, 256, height, 0);
    rect(xPos, yPos, width/bands-offset, height);

    if (spectrum[i] > keepMax[i]) {
      keepMax[i] = spectrum[i];
    } else {
      keepMax[i] -= 0.1;
    }

    maxY = map(keepMax[i], 0, 256, height, 0);
    push();
    stroke(57, 255, 20);
    line(xPos, maxY, (width/bands) + xPos-offset, maxY);
    pop();
  }
}

function drawWaveform() {
  push();
  noFill();
  x = map(song.currentTime(), 0, duration, 0, width);
  y = map(amp.getLevel(), 0, 1, 0, height/2);
  ampHistory.push([x,(height * .75) - y]);
  beginShape();
  for (p = 0; p < ampHistory.length; p++) {
    theFade = map(p, 0, ampHistory.length, 0, 255);
    stroke(255, theFade);
    vertex(ampHistory[p][0], ampHistory[p][1] - scale);
  }
  endShape();
  pop();
}

function drawCircular(spectrum) {
  push();
  translate(width/2, height/2);

  let radius = min(width, height) * 0.25;
  let maxRadius = min(width, height) * 0.45;

  for (let i = 0; i < spectrum.length; i++) {
    let angle = map(i, 0, spectrum.length, 0, TWO_PI);
    let amp = map(spectrum[i], 0, 256, 0, maxRadius - radius);

    // Update peak values
    if (spectrum[i] > keepMax[i]) {
      keepMax[i] = spectrum[i];
    } else {
      keepMax[i] -= 0.1;
    }

    let x1 = cos(angle) * radius;
    let y1 = sin(angle) * radius;
    let x2 = cos(angle) * (radius + amp);
    let y2 = sin(angle) * (radius + amp);

    stroke(0, 255, 0, 150);
    strokeWeight(2);
    line(x1, y1, x2, y2);

    // Draw peak marker
    let peakAmp = map(keepMax[i], 0, 256, 0, maxRadius - radius);
    let px = cos(angle) * (radius + peakAmp);
    let py = sin(angle) * (radius + peakAmp);
    stroke(57, 255, 20);
    strokeWeight(3);
    point(px, py);
  }
  pop();
}

function drawMirror(spectrum) {
  push();
  stroke(0, 255, 0, 200);
  fill(0, 255, 0, 100);

  for (let i = 0; i < spectrum.length; i++) {
    let xPos = map(i, 0, spectrum.length, 0, width/2);
    let barHeight = map(spectrum[i], 0, 256, 0, height/2);
    let barWidth = (width/2) / bands - offset;

    // Update peak values
    if (spectrum[i] > keepMax[i]) {
      keepMax[i] = spectrum[i];
    } else {
      keepMax[i] -= 0.1;
    }

    // Left side - bottom up
    rect(xPos, height/2, barWidth, -barHeight);

    // Right side - bottom up (mirrored)
    rect(width - xPos - barWidth, height/2, barWidth, -barHeight);

    // Left side - top down
    rect(xPos, height/2, barWidth, barHeight);

    // Right side - top down (mirrored)
    rect(width - xPos - barWidth, height/2, barWidth, barHeight);

    // Draw peak markers
    let peakHeight = map(keepMax[i], 0, 256, 0, height/2);
    stroke(57, 255, 20);
    strokeWeight(2);
    // Top peaks
    line(xPos, height/2 - peakHeight, xPos + barWidth, height/2 - peakHeight);
    line(width - xPos - barWidth, height/2 - peakHeight, width - xPos, height/2 - peakHeight);
    // Bottom peaks
    line(xPos, height/2 + peakHeight, xPos + barWidth, height/2 + peakHeight);
    line(width - xPos - barWidth, height/2 + peakHeight, width - xPos, height/2 + peakHeight);
  }

  // Center line
  stroke(0, 255, 0, 100);
  strokeWeight(1);
  line(0, height/2, width, height/2);
  pop();
}

function drawFrequencyColors(spectrum) {
  push();
  strokeWeight(0.35);
  stroke(0, 255, 0, 100);
  fill(0, 255, 0, 100);
  line(0, height/2, width, height/2);
  line(0, height/4, width, height/4);
  line(0, height * .75, width, height * .75);
  pop();

  for (let i = 0; i < spectrum.length; i++) {
    let xPos = (i * width/bands);
    let yPos = map(spectrum[i], 0, 256, height, 0);

    // Update peak values
    if (spectrum[i] > keepMax[i]) {
      keepMax[i] = spectrum[i];
    } else {
      keepMax[i] -= 0.1;
    }

    // Color based on frequency range
    let r, g, b;
    if (i < spectrum.length / 3) {
      // Bass - Red
      r = 255;
      g = 0;
      b = map(spectrum[i], 0, 256, 0, 100);
    } else if (i < 2 * spectrum.length / 3) {
      // Mids - Green
      r = 0;
      g = 255;
      b = 0;
    } else {
      // Treble - Blue/Cyan
      r = 0;
      g = map(spectrum[i], 0, 256, 100, 255);
      b = 255;
    }

    stroke(r, g, b, 200);
    fill(r, g, b, 100);
    rect(xPos, yPos, width/bands - offset, height);

    // Draw peak markers with matching colors
    let maxY = map(keepMax[i], 0, 256, height, 0);
    push();
    stroke(r, g, b, 255);
    strokeWeight(2);
    line(xPos, maxY, (width/bands) + xPos - offset, maxY);
    pop();
  }
}

function changeSong() {
  // Find the selected song index
  let selectedName = songSelector.value();
  for (let i = 0; i < songs.length; i++) {
    if (songs[i].name === selectedName) {
      currentSongIndex = i;
      break;
    }
  }

  // Stop current song and load new one
  if (song.isPlaying()) {
    song.stop();
  }

  // Load and play new song
  loadSound(songs[currentSongIndex].file, function(newSong) {
    song = newSong;
    duration = song.duration();
    ampHistory = []; // Reset amplitude history
    keepMax = []; // Reset peak markers
    song.play();
    console.log('Now playing: ' + songs[currentSongIndex].name);
  });
}

function changeMode() {
  let selectedMode = modeSelector.value();
  for (let i = 0; i < visualModes.length; i++) {
    if (visualModes[i] === selectedMode) {
      currentMode = i;
      break;
    }
  }
  console.log('Visualization mode: ' + visualModes[currentMode]);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
