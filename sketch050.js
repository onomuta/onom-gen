// Random Vertex
// Connecting random points every frame with vertices.

const params = {
  trailOpacity: 15, // 0-255
  strokeWidth: 1.5,
  stepSize: 300,
  moveMode: 'Noise', // Random, Noise
  noiseScale: 0.2,
  boundaryMode: 'Bounce', // Bounce, Wrap
  hideWrapLine: true,
  drawMode: 'Lines', // Lines, Circles
  spawnParticles: false,
  particleCount: 2,
  particleSpeed: 2.0,
  particleLife: 60,
  particleSize: 5.0,
  symmetry: 1,
  mirror: true,
  rotationSpeed: 0.0,
  fillShape: true,
  colorMode: 'Mono', // Rainbow, Distance, Mono
  bgColor: '#000000',
  blendMode: 'BLEND', // BLEND, ADD
  exportFrames: 600,
  exportStart: () => startExport(),
  clear: () => {
    background(params.bgColor);
    prevPos.set(width / 2, height / 2);
    prevPos2.set(width / 2, height / 2);
    particles = [];
  }
};

let prevPos;
let prevPos2;
let particles = [];
let noiseOffset = 0;

let isExporting = false;
let exportCount = 0;
let exportMax = 0;
let exportSessionID = "";

function setup() {
  let c = createCanvas(1920, 1080);
  pixelDensity(1);
  
  c.style('width', '100%');
  c.style('height', '100%');
  c.style('object-fit', 'contain');
  
  colorMode(HSB, 360, 100, 100, 100);
  background(params.bgColor);
  
  prevPos = createVector(width / 2, height / 2);
  prevPos2 = createVector(width / 2, height / 2);
  noiseOffset = random(1000);
  particles = [];
}

function draw() {
  // Trail effect
  blendMode(BLEND);
  noStroke();
  let bgCol = color(params.bgColor);
  bgCol.setAlpha(map(params.trailOpacity, 0, 255, 0, 100));
  fill(bgCol);
  rect(0, 0, width, height);

  if (params.blendMode === 'ADD') blendMode(ADD);

  let x, y;

  if (params.moveMode === 'Random') {
    // New random position
    x = prevPos.x + random(-params.stepSize, params.stepSize);
    y = prevPos.y + random(-params.stepSize, params.stepSize);
  } else {
    // Noise based movement
    noiseOffset += params.noiseScale;
    let dx = (noise(noiseOffset) - 0.5) * 2 * params.stepSize;
    let dy = (noise(noiseOffset + 5000) - 0.5) * 2 * params.stepSize;
    x = prevPos.x + dx;
    y = prevPos.y + dy;
  }
  
  // Boundary handling
  if (params.boundaryMode === 'Bounce') {
    // Bounce off walls
    if (x < 0) {
      x = -x;
    } else if (x > width) {
      x = width - (x - width);
    }
    
    if (y < 0) {
      y = -y;
    } else if (y > height) {
      y = height - (y - height);
    }
  } else {
    // Wrap around
    if (x < 0) x += width;
    if (x > width) x -= width;
    if (y < 0) y += height;
    if (y > height) y -= height;
  }

  // Color calculation
  let h, s, b;
  if (params.colorMode === 'Rainbow') {
    h = (frameCount * 0.5) % 360;
    s = 80; b = 100;
  } else if (params.colorMode === 'Distance') {
    let d = dist(prevPos.x, prevPos.y, x, y);
    let maxDist = Math.sqrt(width*width + height*height);
    h = map(d, 0, maxDist, 200, 0); 
    s = 80; b = 100;
  } else if (params.colorMode === 'Cyan') {
    h = map(sin(frameCount * 0.01), -1, 1, 160, 200);
    s = 80; b = 100;
  } else if (params.colorMode === 'Magenta') {
    h = map(sin(frameCount * 0.01), -1, 1, 280, 340);
    s = 80; b = 100;
  } else if (params.colorMode === 'Fire') {
    h = map(noise(frameCount * 0.01), 0, 1, 0, 60);
    s = 90; b = 100;
  } else {
    h = 0; s = 0; b = 100;
  }

  // Spawn particles
  if (params.spawnParticles) {
    for (let i = 0; i < params.particleCount; i++) {
      particles.push(new Particle(x, y, h, s, b));
    }
  }

  push();
  translate(width / 2, height / 2);
  rotate(frameCount * params.rotationSpeed * 0.01);
  translate(-width / 2, -height / 2);

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }

  let shouldDraw = true;
  if (params.boundaryMode === 'Wrap' && params.hideWrapLine) {
    const tx = width * 0.5;
    const ty = height * 0.5;
    if (abs(x - prevPos.x) > tx || abs(y - prevPos.y) > ty ||
        abs(prevPos.x - prevPos2.x) > tx || abs(prevPos.y - prevPos2.y) > ty ||
        abs(x - prevPos2.x) > tx || abs(y - prevPos2.y) > ty) {
      shouldDraw = false;
    }
  }

  if (params.drawMode === 'Lines') {
    if (shouldDraw) {
      let sw = random(0.1, params.strokeWidth);
      let cx = width / 2;
      let cy = height / 2;

      for (let i = 0; i < params.symmetry; i++) {
        push();
        translate(cx, cy);
        rotate((TWO_PI / params.symmetry) * i);
        translate(-cx, -cy);

        if (params.fillShape) {
          fill(h, s, b, 80);
          noStroke();
        } else {
          noFill();
          stroke(h, s, b, 80);
          strokeWeight(sw);
        }
        
        beginShape();
        vertex(x, y);
        vertex(prevPos.x, prevPos.y);
        vertex(prevPos2.x, prevPos2.y);
        endShape(CLOSE);
        
        if (params.mirror) {
          beginShape();
          vertex(width - x, y);
          vertex(width - prevPos.x, prevPos.y);
          vertex(width - prevPos2.x, prevPos2.y);
          endShape(CLOSE);
        }
        pop();
      }
    }
  } else { // Circles
    let size = random(0.2, params.strokeWidth * 2);
    let cx = width / 2;
    let cy = height / 2;

    for (let i = 0; i < params.symmetry; i++) {
      push();
      translate(cx, cy);
      rotate((TWO_PI / params.symmetry) * i);
      translate(-cx, -cy);

      noStroke();
      fill(h, s, b, 80);
      ellipse(x, y, size, size);
      if (params.mirror) {
        ellipse(width - x, y, size, size);
      }
      pop();
    }
  }

  pop();

  prevPos2.set(prevPos);
  prevPos.set(x, y);

  // Export logic
  if (isExporting) {
    saveCanvas('random_vertex_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

class Particle {
  constructor(x, y, h, s, b) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, params.particleSpeed));
    this.life = params.particleLife;
    this.maxLife = params.particleLife;
    this.h = h;
    this.s = s;
    this.b = b;
  }

  update() {
    this.pos.add(this.vel);
    this.life--;
  }

  display() {
    let alpha = map(this.life, 0, this.maxLife, 0, 100);
    let size = map(this.life, 0, this.maxLife, 0, params.particleSize);
    let cx = width / 2;
    let cy = height / 2;

    for (let i = 0; i < params.symmetry; i++) {
      push();
      translate(cx, cy);
      rotate((TWO_PI / params.symmetry) * i);
      translate(-cx, -cy);

      noStroke();
      fill(this.h, this.s, this.b, alpha);
      ellipse(this.pos.x, this.pos.y, size, size);
      
      if (params.mirror) {
        ellipse(width - this.pos.x, this.pos.y, size, size);
      }
      pop();
    }
  }

  isDead() {
    return this.life <= 0;
  }
}

function startExport() {
  if (isExporting) return;
  isExporting = true;
  exportCount = 0;
  exportMax = params.exportFrames;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  exportSessionID = "";
  for (let i = 0; i < 4; i++) exportSessionID += chars.charAt(floor(random(chars.length)));
  console.log(`Export started: ${exportSessionID}`);
}

function keyPressed() {
  if (key === 's' || key === 'S') startExport();
  if (key === 'r' || key === 'R') params.clear();
}

// GUI Config
window.guiConfig = [
  { folder: 'Style', contents: [
    { object: params, variable: 'trailOpacity', min: 0, max: 50, step: 1, name: 'Trail Fade' },
    { object: params, variable: 'strokeWidth', min: 0.5, max: 10, name: 'Width' },
    { object: params, variable: 'stepSize', min: 10, max: 500, name: 'Step Size' },
    { object: params, variable: 'moveMode', options: ['Random', 'Noise'], name: 'Move Mode' },
    { object: params, variable: 'noiseScale', min: 0.001, max: 0.5, name: 'Noise Scale' },
    { object: params, variable: 'boundaryMode', options: ['Bounce', 'Wrap'], name: 'Boundary' },
    { object: params, variable: 'hideWrapLine', name: 'Hide Wrap Line' },
    { object: params, variable: 'drawMode', options: ['Lines', 'Circles'], name: 'Draw Mode' },
    { object: params, variable: 'fillShape', name: 'Fill Triangles' },
    { object: params, variable: 'rotationSpeed', min: -5.0, max: 5.0, name: 'Rotation' },
    { object: params, variable: 'mirror', name: 'Mirror X' },
    { object: params, variable: 'symmetry', min: 1, max: 12, step: 1, name: 'Symmetry' },
    { folder: 'Particles', contents: [
      { object: params, variable: 'spawnParticles', name: 'Enable' },
      { object: params, variable: 'particleCount', min: 1, max: 20, step: 1, name: 'Spawn Rate' },
      { object: params, variable: 'particleSpeed', min: 0.1, max: 10.0, name: 'Speed' },
      { object: params, variable: 'particleLife', min: 10, max: 200, name: 'Life' },
      { object: params, variable: 'particleSize', min: 1, max: 50, name: 'Size' }
    ]},
    { object: params, variable: 'colorMode', options: ['Rainbow', 'Distance', 'Mono', 'Cyan', 'Magenta', 'Fire'], name: 'Color Mode' },
    { object: params, variable: 'blendMode', options: ['BLEND', 'ADD'], name: 'Blend Mode' },
    { object: params, variable: 'bgColor', type: 'color', name: 'Background' },
    { object: params, variable: 'clear', name: 'Clear Canvas', type: 'function' }
  ]},
  { folder: 'Export', contents: [
    { object: params, variable: 'exportFrames', min: 60, max: 1200, step: 1, name: 'Frames' },
    { object: params, variable: 'exportStart', name: 'Start Export', type: 'function' }
  ]}
];