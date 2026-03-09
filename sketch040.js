// Connected Emitter
// Particles emitting from center connected by lines

const params = {
  emitterType: 'Point', // Point, Line
  particleCount: 300,
  spawnRate: 4,
  lifeSpan: 1.0,
  speed: 3.0,
  rotationForce: 0.0,
  turbulence: 0.0,
  friction: 0.99,
  connectionDist: 120,
  lineAlpha: 0.5,
  lineWidth: 1,
  particleSize: 4,
  colorMode: 'Rainbow', // Rainbow, Cyan, Fire, White, Cyan+Red
  bgColor: '#000000',
  blendMode: 'ADD', // BLEND, ADD
  exportFrames: 600,
  exportStart: () => startExport(),
  clear: () => particles = []
};

let particles = [];
let time = 0;

// Export variables
let isExporting = false;
let exportCount = 0;
let exportMax = 0;
let exportSessionID = "";

function setup() {
  let c = createCanvas(1920, 1280);
  pixelDensity(1);
  
  c.style('width', '100%');
  c.style('height', '100%');
  c.style('object-fit', 'contain');
  
  colorMode(HSB, 360, 100, 100, 1.0);
  rectMode(CENTER);
  ellipseMode(CENTER);
}

function draw() {
  // Background
  blendMode(BLEND);
  
  // 背景を確実にクリア
  push();
  fill(params.bgColor);
  noStroke();
  rect(width/2, height/2, width, height);
  pop();
  
  // Spawn particles
  for (let i = 0; i < params.spawnRate; i++) {
    if (particles.length < params.particleCount) {
      particles.push(new Particle());
    }
  }
  
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // Draw connections & particles
  if (params.blendMode === 'ADD') blendMode(ADD);
  else blendMode(BLEND);
  
  strokeWeight(params.lineWidth);
  
  let sat = params.colorMode === 'White' ? 0 : 80;
  
  for (let i = 0; i < particles.length; i++) {
    let p1 = particles[i];
    
    // Draw particle
    noStroke();
    fill(p1.hue, sat, 100, p1.life);
    ellipse(p1.pos.x, p1.pos.y, params.particleSize * p1.life);

    // Draw lines
    for (let j = i + 1; j < particles.length; j++) {
      let p2 = particles[j];
      let d = p1.pos.dist(p2.pos);
      
      if (d < params.connectionDist) {
        let alpha = map(d, 0, params.connectionDist, params.lineAlpha, 0);
        alpha *= min(p1.life, p2.life); // Fade with particle life
        
        stroke(p1.hue, sat, 100, alpha);
        line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
      }
    }
  }
  
  time += 0.01;

  // Export logic
  if (isExporting) {
    saveCanvas('emitter_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

class Particle {
  constructor() {
    if (params.emitterType === 'Line') {
      this.pos = createVector(random(width), height / 2);
    } else {
      this.pos = createVector(width / 2, height / 2);
    }
    let angle = random(TWO_PI);
    let speed = random(0.5, 2.0) * params.speed;
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.life = 1.0;
    this.baseDecay = random(0.005, 0.02);
    
    if (params.colorMode === 'Rainbow') {
      this.hue = (frameCount * 0.5 + random(30)) % 360;
    } else if (params.colorMode === 'Cyan') {
      this.hue = random(160, 200);
    } else if (params.colorMode === 'Fire') {
      this.hue = random(0, 40);
    } else if (params.colorMode === 'White') {
      this.hue = 0;
    } else if (params.colorMode === 'Cyan+Red') {
      this.hue = random() < 0.5 ? random(170, 190) : random(340, 360);
    }
  }
  
  update() {
    // 回転力を適用
    if (params.rotationForce !== 0) {
      let center = createVector(width/2, height/2);
      let dir = p5.Vector.sub(this.pos, center);
      if (dir.magSq() > 1) {
        let tangent = createVector(-dir.y, dir.x).normalize();
        tangent.mult(params.rotationForce * 0.1);
        this.vel.add(tangent);
      }
    }

    // タービュランス（ノイズ）を適用
    if (params.turbulence > 0) {
      let n = noise(this.pos.x * 0.005, this.pos.y * 0.005, time * 0.5);
      let angle = n * TWO_PI * 2;
      let turb = p5.Vector.fromAngle(angle).mult(params.turbulence * 0.1);
      this.vel.add(turb);
    }

    this.pos.add(this.vel);
    this.vel.mult(params.friction);
    this.life -= this.baseDecay / params.lifeSpan;
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
}

// GUI Config
window.guiConfig = [
  { folder: 'Emitter', contents: [
    { object: params, variable: 'emitterType', options: ['Point', 'Line'], name: 'Emitter Type' },
    { object: params, variable: 'particleCount', min: 50, max: 1000, step: 10, name: 'Max Particles' },
    { object: params, variable: 'spawnRate', min: 1, max: 20, step: 1, name: 'Spawn Rate' },
    { object: params, variable: 'lifeSpan', min: 0.1, max: 5.0, name: 'Life Span' },
    { object: params, variable: 'speed', min: 0.5, max: 10.0, name: 'Speed' },
    { object: params, variable: 'rotationForce', min: -2.0, max: 2.0, name: 'Rotation' },
    { object: params, variable: 'turbulence', min: 0, max: 5.0, name: 'Turbulence' },
    { object: params, variable: 'friction', min: 0.9, max: 1.0, name: 'Friction' },
    { object: params, variable: 'clear', name: 'Clear', type: 'function' }
  ]},
  { folder: 'Connections', contents: [
    { object: params, variable: 'connectionDist', min: 20, max: 300, name: 'Distance' },
    { object: params, variable: 'lineAlpha', min: 0, max: 1.0, name: 'Line Opacity' },
    { object: params, variable: 'lineWidth', min: 0.1, max: 10, name: 'Line Width' },
    { object: params, variable: 'particleSize', min: 1, max: 20, name: 'Point Size' }
  ]},
  { folder: 'Style', contents: [
    { object: params, variable: 'colorMode', options: ['Rainbow', 'Cyan', 'Fire', 'White', 'Cyan+Red'], name: 'Color Mode' },
    { object: params, variable: 'blendMode', options: ['BLEND', 'ADD'], name: 'Blend Mode' },
    { object: params, variable: 'bgColor', type: 'color', name: 'Background' }
  ]},
  { folder: 'Export', contents: [
    { object: params, variable: 'exportFrames', min: 60, max: 1200, step: 1, name: 'Frames' },
    { object: params, variable: 'exportStart', name: 'Start Export', type: 'function' }
  ]}
];