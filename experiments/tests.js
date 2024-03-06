const noble = require('@abandonware/noble');
const { createCanvas } = require('canvas');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const targetDeviceId = '7872f654159cacc912b2da45df8da5dc';
const distances = [0.25, 0.5, 1, 2, 5]; // Distances in meters
let allPlotData = {}; // Store data for all distances
const scanDuration = 60000; // 5 minutes in milliseconds
const colors = ['#FF0000', '#00FF00', '#0000FF', '#0faeb0', '#FF00FF']; // Different colors for each line

const canvasWidth = 800;
const canvasHeight = 400;
const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

async function scanForRSSI(distance) {
  return new Promise((resolve, reject) => {
    console.log(`Scanning for RSSI at ${distance} meters. Please wait...`);
    let plotData = []; // Reset plot data for the new scan
    let rawData = [];  // Array to store raw RSSI values for filtering

    noble.on('discover', (peripheral) => {
      if (peripheral?.advertisement?.localName !== 'Andrew’s AirPods Pro') {
        return;
      }
      console.log('Discovered device:', peripheral)
      if (peripheral.id === targetDeviceId) {
        rawData.push(peripheral.rssi);
        // Apply a simple moving average filter with a window size of 10
        if (rawData.length >= 10) {
          const sum = rawData.slice(-10).reduce((a, b) => a + b, 0);
          const average = sum / 10;
          plotData.push(average);
          console.log(average);
        }
      }
    });

    noble.startScanning();

    setTimeout(() => {
      noble.stopScanning();
      allPlotData[distance] = plotData; // Store filtered data for this distance
      resolve();
    }, scanDuration);
  });
}

function drawGraph(allData) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  Object.entries(allData).forEach(([distance, data], index) => {
    const color = colors[index % colors.length];
    ctx.strokeStyle = color;
    ctx.beginPath();

    data.forEach((rssi, dataIndex) => {
      const x = (dataIndex / data.length) * canvasWidth;
      const y = canvasHeight - ((rssi + 100) * 2); // Direct RSSI plotting without scaling

      if (dataIndex === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Label for this line
    ctx.font = '14px Arial';
    ctx.fillStyle = color;
    ctx.fillText(`RSSI at ${distance}m`, 50 + (index * 100), canvasHeight - 10);
  });

  // Draw Axes
  drawAxes();
}

function drawAxes() {
  const yAxisLength = canvasHeight - 20; // Adjust as needed for margin
  const xAxisLength = canvasWidth - 40; // Adjust as needed for margin
  const tickLength = 5; // Length of the ticks on the axis
  const numberOfTicks = 10; // Number of ticks on the Y-axis
  const rssiRange = [-100, 0]; // Typical RSSI range from -100 to 0 dBm
  const rssiStep = (rssiRange[1] - rssiRange[0]) / numberOfTicks; // Step between each tick

  ctx.strokeStyle = '#000';
  ctx.beginPath();
  // Y-Axis
  ctx.moveTo(40, 0);
  ctx.lineTo(40, yAxisLength);
  // X-Axis
  ctx.moveTo(40, yAxisLength);
  ctx.lineTo(40 + xAxisLength, yAxisLength);
  ctx.stroke();

  // Drawing Y-axis ticks and labels
  for (let i = 0; i <= numberOfTicks; i++) {
    const y = (i / numberOfTicks) * yAxisLength;
    const rssiValue = rssiRange[0] + (i * rssiStep);

    // Draw tick
    ctx.moveTo(35, yAxisLength - y);
    ctx.lineTo(40, yAxisLength - y);
    ctx.stroke();

    // Draw label
    ctx.fillText(`${rssiValue} dBm`, 0, yAxisLength - y + 5);
  }

  // Labels for axes
  ctx.font = '12px Arial';
  ctx.fillText('Time', 40 + xAxisLength - 30, yAxisLength + 15);
  ctx.fillText('RSSI', 10, 15);
}

function saveCanvasToFile() {
  const out = fs.createWriteStream(__dirname + '/rssi_plot_combined.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('The combined RSSI plot has been saved.'));
}

async function waitForUserInput() {
  return new Promise((resolve) => {
    rl.question('Press Enter to continue to the next distance...', (answer) => {
      resolve();
    });
  });
}

async function startScanningProcess() {
  for (let distance of distances) {
    await scanForRSSI(distance);
    if (distances.indexOf(distance) < distances.length - 1) {
      await waitForUserInput();
    }
  }
  drawGraph(allPlotData);
  saveCanvasToFile();
  rl.close();
}

startScanningProcess();
