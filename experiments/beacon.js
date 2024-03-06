const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();

// Set an Event handler for becons
scanner.onadvertisement = (ad) => {
  if (ad.iBeacon.uuid !== '7D0D9B66-0554-4CCF-A6E4-ADE123256969') {
    return;
  }
  console.log(JSON.stringify(ad, null, '  '));
};

// Start scanning
scanner.startScan().then(() => {
  console.log('Started to scan.');
}).catch((error) => {
  console.error(error);
});