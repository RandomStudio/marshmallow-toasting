const noble = require('@abandonware/noble');

noble.on('stateChange', async (state) => {
  if (state === 'poweredOn') {
    console.log('Scanning...');
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const deviceName = peripheral.advertisement.localName || 'Unknown';
  const deviceId = peripheral.id;
  if (deviceName !== 'AirPods Pro') {
    return;
  }
  console.log(`Device found: ${deviceName} (ID: ${deviceId})`, peripheral);
});

