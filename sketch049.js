// Grid Noise Wave
// Connected grid points oscillating with noise

const params = {
  cols: 40,
  rows: 20,
  margin: 100,
  noiseScale: 0.05,
  noiseSpeed: 0.02,
  noiseScrollX: 0.0,
  noiseScrollY: 0.0,
  noiseAmp: 50,
  pointSize: 4,
  lineWidth: 1,
  showPoints: true,
  showLines: true, // Global toggle
  showHorzLines: true,
  showVertLines: true,
  colorMode: 'Cyan', // Cyan, Magenta, White, Rainbow
  bgColor: '#000000',
  blendMode: 'BLEND', // BLEND, ADD
  exportFrames: 600,
  exportStart: () => startExport(),
};

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
  blendMode(BLEND);
  
  push();
  fill(params.bgColor);
  noStroke();
  rect(width/2, height/2, width, height);
  pop();

  if (params.blendMode === 'ADD') blendMode(ADD);
  else blendMode(BLEND);
  
  let drawW = width - params.margin * 2;
  let drawH = height - params.margin * 2;
  let cellW = drawW / params.cols;
  let cellH = drawH / params.rows;
  
  time += params.noiseSpeed;

  let hueVal, satVal, briVal;
  
  if (params.colorMode === 'Cyan') {
    hueVal = 180; satVal = 100; briVal = 100;
  } else if (params.colorMode === 'Magenta') {
    hueVal = 300; satVal = 100; briVal = 100;
  } else if (params.colorMode === 'White') {
    hueVal = 0; satVal = 0; briVal = 100;
  }

  // Pre-calculate grid points to optimize performance
  const gridPoints = [];
  for (let y = 0; y <= params.rows; y++) {
    const row = [];
    for (let x = 0; x <= params.cols; x++) {
      row.push(getPos(x, y, cellW, cellH));
    }
    gridPoints.push(row);
  }

  for (let y = 0; y <= params.rows; y++) {
    for (let x = 0; x <= params.cols; x++) {
       let p = gridPoints[y][x];
       
       // Color calculation for Rainbow
       if (params.colorMode === 'Rainbow') {
         hueVal = (x * 2 + y * 5 + time * 50) % 360;
         satVal = 80;
         briVal = 100;
       }

       if (params.showLines) {
         noFill();
         stroke(hueVal, satVal, briVal, 1);
         strokeWeight(params.lineWidth);
         
         if (params.showHorzLines && x < params.cols) {
           let pRight = gridPoints[y][x+1];
           line(p.x, p.y, pRight.x, pRight.y);
         }
         if (params.showVertLines && y < params.rows) {
           let pDown = gridPoints[y+1][x];
           line(p.x, p.y, pDown.x, pDown.y);
         }
       }
       
       if (params.showPoints) {
         noStroke();
         fill(hueVal, satVal, briVal);
         ellipse(p.x, p.y, params.pointSize);
       }
    }
  }

  // Export logic
  if (isExporting) {
    saveCanvas('grid_noise_' + exportSessionID + '_' + nf(exportCount + 1, 3), 'png');
    exportCount++;
    if (exportCount >= exportMax) {
      isExporting = false;
      console.log("Export finished");
    }
  }
}

function getPos(x, y, cellW, cellH) {
  let bx = params.margin + x * cellW;
  let by = params.margin + y * cellH;
  
  let timeOffset = time + y * params.noiseScrollY + x * params.noiseScrollX;
  let dx = 0;
  let dy = 0;
  let amp = params.noiseAmp;
  let scale = params.noiseScale;
  let t = timeOffset;
  
  // 複数のノイズを合成 (Fractal Brownian Motion)
  for (let i = 0; i < 3; i++) {
    let n1 = noise(x * scale, y * scale, t);
    let n2 = noise(x * scale + 1000, y * scale + 1000, t);
    dx += (n1 - 0.5) * 2 * amp;
    dy += (n2 - 0.5) * 2 * amp;
    amp *= 0.5;
    scale *= 2.0;
    t *= 1.5;
  }
  
  return { x: bx + dx, y: by + dy };
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
  { folder: 'Grid', contents: [
    { object: params, variable: 'cols', min: 1, max: 320, step: 1, name: 'Columns' },
    { object: params, variable: 'rows', min: 1, max: 180, step: 1, name: 'Rows' },
    { object: params, variable: 'margin', min: -200, max: 400, name: 'Margin' },
  ]},
  { folder: 'Noise', contents: [
    { object: params, variable: 'noiseScale', min: 0.001, max: 0.5, name: 'Scale' },
    { object: params, variable: 'noiseSpeed', min: 0.0, max: 0.1, name: 'Speed' },
    { object: params, variable: 'noiseScrollX', min: -0.1, max: 0.1, name: 'Scroll X' },
    { object: params, variable: 'noiseScrollY', min: -0.1, max: 0.1, name: 'Scroll Y' },
    { object: params, variable: 'noiseAmp', min: 0, max: 200, name: 'Amplitude' },
  ]},
  { folder: 'Style', contents: [
    { object: params, variable: 'pointSize', min: 0, max: 20, name: 'Point Size' },
    { object: params, variable: 'lineWidth', min: 0.1, max: 10, name: 'Line Width' },
    { object: params, variable: 'showPoints', name: 'Show Points' },
    { object: params, variable: 'showHorzLines', name: 'Horizontal Lines' },
    { object: params, variable: 'showVertLines', name: 'Vertical Lines' },
    { object: params, variable: 'colorMode', options: ['Cyan', 'Magenta', 'White', 'Rainbow'], name: 'Color Mode' },
    { object: params, variable: 'blendMode', options: ['BLEND', 'ADD'], name: 'Blend Mode' },
    { object: params, variable: 'bgColor', type: 'color', name: 'Background' }
  ]},
  { folder: 'Export', contents: [
    { object: params, variable: 'exportFrames', min: 60, max: 1200, step: 1, name: 'Frames' },
    { object: params, variable: 'exportStart', name: 'Start Export', type: 'function' }
  ]}
];