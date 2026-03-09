// Falling Particles
// Particles pouring down from top

const params = {
  particleCount: 2000,
  spawnRate: 10,
  speed: 8.0,
  wind: 0.0,
  turbulence: 0.5,
  size: 2,
  lengthScale: 1.0, // 速度に対する長さの倍率
  colorMode: 'Cyan', // Cyan, Matrix, Fire, White, Rainbow
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
  let c = createCanvas(1920, 1080);
  pixelDensity(1);
  
  c.style('width', '100%');
  c.style('height', '100%');
  c.style('object-fit', 'contain');
  
  colorMode(HSB, 360, 100, 100, 1.0);
  rectMode(CENTER);
}

function draw() {
  // Background
  blendMode(BLEND);
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
  
  // Update & Draw
  if (params.blendMode === 'ADD') blendMode(ADD);
  else blendMode(BLEND);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
  
  time += 0.01;

  // Export logic
  if (isExporting) {
    saveCanvas('falling_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(-width * 0.5, width * 1.5), -random(50, 200)); // 画面上部外から開始
    this.vel = createVector(0, random(0.5, 1.5) * params.speed);
    this.size = random(0.5, 1.5) * params.size;
    this.life = 1.0;
    
    if (params.colorMode === 'Rainbow') {
      this.hue = (frameCount * 0.5 + random(30)) % 360;
      this.sat = 80;
    } else if (params.colorMode === 'Cyan') {
      this.hue = random(160, 200);
      this.sat = 80;
    } else if (params.colorMode === 'Matrix') {
      this.hue = random(100, 140); // Green
      this.sat = 90;
    } else if (params.colorMode === 'Fire') {
      this.hue = random(0, 40);
      this.sat = 90;
    } else if (params.colorMode === 'White') {
      this.hue = 0;
      this.sat = 0;
    } else if (params.colorMode === 'Cyan+Red') {
      this.hue = random() < 0.5 ? random(170, 190) : random(340, 360);
      this.sat = 80;
    }
  }
  
  update() {
    // 風とタービュランス
    let n = noise(this.pos.x * 0.005, this.pos.y * 0.005, time * 0.5);
    let turbX = (n - 0.5) * params.turbulence * 2;
    
    this.pos.x += params.wind + turbX;
    this.pos.y += this.vel.y;
    
    // 画面外判定（下端を超えたら死亡）
    if (this.pos.y > height + 100) {
      this.life = 0;
    }
  }
  
  display() {
    let len = this.vel.y * params.lengthScale;
    
    strokeWeight(this.size);
    stroke(this.hue, this.sat, 100, this.life);
    
    // 速度に応じた線を描画
    line(this.pos.x, this.pos.y, this.pos.x - params.wind * 0.5, this.pos.y - len);
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
    { object: params, variable: 'particleCount', min: 100, max: 25000, step: 100, name: 'Max Particles' },
    { object: params, variable: 'spawnRate', min: 1, max: 100, step: 1, name: 'Spawn Rate' },
    { object: params, variable: 'speed', min: 1.0, max: 20.0, name: 'Speed' },
    { object: params, variable: 'wind', min: -5.0, max: 5.0, name: 'Wind' },
    { object: params, variable: 'turbulence', min: 0, max: 15.0, name: 'Turbulence' },
    { object: params, variable: 'clear', name: 'Clear', type: 'function' }
  ]},
  { folder: 'Style', contents: [
    { object: params, variable: 'size', min: 0.5, max: 10, name: 'Thickness' },
    { object: params, variable: 'lengthScale', min: 0.1, max: 5.0, name: 'Length Scale' },
    { object: params, variable: 'colorMode', options: ['Cyan', 'Matrix', 'Fire', 'White', 'Rainbow', 'Cyan+Red'], name: 'Color Mode' },
    { object: params, variable: 'blendMode', options: ['BLEND', 'ADD'], name: 'Blend Mode' },
    { object: params, variable: 'bgColor', type: 'color', name: 'Background' }
  ]},
  { folder: 'Export', contents: [
    { object: params, variable: 'exportFrames', min: 60, max: 1200, step: 1, name: 'Frames' },
    { object: params, variable: 'exportStart', name: 'Start Export', type: 'function' }
  ]}
];