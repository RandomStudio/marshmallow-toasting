const bleno = require('@abandonware/bleno');

const deviceName = 'campfire';
const advertisingInterval = 100; // 100ms advertising interval

bleno.on('stateChange', (state) => {
  console.log(`State change: ${state}`);
  if (state === 'poweredOn') {

    bleno.startAdvertising(deviceName, [], (error) => {
      if (error) console.log(error);
    });


  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (error) => {
  console.log('Advertising start:');
  console.log(`  error: ${error ? error : 'none'}`);
  if (error) {
    return
  }
  // Setup your BLE service and characteristics here
  console.log('Successfully started advertising as a BLE beacon with the name "campfire".');
  console.log('update')
});

